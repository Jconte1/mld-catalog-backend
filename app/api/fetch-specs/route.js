// src/app/api/fetch-specs/route.js
import JSZip from "jszip";
import { ingestProductsFromXml } from "../../../lib/catalogue/ingestProductsFromXml";

const BASE_FEED_URL =
  "https://demo37861.appliances.dev.rwsgateway.com/_CGI/specs.zip?PW=-26160157";

// ✅ All allowed brand codes
const ALLOWED_MAN_CODES = new Set([
  "TMF",
  "VHOOD",
  "BEST",
  "LNX",
  "FULGORM",
  "PERLI",
  "WOLF",
  "AMN",
  "AVA",
  "BEKO",
  "BER",
  "BLU",
  "BOSCH",
  "DAC",
  "CA_ELECTROLUX",
  "FPK",
  "FRIG",
  "GAG",
  "GE",
  "HAR",
  "JEN",
  "KTA",
  "LG",
  "LBR",
  "MAR",
  "MAY",
  "MIE",
  "MONOGRAM",
  "PERLI",
  "SAMSUNG",
  "SKS",
  "SMEG",
  "SUBZ",
  "SUM",
  "THE",
  "ULN",
  "VIK",
  "WHIRL",
  "ALFCO",
  "AGA",
  "ASK",
  "AZUR",
  "BGRL",
  "BLOMB",
  "BROILKING",
  "HZK",
  "ILVE",
  "CAFEA",
  "CAVAVIN",
  "COYOTE",
  "DAN",
  "DLTHT",
  "DCS",
  "ELICA",
  "FMGC",
  "GLADIATOR",
  "HES",
  "SCO",
  "KMZ",
  "ULN",
  "LYNX",
  "ZEP",
  "TWINEGL",
  "VER",
  "SHP",
  "CA_FPK",
  "CA_TH",
  "CA_CAFEA",
  "CA_BER",
  "CA_LG"

]);

export const dynamic = "force-dynamic"; // always fetch fresh feed
export const revalidate = 0;            // don't cache this route at all

async function fetchAndIngestForMan(man) {
  const feedUrl = `${BASE_FEED_URL}&MAN=${encodeURIComponent(man)}`;
  console.log(`🌐 Fetching specs.zip for MAN=${man} → ${feedUrl}`);

  // 1) Download specs.zip for this brand
  const res = await fetch(feedUrl, {
    cache: "no-store", // prevent Next.js data cache (2MB limit)
  });

  if (!res.ok) {
    throw new Error(
      `Failed to download specs.zip for MAN=${man}: ${res.status} ${res.statusText}`
    );
  }

  const zipData = await res.arrayBuffer();
  console.log(
    `📦 Downloaded specs.zip for MAN=${man}, size=${zipData.byteLength} bytes`
  );

  // 2) Unzip and grab the XML file
  const zip = await JSZip.loadAsync(zipData);

  const xmlFileName = Object.keys(zip.files).find((name) =>
    name.toLowerCase().endsWith(".xml")
  );

  if (!xmlFileName) {
    throw new Error(`No XML file found in specs.zip for MAN=${man}`);
  }

  console.log(`📄 Found XML inside zip for MAN=${man}: ${xmlFileName}`);

  const xmlString = await zip.files[xmlFileName].async("string");
  console.log(`📑 XML string length for MAN=${man}:`, xmlString.length);

  // 3) Hand off to ingestion pipeline (parse + upsert into Prisma)
  await ingestProductsFromXml(xmlString);

  console.log(`✅ Finished ingest for MAN=${man}`);
}

export async function GET(req) {
  // Only run when called by Vercel Cron (or your manual tools that set this header)
  if (req.headers.get("x-vercel-cron") !== "1") {
    return new Response("ignored");
  }

  const { searchParams } = new URL(req.url);
  const manRaw = searchParams.get("man"); // e.g. "AMN", "ALL", etc.
  const man = manRaw ? manRaw.toUpperCase() : null;

  try {
    // ── Mode 1: Single brand (?man=AMN) ──────────────────────────────
    if (man && man !== "ALL") {
      if (!ALLOWED_MAN_CODES.has(man)) {
        console.error(`❌ Invalid MAN code "${man}" – not in allowed list`);
        return new Response(`invalid "man" code: ${man}`, { status: 400 });
      }

      await fetchAndIngestForMan(man);
      return new Response(`ok: ${man}`);
    }

    // ── Mode 2: ALL brands (either ?man=ALL or no ?man) ──────────────
    const allCodes = Array.from(ALLOWED_MAN_CODES);
    const summary = {
      attempted: allCodes.length,
      successes: [],
      failures: [],
    };

    for (const code of allCodes) {
      try {
        await fetchAndIngestForMan(code);
        summary.successes.push(code);
      } catch (err) {
        console.error(`❌ Error ingesting MAN=${code}:`, err);
        summary.failures.push({ man: code, error: String(err.message || err) });
      }
    }

    const status = summary.failures.length ? 207 : 200; // 207 = multi-status-ish
    return new Response(JSON.stringify(summary, null, 2), {
      status,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    console.error("❌ Error in /api/fetch-specs:", err);
    return new Response("internal error", { status: 500 });
  }
}
