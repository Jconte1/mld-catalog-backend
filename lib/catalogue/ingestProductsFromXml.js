// src/lib/catalogue/ingestProductsFromXml.js
import { XMLParser } from "fast-xml-parser";
import prisma from "../prisma";
import { predefinedTypes } from "../../src/utils/productTypes";
import { filterValueExtractors } from "../../src/utils/filterMapper";

// Map catalogue type → width extractor name in filterValueExtractors
const widthExtractorByType = {
  MICROWAVE: "MicrowaveWidth",
  RANGES: "RangeWidth",
  "COOKTOPS AND RANGETOPS": "CooktopWidth",
  REFRIGERATORS: "RefrigWidth",
  FREEZERS: "FreezerWidth", // 👈 added for new FreezerWidth extractor
  DISHWASHERS: "DishwasherWidth",
  LAUNDRY: "LaundryWidth",
  "ICE MAKERS": "IceMakerWidth",
  "WARMING DRAWERS": "WarmingDrawerWidth",
  "BUILT IN OVENS": "OvenWidth",
  "OUTDOOR GRILLS": "BbqWidth",
  "COFFEE SYSTEMS": "CoffeeWidth",
  VENTILATION: "HoodWidth",
};

// Small helpers
const ensureArray = (value) =>
  Array.isArray(value) ? value : value == null ? [] : [value];

function normalizeSpecTable(marketing_copy = {}) {
  // If it's already in the final [{ section_title, key_value_pairs }] shape, keep it.
  if (
    Array.isArray(marketing_copy.spec_table_as_key_value_pairs) &&
    marketing_copy.spec_table_as_key_value_pairs.length &&
    marketing_copy.spec_table_as_key_value_pairs[0]?.key_value_pairs
  ) {
    return marketing_copy.spec_table_as_key_value_pairs;
  }

  const container = marketing_copy.spec_table_as_key_value_pairs;
  if (!container) return [];

  const pairs = ensureArray(container.spec_table_pair);
  if (!pairs.length) return [];

  const key_value_pairs = pairs
    .map((pair) => ({
      key: pair?.key != null ? String(pair.key).trim() : "",
      value: pair?.value != null ? String(pair.value).trim() : "",
    }))
    .filter((kv) => kv.key);

  if (!key_value_pairs.length) return [];

  return [
    {
      section_title: null,
      key_value_pairs,
    },
  ];
}

function normalizeParagraphDescription(raw) {
  if (!raw || typeof raw !== "string") return raw;

  let s = raw;

  // Convert the pseudo-markup used in the feed into real HTML tags
  const replacements = [
    [/\(BR\)/gi, "<br />"],
    [/\(B\)/gi, "<b>"],
    [/\(\/B\)/gi, "</b>"],
    [/\(P\)/gi, "<p>"],
    [/\(\/P\)/gi, "</p>"],
    [/\(UL\)/gi, "<ul>"],
    [/\(\/UL\)/gi, "</ul>"],
    [/\(LI\)/gi, "<li>"],
    [/\(\/LI\)/gi, "</li>"],
  ];

  for (const [pattern, replacement] of replacements) {
    s = s.replace(pattern, replacement);
  }

  return s;
}

function normalizeMedia(media = {}) {
  const pdfsArray = ensureArray(media?.pdfs?.pdf);
  const imagesArray = ensureArray(media?.images?.image);

  return {
    images: {
      image: imagesArray.map((img) => ({
        file_name: img?.file_name ?? "",
        full_size_url: img?.full_size_url ?? "",
        thumbnail_url: img?.thumbnail_url ?? "",
      })),
    },
    pdfs: {
      pdf: pdfsArray.map((pdf) => ({
        url: pdf?.url ?? "",
        file_name: pdf?.file_name ?? "",
        description: pdf?.description ?? "",
      })),
    },
  };
}

function normalizeClassification(classification = {}) {
  // Force related_items.related_item_key into an array
  const relatedRaw = classification?.related_items?.related_item_key;
  const relatedArr = ensureArray(relatedRaw);

  const related_items =
    relatedArr.length > 0
      ? {
          related_item_key: relatedArr,
        }
      : undefined;

  return {
    ...classification,
    ...(related_items ? { related_items } : {}),
  };
}

// 🔹 MODEL + SLUG HELPERS 🔹

function normalizeModelIdentifier(classification = {}) {
  const { manufacturer_pn, pn } = classification;

  // Take manufacturer_pn first if it exists, otherwise pn
  let raw =
    manufacturer_pn != null && String(manufacturer_pn).trim() !== ""
      ? String(manufacturer_pn).trim()
      : pn != null && String(pn).trim() !== ""
      ? String(pn).trim()
      : null;

  if (!raw) return null;

  // Strip dashes and slashes ONLY, keep other chars; then uppercase
  const cleaned = raw.replace(/[-/]/g, "");
  return cleaned.toUpperCase();
}

function toSlugPart(value) {
  if (!value) return "";
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildProductSlug(brand, major, minor, modelNormalized) {
  const parts = [
    toSlugPart(brand),
    toSlugPart(major),
    toSlugPart(minor),
    toSlugPart(modelNormalized),
  ].filter(Boolean);

  const joined = parts.join("-");
  // Collapse any accidental multiple dashes
  return joined.replace(/-+/g, "-");
}

// This builds the JSON blob that goes into products.data
function transformSpecToStoredData(rawSpec) {
  const classification = normalizeClassification(rawSpec.classification || {});
  const media = normalizeMedia(rawSpec.media || {});
  const managed_data = rawSpec.managed_data || {};
  const disclosures = rawSpec.disclosures || {};

  const marketing_raw = rawSpec.marketing_copy || {};
  const paragraph_description = normalizeParagraphDescription(
    marketing_raw.paragraph_description
  );
  const spec_table_as_key_value_pairs = normalizeSpecTable(marketing_raw);

  const {
    spec_table_html, // we intentionally drop the raw HTML table
    ...restMarketing
  } = marketing_raw;

  const marketing_copy = {
    ...restMarketing,
    paragraph_description,
    spec_table_as_key_value_pairs,
  };

  return {
    classification,
    marketing_copy,
    media,
    managed_data,
    disclosures,
    author_timestamp: rawSpec.author_timestamp || null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter mapper integration
// ─────────────────────────────────────────────────────────────────────────────

// Decide if an extractor should run for a given product type
function shouldRunExtractorForType(extractorName, productType) {
  if (!productType) return true; // if we don't know type yet, let it run

  const t = productType.toUpperCase();
  const n = extractorName.toLowerCase();

  // Always-run generic extractors
  if (n === "fueltype") return true;

  // Type-specific families
  if (n.startsWith("refrig")) return t === "REFRIGERATORS";
  if (n.startsWith("freezer")) return t === "FREEZERS";
  if (n.startsWith("dishwasher")) return t === "DISHWASHERS" || t === "DISHWASHER";
  if (n.startsWith("hood")) return t === "VENTILATION";
  if (n.startsWith("laundry")) return t === "LAUNDRY";
  if (n.startsWith("microwave")) return t === "MICROWAVE";
  if (n.startsWith("range")) return t === "RANGES";
  if (n.startsWith("ice")) return t === "ICE MAKERS";
  if (n.startsWith("warming")) return t === "WARMING DRAWERS";
  if (n.startsWith("coffee")) return t === "COFFEE SYSTEMS";
  if (n.startsWith("bbq")) return t === "OUTDOOR GRILLS";
  if (n.startsWith("cooktop")) return t === "COOKTOPS AND RANGETOPS";
  if (n.startsWith("oven")) return t === "BUILT IN OVENS";

  // Default: allow it to run for all types
  return true;
}

// Use your 2k-line filter mapper to derive DB filter columns.
function deriveFilterColumnsFromData(productData, productType) {
  const extracted = {};
  let widthLabel = null;

  // 1) Run all non-width extractors (features, productType, configuration, fuelType, etc.)
  for (const [name, extractor] of Object.entries(filterValueExtractors || {})) {
    if (typeof extractor !== "function") continue;

    // Width extractors are handled separately below
    if (/width$/i.test(name)) continue;

    // 🔒 Gate by type so fridges don't hit dishwasher extractors, etc.
    if (!shouldRunExtractorForType(name, productType)) continue;

    try {
      const rawResult = extractor(productData);
      if (rawResult == null) continue;

      // Mirror your backfill behavior:
      // - if array → keep as is
      // - if single value → wrap in array
      let values = Array.isArray(rawResult) ? rawResult : [rawResult];

      // ✅ Normalize: drop null/empty and force lowercase for consistency
      values = values
        .filter((v) => v != null && String(v).trim() !== "")
        .map((v) => String(v).trim().toLowerCase());

      if (values.length > 0) {
        extracted[name] = values;
      }
    } catch (err) {
      console.error(`❌ Filter extractor '${name}' crashed:`, err);
    }
  }

  // 2) Width: use the type → extractor map, keep original casing for labels
  if (productType) {
    const widthExtractorName = widthExtractorByType[productType];
    const widthExtractor =
      widthExtractorName && filterValueExtractors[widthExtractorName];

    if (typeof widthExtractor === "function") {
      try {
        let widthRaw = widthExtractor(productData);
        if (Array.isArray(widthRaw)) widthRaw = widthRaw[0];

        if (widthRaw != null) {
          const s = String(widthRaw).trim();
          if (s) widthLabel = s; // don't force lowercase; keep your label format
        }
      } catch (err) {
        console.error(`❌ Width extractor '${widthExtractorName}' crashed:`, err);
      }
    }
  }

  const featuresSet = new Set();
  const fuelTypeSet = new Set();
  const configurationSet = new Set();
  const productTypeSet = new Set();

  for (const [name, values] of Object.entries(extracted)) {
    if (!Array.isArray(values)) continue;

    if (/FuelType$/i.test(name)) {
      values.forEach((v) => fuelTypeSet.add(v));
    } else if (/ProductType$/i.test(name)) {
      values.forEach((v) => productTypeSet.add(v));
    } else if (/Configuration$/i.test(name)) {
      values.forEach((v) => configurationSet.add(v));
    } else if (/Features?$/i.test(name)) {
      values.forEach((v) => featuresSet.add(v));
    } else {
      // 🔇 Explicitly ignore Brand so it doesn't become a feature
      if (!/^brand$/i.test(name)) {
        // Anything else we treat as a generic "feature" for now
        values.forEach((v) => featuresSet.add(v));
      }
    }
  }

  return {
    features: Array.from(featuresSet),
    fuelType: Array.from(fuelTypeSet),
    configuration: Array.from(configurationSet),
    productType: Array.from(productTypeSet),
    width: widthLabel,
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// Existing type logic (unchanged, just reused)
// ─────────────────────────────────────────────────────────────────────────────

function normalizeTypeAndCategory(major, minor, classification, marketing_copy) {
  const majorUpper = major?.toUpperCase() || "";
  const minorUpper = minor?.toUpperCase() || "";
  const shortDes = marketing_copy?.short_description?.toUpperCase() || "";
  const major_code = classification?.major_class_code?.toUpperCase() || "";
  const minor_description =
    classification?.minor_class_description?.toUpperCase() || "";

  console.log("🧮 normalizeTypeAndCategory input:", {
    major,
    minor,
    majorUpper,
    minorUpper,
    major_code,
    minor_description,
    shortDes,
  });

  // Default: treat everything as APPLIANCES unless explicitly changed later
  let category = "appliances";

  if (!majorUpper && !minorUpper) {
    console.log("➡️ No major/minor, returning null type with default category");
    return { type: null, category };
  }

  // APPLIANCE TYPE LOGIC

  if (minorUpper.includes("MICROWAVE")) {
    console.log("➡️ Matched MICROWAVE, type=MICROWAVE, category=", category);
    return { type: "MICROWAVE", category };
  }

  if (minorUpper.includes("WARMING DRAWER")) {
    console.log(
      "➡️ Matched WARMING DRAWER, type=WARMING DRAWERS, category=",
      category
    );
    return { type: "WARMING DRAWERS", category };
  }

  if (minorUpper.includes("COOKTOP") || minorUpper.includes("RANGETOP")) {
    console.log(
      "➡️ Matched COOKTOP/RANGETOP, type=COOKTOPS AND RANGETOPS, category=",
      category
    );
    return { type: "COOKTOPS AND RANGETOPS", category };
  }

  if (minorUpper.includes("OVEN")) {
    console.log("➡️ Matched OVEN, type=BUILT IN OVENS, category=", category);
    return { type: "BUILT IN OVENS", category };
  }

  if (majorUpper.includes("SMALL APPLIANCES")) {
    if (minorUpper.includes("WARMING DRAWER")) {
      console.log(
        "➡️ SMALL APPLIANCES + WARMING DRAWER, type=WARMING DRAWERS"
      );
      return { type: "WARMING DRAWERS", category };
    }
    if (minorUpper.includes("COFFEE")) {
      console.log(
        "➡️ SMALL APPLIANCES + COFFEE, type=COFFEE SYSTEMS, category=",
        category
      );
      return { type: "COFFEE SYSTEMS", category };
    }
    console.log("➡️ SMALL APPLIANCES fallback, type=MISC, category=", category);
    return { type: "MISC", category };
  }

  if (majorUpper.includes("RANGES") || minorUpper.includes("RANGE")) {
    console.log("➡️ Matched RANGES, type=RANGES, category=", category);
    return { type: "RANGES", category };
  }

  if (majorUpper.includes("REFRIGERATORS")) {
    if (
      minorUpper.includes("REFRIGERATED DRAWER") &&
      shortDes.includes("FREEZER")
    ) {
      console.log(
        "➡️ Matched REFRIGERATED DRAWER + FREEZER, type=FREEZERS, category=",
        category
      );
      return { type: "FREEZERS", category };
    }
    console.log(
      "➡️ Matched REFRIGERATORS, type=REFRIGERATORS, category=",
      category
    );
    return { type: "REFRIGERATORS", category };
  }

  if (majorUpper.includes("FREEZERS")) {
    if (minorUpper.includes("ICE MAKERS")) {
      console.log(
        "➡️ Matched FREEZERS + ICE MAKERS, type=ICE MAKERS, category=",
        category
      );
      return { type: "ICE MAKERS", category };
    }
    console.log("➡️ Matched FREEZERS, type=FREEZERS, category=", category);
    return { type: "FREEZERS", category };
  }

  if (majorUpper.includes("DISHWASHERS")) {
    console.log(
      "➡️ Matched DISHWASHERS, type=DISHWASHERS, category=",
      category
    );
    return { type: "DISHWASHERS", category };
  }

  if (major_code.includes("BBQ") || minorUpper.includes("BARBEQUES")) {
    console.log(
      "➡️ Matched BBQ/BARBEQUES, type=OUTDOOR GRILLS, category=",
      category
    );
    return { type: "OUTDOOR GRILLS", category };
  }

  if (majorUpper.includes("HOODS")) {
    console.log("➡️ Matched HOODS, type=VENTILATION, category=", category);
    return { type: "VENTILATION", category };
  }

  if (majorUpper.includes("LAUNDRY")) {
    console.log("➡️ Matched LAUNDRY, type=LAUNDRY, category=", category);
    return { type: "LAUNDRY", category };
  }

  // PLUMBING detection for disposers / dispensers
  if (
    minor_description.includes("DISPOSER") ||
    minor_description.includes("DISPENSER")
  ) {
    category = "plumbing";
    console.log(
      "➡️ Matched DISPOSER/DISPENSER, type=DISPOSER / DISPENSER ACCESSORIES, category=",
      category
    );
    return { type: "DISPOSER / DISPENSER ACCESSORIES", category };
  }

  if (minorUpper.includes("ACCESSORIES")) {
    console.log("➡️ Matched ACCESSORIES, type=MISC, category=", category);
    return { type: "MISC", category };
  }

  // fallback: use your predefinedTypes list
  for (const type of predefinedTypes) {
    if (
      (majorUpper.includes(type) || minorUpper.includes(type)) &&
      !minorUpper.includes("ACCESSORIES")
    ) {
      console.log(
        "➡️ Matched predefined type=",
        type,
        "category still=",
        category
      );
      return { type, category };
    }
  }

  console.log("➡️ Fallback MISC, category=", category);
  return { type: "MISC", category };
}

function normalizeType(major, minor, classification, marketing_copy) {
  return normalizeTypeAndCategory(
    major,
    minor,
    classification,
    marketing_copy
  ).type;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN INGEST
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ingests a full RWS XML string:
 * - parses XML
 * - iterates product_specs
 * - derives core columns
 * - builds normalized JSON blob for products.data
 * - runs filter mappers to populate features/fuelType/configuration/productType/width
 */
export async function ingestProductsFromXml(xmlString) {
  console.log(
    "📥 ingestProductsFromXml: received XML string length=",
    xmlString?.length
  );

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
  });

  let parsed;
  try {
    parsed = parser.parse(xmlString);
    console.log("✅ XML parsed. Top-level keys:", Object.keys(parsed || {}));
  } catch (err) {
    console.error("❌ XML parse error:", err);
    return;
  }

  const root = parsed.product_data || parsed;
  console.log(
    "📦 Root object keys:",
    root ? Object.keys(root) : "root is null/undefined"
  );

  let specs = root?.product_specs;
  console.log(
    "📑 raw product_specs type:",
    specs ? (Array.isArray(specs) ? "array" : typeof specs) : "undefined/null"
  );

  // Handle possible double-wrapped shapes
  if (specs && !Array.isArray(specs) && specs.product_specs) {
    console.log("🔁 Detected double-wrapped product_specs, unwrapping");
    specs = specs.product_specs;
  }

  if (!specs) {
    console.warn("⚠️ No product_specs found in XML");
    return;
  }

  const specsArray = Array.isArray(specs) ? specs : [specs];
  console.log("📊 Total product_specs to ingest:", specsArray.length);

  for (const [index, spec] of specsArray.entries()) {
    console.log("\n──────────────");
    console.log("🧾 Processing spec index:", index);

    try {
      // Some feeds nest everything under <data>, some put classification at root
      const raw = spec.data || spec;
      console.log("🔍 raw spec keys:", Object.keys(raw || {}));

      const classification = raw.classification || {};
      const marketing_copy = raw.marketing_copy || {};

      console.log("📌 classification snapshot:", {
        pn: classification.pn,
        manufacturer_pn: classification.manufacturer_pn,
        brand_name: classification.brand_name,
        major_class_description: classification.major_class_description,
        minor_class_description: classification.minor_class_description,
        major_class_code: classification.major_class_code,
      });

      const major = classification.major_class_description || "";
      const minor = classification.minor_class_description || "";

      const { type, category } = normalizeTypeAndCategory(
        major,
        minor,
        classification,
        marketing_copy
      );
      console.log("✅ Derived type/category:", { type, category });

      // 🔹 Normalized model: strip dashes/slashes, uppercase
      const model = normalizeModelIdentifier(classification);

      const brand = classification.brand_name || null;

      // 🔹 Build slug from brand + major + minor + model
      const slug = buildProductSlug(brand, major, minor, model);

      console.log("🆔 Identifiers:", { slug, model });

      if (!slug || !model) {
        console.warn("⚠️ Skipping product with no usable slug/model:", {
          major,
          minor,
          brand,
        });
        continue;
      }

      // Build normalized JSON blob for `data`
      const data = transformSpecToStoredData(raw);

      // Build the object shape expected by filterMapper extractors
      const productForExtractors = {
        ...data,
        major,
        minor,
        brand,
        type,
      };

      // Run filter extractors on the normalized data to fill filter columns
      const {
        features = [],
        fuelType = [],
        configuration = [],
        productType = [],
        width = null,
      } = deriveFilterColumnsFromData(productForExtractors, type);

      console.log("📦 Final upsert payload (summary):", {
        slug,
        model,
        brand,
        major,
        minor,
        type,
        category: category || "APPLIANCES",
        width,
        featuresCount: features.length,
        fuelTypeCount: fuelType.length,
        configurationCount: configuration.length,
        productTypeCount: productType.length,
      });

      await prisma.products.upsert({
        where: { model }, // unique constraint on model
        update: {
          slug,
          brand,
          major,
          minor,
          type,
          category: category || "APPLIANCES",
          width,
          features,
          fuelType,
          configuration,
          productType,
          data,
        },
        create: {
          slug,
          model,
          brand,
          major,
          minor,
          type,
          category: category || "APPLIANCES",
          width,
          features,
          fuelType,
          configuration,
          productType,
          data,
        },
      });

      console.log("💾 Upsert SUCCESS for model:", model, "slug:", slug);
    } catch (err) {
      console.error("❌ Failed to upsert product from spec index", index, err);
      if (err?.meta) {
        console.error("   Prisma meta:", err.meta);
      }
    }
  }

  console.log("🏁 Finished ingestProductsFromXml run");
}
