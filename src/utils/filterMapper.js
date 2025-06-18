// src/catalogue/config/FilterMapper.js
import typeFeatureValues from "./typeFeatureValues.js"


export const filterValueExtractors = {

    // FuelType: (product) => {
    //     const description = product.marketing_copy?.short_description?.toLowerCase() || '';
    //     const minor_code = product.classification?.minor_class_code?.toUpperCase() || '';
    //     const major = product.classification?.major_class_description?.toLowerCase() || '';
    //     const minor = product.classification?.minor_class_description?.toLowerCase() || '';

    //     const types = [];

    //     if (minor_code.includes('BBQLP')) types.push('LP Gas');
    //     if (minor_code.includes('BBQNG')) types.push('Natural Gas');
    //     if (description.includes('dual fuel') || major.includes('dual fuel') || minor.includes('dual fuel')) {
    //         types.push('Dual Fuel');
    //     }
    //     if (description.includes('induction') || major.includes('induction') || minor.includes('induction')) {
    //         types.push('Induction');
    //     }
    //     if (description.includes('gas') || major.includes('gas') || minor.includes('gas')) {
    //         types.push('Gas');
    //     }
    //     if (description.includes('electric') || major.includes('electric') || minor.includes('electric')) {
    //         types.push('Electric');
    //     }

    //     return types.length > 0 ? types : null;
    // },


    // ProductType: (product) => {
    //     const typeFromSpecPairs = [];

    //     const specTable = product.marketing_copy?.spec_table_html || [];

    //     specTable.forEach(section => {
    //         section.key_value_pairs.forEach(pair => {
    //             const key = pair.key?.toLowerCase?.() || '';
    //             const value = pair.value?.toLowerCase?.() || '';
    //             if (key.includes('type')) {
    //                 typeFromSpecPairs.push(value);
    //             }
    //         });
    //     });

    //     const short = product.marketing_copy?.short_description?.toLowerCase?.() || '';
    //     const medium = product.marketing_copy?.medium_description?.toLowerCase?.() || '';
    //     const minorDes = product.classification?.minor_class_description?.toLowerCase?.() || '';

    //     // Combine all possible strings to scan
    //     const allText = [...typeFromSpecPairs, short, medium, minorDes].join(' ');

    //     const normalizedType = product.type?.toUpperCase?.();
    //     const possibleMatches = typeProductValues[normalizedType] || [];

    //     const matches = possibleMatches.filter(keyword => allText.includes(keyword.toLowerCase()));

    //     return matches.length ? matches : null;
    // },

    // FreezerProductType: (product) => {
    //     const code = product.classification?.minor_class_code?.toUpperCase() || "";
    //     const height = parseFloat(product.classification?.height);
    //     const short = product.marketing_copy?.short_description?.toLowerCase?.() || '';
    //     const medium = product.marketing_copy?.medium_description?.toLowerCase() || '';
    //     const paragraph = product.marketing_copy?.paragraph_description?.toLowerCase() || '';
    //     const minorDes = product.classification?.minor_class_description?.toLowerCase?.() || '';


    //     const allText = [short, medium, paragraph].join('');

    //     if (code === "DRAWER") return "Freezer Drawers";
    //     if (code === "CHFRZE" || allText.includes("chest")) return "Chest Freezer";
    //     if (code === "UPFRZE" && height < 36) return "Undercounter";
    //     if (code === "UPFRZE") return "Upright Freezer";

    //     return null;
    // },

    // DishwasherProductType: (product) => {
    //     console.log('🔍 classification:', product.classification);
    //     const code = product.classification?.minor_class_code?.toUpperCase() || "";
    //     const height = parseFloat(product.classification?.height);
    //     const short = product.marketing_copy?.short_description?.toLowerCase?.() || '';
    //     const medium = product.marketing_copy?.medium_description?.toLowerCase() || '';
    //     const paragraph = product.marketing_copy?.paragraph_description?.toLowerCase?.() || '';
    //     const minorDes = product.classification?.minor_class_description?.toLowerCase?.() || '';

    //     const color_code = (product.classification?.color_code_description || '').toLowerCase();
    //     const allText = [short, medium, paragraph, minorDes].join(' ');

    //     const types = [];

    //     // Check for built-in via class code
    //     if (code === "DWBI") types.push("built in dishwasher");
    //     if (color_code.includes("panel ready")) {
    //         types.push("panel ready");
    //       }

    //     // Drawer logic
    //     if (allText.includes("double") && allText.includes("drawer")) {
    //         types.push("double drawer");
    //     } else if (allText.includes("single") && allText.includes("drawer")) {
    //         types.push("single drawer");
    //     } else if (allText.includes("dishdrawer")) {
    //         types.push("single drawer"); // fallback if no single/double keyword
    //     }

    //     // Top control (match flexible wording)
    //     if (/(top\s*control|top\s*panel)/.test(allText)) {
    //         types.push("top control");
    //     }

    //     // Front control
    //     if (/(front\s*control|front\s*panel|controls\s*on\s*front)/.test(allText)) {
    //         types.push("front control");
    //     }

    //     return types.length > 0 ? types : null;
    // },

    // DishWasherFeatures: (product) => {
    //     const market_features = product.marketing_copy?.features?.feature?.join(' ').toLowerCase() || '';

    //     const image_features = product.marketing_copy?.image_features?.image_feature || [];
    //     const image_titles = image_features.map(f => f?.title?.toLowerCase() || '').join(' ');
    //     const image_description = image_features.map(f => f?.feature_description?.toLowerCase() || '').join(' ');

    //     const short = product.marketing_copy?.short_description?.toLowerCase() || '';
    //     const medium = product.marketing_copy?.medium_description?.toLowerCase() || '';
    //     const paragraph = product.marketing_copy?.paragraph_description?.toLowerCase() || '';

    //     const hierarchical = (product.marketing_copy?.hierarchical_features_html || '')
    //         .replace(/<[^>]*>/g, '')
    //         .toLowerCase();

    //     const allText = [
    //         market_features,
    //         image_titles,
    //         image_description,
    //         short,
    //         medium,
    //         paragraph,
    //         hierarchical
    //     ].join(' ');

    //     const features = [];

    //     // ✅ Third Rack Regexes
    //     const thirdRackRegexes = [
    //         /\bthird[-\s]?rack\b/,
    //         /\bthird[-\s]?level[-\s]?rack\b/,
    //         /\bexclusive\b.*\bthird\b.*\brack\b/,
    //         /\bflexload\b.*\bthird\b.*\brack\b/,
    //         /\badded rack in the bottom\b/,
    //         /\bthree full racks?\b/,
    //         /\bodd[-\s]?sized items.*third[-\s]?rack\b/,
    //     ];

    //     for (const regex of thirdRackRegexes) {
    //         if (regex.test(allText)) {
    //             features.push("third rack");
    //             break;
    //         }
    //     }

    //     // ✅ Self-Cleaning Regexes
    //     const selfCleaningRegexes = [
    //         /\bself[-\s]?clean(ing)?\b/,
    //         /\bself[-\s]?clean(ing)? filter\b/,
    //         /\bcleans itself\b/,
    //         /\bautomatic(ally)? cleans?\b/,
    //         /\bauto[-\s]?clean(ing)?\b/,
    //         /\bself[-\s]?clean(ing)? system\b/
    //     ];

    //     for (const regex of selfCleaningRegexes) {
    //         if (regex.test(allText)) {
    //             features.push("self-cleaning");
    //             break;
    //         }
    //     }

    //     const energyStarRegexes = [
    //         /\benergy\s*star\b/,
    //         /\benergy\s*star\s*qualified\b/,
    //         /\bmeets\s*energy\s*star\s*requirements\b/,
    //         /\bENERGY\s*STAR\s*compliant\b/
    //     ];

    //     for (const regex of energyStarRegexes) {
    //         if (regex.test(allText)) {
    //             features.push("energy star");
    //             break;
    //         }
    //     }

    //     const dryingKeywords = [
    //         /drying\s*system/i,
    //         /fan[-\s]*assisted\s*dry/i,
    //         /energy\s*saver\s*dry/i,
    //         /heat\s*dry/i,
    //         /no\s*heat\s*dry/i
    //     ];

    //     for (const regex of dryingKeywords) {
    //         if (
    //             regex.test(allText) ||
    //             regex.test(
    //                 (product.marketing_copy?.features?.feature || []).join(' ').toLowerCase()
    //             ) ||
    //             regex.test(
    //                 (product.marketing_copy?.image_features?.image_feature || [])
    //                     .map((f) => `${f.title} ${f.feature_description || ''}`)
    //                     .join(' ')
    //                     .toLowerCase()
    //             ) ||
    //             regex.test(product.marketing_copy?.hierarchical_features_html?.toLowerCase?.() || '')
    //         ) {
    //             features.push("drying system");
    //             break;
    //         }
    //     }

    //     const sanitaryRinseRegexes = [
    //         /\bsani(tary)?[-\s]?rinse\b/,
    //         /\bsanitize[-\s]?rinse\b/,
    //         /\bsanitary cycle\b/,
    //         /\brinse\b.*\b160\s*°?[fF]\b/,
    //         /\brinse\b.*\bhigh[-\s]?temp(erature)?\b/,
    //         /\bnsf[-\s]?certified\b.*\brinse\b/,
    //         /\brinse\b.*\bsanitize\b/
    //     ];

    //     for (const regex of sanitaryRinseRegexes) {
    //         if (regex.test(allText)) {
    //             features.push("sanitary rinse");
    //             break;
    //         }
    //     }

    //     const cutleryTrayRegexes = [
    //         /\bcutlery\s*tray\b/,
    //         /\bcutlery\s*(drawer|rack)\b/,
    //         /\bseparate\s*cutlery\b.*\b(tray|rack|section)\b/,
    //         /\bthird\b.*\bcutlery\b.*\b(tray|rack)\b/,
    //         /\bcutlery\s*organization\b/,
    //         /\butensil\s*(tray|rack)\b/,
    //     ];
        
    //     for (const regex of cutleryTrayRegexes) {
    //         if (regex.test(allText)) {
    //             features.push("cutlery tray");
    //             break;
    //         }
    //     }

    //     return features.length > 0 ? features : null;
    // },

    // DishwasherWidth: (product) => {



    //     // 1. Try to extract width from minor first
    //     let raw = null;

    //     if (typeof product.minor === 'string') {
    //         const match = product.minor.match(/(\d{2})(?=")/);
    //         if (match) {
    //             raw = parseInt(match[1], 10);
    //             // console.log(`🟢 Width from MINOR: ${product.minor} → ${raw}"`);
    //         }
    //     }
    //     // console.log('📦 Checking fallback width from classification:', product.classification);
    //     // 2. Fallback to classification fields if needed
    //     if (raw === null) {
    //         const rawString =
    //             product.classification?.nominal_width_in_inches_string ||
    //             product.classification?.width_string ||
    //             String(product.classification?.width || '');

    //         if (rawString) {
    //             // Match patterns like "35 7/8", "36", or "35.875"
    //             const match = rawString.match(/(\d+)(?:\s+(\d+\/\d+))?/);

    //             if (match) {
    //                 const whole = parseInt(match[1], 10);
    //                 const fraction = match[2] ? eval(match[2]) : 0;
    //                 let numeric = whole + fraction;

    //                 const upper = rawString.toUpperCase();
    //                 if (upper.includes('CM')) numeric *= 0.393701;
    //                 else if (upper.includes('MM') || numeric > 100) numeric *= 0.0393701;

    //                 raw = Math.round(numeric);
    //                 // console.log(`🟡 Width from CLASSIFICATION: ${rawString} → ${numeric}"`);
    //             } else {
    //                 // fallback if above didn't match
    //                 const cleaned = rawString.replace(/[^\d.]/g, '');
    //                 let numeric = parseFloat(cleaned);
    //                 if (!isNaN(numeric)) {
    //                     raw = Math.round(numeric);
    //                     // console.log(`🟡 (fallback) Width from CLASSIFICATION: ${rawString} → ${numeric}"`);
    //                 }
    //             }
    //         }
    //     }

    //     if (raw === null || isNaN(raw)) return null;
    //     console.log(`📏 Final raw width for product: ${raw}"`);

    //     if (raw >= 16 && raw < 19) return '18"';
    //     if (raw >= 22 && raw < 25) return '24"';



    //     return null; // fallback
    // },

    MicroProductType: (product) => {
        const code = product.classification?.minor_class_code?.toUpperCase() || "";
        const height = parseFloat(product.classification?.height);
        const short = product.marketing_copy?.short_description?.toLowerCase?.() || '';
        const medium = product.marketing_copy?.medium_description?.toLowerCase() || '';
        const paragraph = product.marketing_copy?.paragraph_description?.toLowerCase() || '';
        const minorDes = product.classification?.minor_class_description?.toLowerCase?.() || '';


        const allText = [short, medium, paragraph].join('');

        if (code === "HALOGN") return "halogen light";
        if (code === "MICBI") return "built in microwave";
        if (code === "MICOR" ) return "over the range micorwave";
        if (code === "MICCO") return "countertop";

        return null;
    },

    // MicrowaveWidth: (product) => {



    //     // 1. Try to extract width from minor first
    //     let raw = null;

    //     if (typeof product.minor === 'string') {
    //         const match = product.minor.match(/(\d{2})(?=")/);
    //         if (match) {
    //             raw = parseInt(match[1], 10);
    //             // console.log(`🟢 Width from MINOR: ${product.minor} → ${raw}"`);
    //         }
    //     }
    //     // console.log('📦 Checking fallback width from classification:', product.classification);
    //     // 2. Fallback to classification fields if needed
    //     if (raw === null) {
    //         const rawString =
    //             product.classification?.nominal_width_in_inches_string ||
    //             product.classification?.width_string ||
    //             String(product.classification?.width || '');

    //         if (rawString) {
    //             // Match patterns like "35 7/8", "36", or "35.875"
    //             const match = rawString.match(/(\d+)(?:\s+(\d+\/\d+))?/);

    //             if (match) {
    //                 const whole = parseInt(match[1], 10);
    //                 const fraction = match[2] ? eval(match[2]) : 0;
    //                 let numeric = whole + fraction;

    //                 const upper = rawString.toUpperCase();
    //                 if (upper.includes('CM')) numeric *= 0.393701;
    //                 else if (upper.includes('MM') || numeric > 100) numeric *= 0.0393701;

    //                 raw = Math.round(numeric);
    //                 // console.log(`🟡 Width from CLASSIFICATION: ${rawString} → ${numeric}"`);
    //             } else {
    //                 // fallback if above didn't match
    //                 const cleaned = rawString.replace(/[^\d.]/g, '');
    //                 let numeric = parseFloat(cleaned);
    //                 if (!isNaN(numeric)) {
    //                     raw = Math.round(numeric);
    //                     // console.log(`🟡 (fallback) Width from CLASSIFICATION: ${rawString} → ${numeric}"`);
    //                 }
    //             }
    //         }
    //     }

    //     if (raw === null || isNaN(raw)) return null;
    //     console.log(`📏 Final raw width for product: ${raw}"`);
    //     if (raw < 19) return '20" or Less';
    //     if (raw >= 20 && raw <= 22) return '21"';
    //     if (raw >= 23 && raw <= 25) return '24"';
    //     if (raw >= 26 && raw <= 28) return '27"';
    //     if (raw >= 29 && raw <= 31) return '30"';



    //     return null; // fallback
    // },


    // RefrigProductType: (product) => {
    //     const code = product.classification?.minor_class_code?.toUpperCase() || "";
    //     const height = parseFloat(product.classification?.height);

    //     if (["FFRENCH", "BFRENCH"].includes(code)) return "French Door";
    //     if (["FSXS", "BSXS"].includes(code)) return "Side by Side";
    //     if (["FTOPF", "BTOPF"].includes(code)) return "Top Freezer";
    //     if (["FBOTF", "BBOTF"].includes(code)) return "Bottom Freezer";
    //     if (code === "COMPACT") return "Compact";
    //     if (code === "RWC") return "Wine Storage";
    //     if (code === "RSPCL" && height < 36) return "Undercounter";
    //     if (code === "RSPCL") return "Specialty / MISC";
    //     if (["BREFALL", "FREFALL"].includes(code)) return "All Fridge";
    //     if (code === "DRAWER") return "Drawer";
    //     if (["FGLASS", "BGLASS"].includes(code)) return "Glass Door";

    //     return null;
    // },

    // CoffeeProductType: (product) => {
    //     const description = product.classification?.minor_class_description?.toLowerCase() || "";
    //     const short = product.marketing_copy?.short_description?.toLowerCase?.() || '';
    //     const medium = product.marketing_copy?.medium_description?.toLowerCase?.() || '';
    //     const paragraph = product.marketing_copy?.paragraph_description?.toLowerCase() || '';

    //     const allText = [short, medium, paragraph].join(' ');

    //     const builtInRegex = /\bbuilt[-\s]?in\b|builtin\b/;
    //     const counterTopRegex = /\bcounter[\s-]?top\b/;

    //     if (builtInRegex.test(description) || builtInRegex.test(allText)) return "Built In";
    //     if (counterTopRegex.test(description) || counterTopRegex.test(allText)) return "CounterTop";

    //     return null;
    // },

    // BBQProductType: (product) => {
    //     const minor_code = product.classification?.minor_class_code?.toUpperCase() || "";
    //     const short = product.marketing_copy?.short_description?.toLowerCase?.() || '';
    //     const medium = product.marketing_copy?.medium_description?.toLowerCase() || '';
    //     const brandCode = product.classification?.brand_code?.toUpperCase() || '';
    //     const paragraph = product.marketing_copy?.paragraph_description?.toLowerCase() || '';
    //     const allText = [short, medium, paragraph].join('');

    //     const types = [];
    //     if (minor_code.includes('BBQPRO')) types.push('Pro Style');
    //     if (minor_code.includes('BBQPL')) types.push('Pellet BBQ');
    //     if (minor_code.includes('BBQCH')) types.push('Charcoal BBQ');

    //     const sideBurnerRegex = /\bside[-\s]?burner(s)?\b/i;
    //     const exclusionRegex = /\b(optional|includes?|with|featuring)\b.{0,30}side[-\s]?burner(s)?\b/i;

    //     if (sideBurnerRegex.test(allText) &&
    //         !exclusionRegex.test(allText) &&
    //         brandCode !== 'BROILKING') {
    //         types.push('Side Burners');
    //     }

    //     return types.length ? types : null;
    // },

    // LaundryProductType: (product) => {
    //     const minor_code = product.classification?.minor_class_code?.toUpperCase() || "";
    //     const types = [];

    //     if (minor_code.includes('PDSTL')) types.push('Laundry Accessories');
    //     if (["DRYE", "COMMD", "DRYTME", "DRYTMG", "DRYEF", "DRYGF", "DRYG", "DRYP"].includes(minor_code)) types.push('Dryers');
    //     if (["WASHF", "WASHT", "WASHHE", "WASHP"].includes(minor_code)) types.push('Washers');
    //     if (["WASHCE", "WASHCG"].includes(minor_code)) types.push('Washer Dryer Combos')
    //     if (["STEAM"].includes(minor_code)) types.push('Garment Steamers')
    //     if (["COMMC", "WASHC"].includes(minor_code)) types.push('WashTowers')

    //     return types.length ? types : null;
    // },

    // RangeWidth: (product) => {



    //     // 1. Try to extract width from minor first
    //     let raw = null;

    //     if (typeof product.minor === 'string') {
    //         const match = product.minor.match(/(\d{2})(?=")/);
    //         if (match) {
    //             raw = parseInt(match[1], 10);
    //             // console.log(`🟢 Width from MINOR: ${product.minor} → ${raw}"`);
    //         }
    //     }
    //     // console.log('📦 Checking fallback width from classification:', product.classification);
    //     // 2. Fallback to classification fields if needed
    //     if (raw === null) {
    //         const rawString =
    //             product.classification?.nominal_width_in_inches_string ||
    //             product.classification?.width_string ||
    //             String(product.classification?.width || '');

    //         if (rawString) {
    //             // Match patterns like "35 7/8", "36", or "35.875"
    //             const match = rawString.match(/(\d+)(?:\s+(\d+\/\d+))?/);

    //             if (match) {
    //                 const whole = parseInt(match[1], 10);
    //                 const fraction = match[2] ? eval(match[2]) : 0;
    //                 let numeric = whole + fraction;

    //                 const upper = rawString.toUpperCase();
    //                 if (upper.includes('CM')) numeric *= 0.393701;
    //                 else if (upper.includes('MM') || numeric > 100) numeric *= 0.0393701;

    //                 raw = Math.round(numeric);
    //                 // console.log(`🟡 Width from CLASSIFICATION: ${rawString} → ${numeric}"`);
    //             } else {
    //                 // fallback if above didn't match
    //                 const cleaned = rawString.replace(/[^\d.]/g, '');
    //                 let numeric = parseFloat(cleaned);
    //                 if (!isNaN(numeric)) {
    //                     raw = Math.round(numeric);
    //                     // console.log(`🟡 (fallback) Width from CLASSIFICATION: ${rawString} → ${numeric}"`);
    //                 }
    //             }
    //         }
    //     }

    //     if (raw === null || isNaN(raw)) return null;
    //     console.log(`📏 Final raw width for product: ${raw}"`);
    //     // 🎯 Map to predefined width ranges
    //     if (raw <= 22) return '23" and Less';
    //     if (raw >= 23 && raw < 27) return '24"';
    //     if (raw >= 27 && raw < 33) return '30"';
    //     if (raw >= 33 && raw < 39) return '36"';
    //     if (raw >= 39 && raw < 45) return '42"';
    //     if (raw >= 45 && raw < 54) return '48"';
    //     if (raw >= 54 && raw < 61) return '60"';
    //     if (raw >= 61) return '61" and above';

    //     return null; // fallback
    // },

    // Width: (product) => {
    //     const rawString =
    //         product.classification?.width_string ||
    //         product.classification?.nominal_width_in_inches_string ||
    //         String(product.classification?.width || '');

    //     if (!rawString) return null;

    //     let raw = parseFloat(rawString);
    //     if (isNaN(raw)) return null;

    //     const upper = rawString.toUpperCase();

    //     // Convert CM or MM to inches
    //     if (upper.includes('CM')) {
    //         raw *= 0.393701;
    //     } else if (upper.includes('MM') || raw > 100) {
    //         // Assume MM if value is too large to be inches (e.g., 900mm)
    //         raw *= 0.0393701; // 1 mm = 0.0393701 inches
    //     }

    //     // Round to nearest multiple of 6
    //     const rounded = Math.round(raw / 6) * 6;
    //     return `${rounded}"`;
    // },

    // HoodWidth: (product) => {
    //     const rawString =
    //         product.classification?.nominal_width_in_inches_string ||
    //         product.classification?.width ||
    //         product.classification?.width_string;

    //     if (!rawString) return null;

    //     let raw = parseFloat(rawString);
    //     if (isNaN(raw)) return null;

    //     // Handle conversion if width is in CM
    //     if (rawString.toUpperCase().includes('CM')) {
    //         raw = raw * 0.393701; // 1 cm = 0.393701 inches
    //     }

    //     const type = product.type?.toUpperCase();
    //     if (type !== 'VENTILATION') return null; // Only apply to VENTILATION

    //     const widthOptions = typeWidthValues['VENTILATION'];
    //     if (!widthOptions) return null;

    //     // Now map raw width into the correct range
    //     if (raw < 18) return 'under 18"';
    //     if (raw >= 18 && raw <= 23) return '18"-23"';
    //     if (raw >= 24 && raw <= 36) return '24"-36"';
    //     if (raw >= 37 && raw <= 48) return '37"-48"';
    //     if (raw >= 49 && raw <= 66) return '49"-66"';
    //     if (raw > 66) return 'above 66"';

    //     // If width falls outside defined groups, return null
    //     return null;
    // },

    // RefrigFeatures: (product) => {
    //     const market_features = product.marketing_copy?.features?.feature?.join(' ').toLowerCase() || '';

    //     const image_features = product.marketing_copy?.image_features?.image_feature || [];
    //     const image_titles = image_features.map(f => f?.title?.toLowerCase() || '').join(' ');
    //     const image_description = image_features.map(f => f?.feature_description?.toLowerCase() || '').join(' ');

    //     const short = product.marketing_copy?.short_description?.toLowerCase() || '';
    //     const medium = product.marketing_copy?.medium_description?.toLowerCase() || '';
    //     const paragraph = product.marketing_copy?.paragraph_description?.toLowerCase() || '';

    //     const hierarchical = (product.marketing_copy?.hierarchical_features_html || '')
    //         .replace(/<[^>]*>/g, '')
    //         .toLowerCase();

    //     const allText = [
    //         market_features,
    //         image_titles,
    //         image_description,
    //         short,
    //         medium,
    //         paragraph,
    //         hierarchical
    //     ].join(' ');

    //     const features = [];

    //     if (allText.includes("external dispenser") || /external.*dispenser/.test(allText)) {
    //         features.push("External Water/Ice Dispenser");
    //     }

    //     if (allText.includes("internal dispenser") || /internal.*dispenser/.test(allText)) {
    //         features.push("Internal Water Dispenser");
    //     }

    //     if (allText.includes("internal ice and water dispenser") || /internal.*ice.*dispenser/.test(allText)) {
    //         features.push("Internal Water/Ice Dispenser");
    //     }

    //     if (allText.includes("internal ice maker") || /internal.*ice.*maker/.test(allText)) {
    //         features.push("Internal Ice Maker");
    //     }

    //     if (
    //         allText.includes("wifi") ||
    //         allText.includes("wi-fi") ||
    //         allText.includes("smartthings") ||
    //         /wi[-]?fi/.test(allText)
    //     ) {
    //         features.push("Wifi Capable");
    //     }

    //     // ✅ Fuzzy matching for additional features
    //     if (/crisper[s]?/.test(allText) || /crisper.*bin[s]?/.test(allText)) {
    //         features.push("Crisper Bin");
    //     }

    //     if (/adjustable.*shelf|shelves/.test(allText)) {
    //         features.push("Adjustable Shelves");
    //     }

    //     if (/gallon.*door.*storage/.test(allText)) {
    //         features.push("Gallon Door Storage");
    //     }

    //     if (/ice.*bin/.test(allText)) {
    //         features.push("Ice Bin");
    //     }

    //     if (/wine.*rack[s]?/.test(allText)) {
    //         features.push("Wine Rack");
    //     }

    //     if (
    //         /snack.*drawer/.test(allText) ||
    //         /deli.*drawer/.test(allText) ||
    //         /snack\/deli/.test(allText)
    //     ) {
    //         features.push("Snack/Deli Drawer");
    //     }

    //     if (/door[- ]?in[- ]?door/.test(allText)) {
    //         features.push("Door in Door");
    //     }

    //     if (/flex[- ]?zone/.test(allText)) {
    //         features.push("Flex Zone");
    //     }

    //     if (/ice.*scoop/.test(allText)) {
    //         features.push("Ice Scoop");
    //     }

    //     if (/removable.*shelf|shelves/.test(allText)) {
    //         features.push("Removable Shelves");
    //     }

    //     return features.length > 0 ? features : null;
    // }


    // RangeFeatures: (product) => {
    //     const marketingCopy = JSON.stringify(product.marketing_copy || {}).toLowerCase();
    //     const classifications = JSON.stringify(product.classification || {}).toLowerCase();

    //     const allTextRaw = [marketingCopy, classifications].join(' ');
    //     const normalizedText = allTextRaw.toLowerCase().replace(/\s+/g, ' ');

    //     const features = [];

    //     const matchFeature = (regex, label) => {
    //         if (regex.test(normalizedText)) features.push(label);
    //     };

    //     // 🔥 Burner count (text-based)
    //     matchFeature(/\(4\)[^\d]?/, '4 burner');
    //     matchFeature(/\(5\)[^\d]?/, '5 burner');
    //     matchFeature(/\(6\)[^\d]?/, '6 burner');
    //     matchFeature(/\(8\)[^\d]?/, '8 burner');

    //     matchFeature(/4[\s-]?(burners?|btu)/, '4 burner');
    //     matchFeature(/5[\s-]?(burners?|btu)/, '5 burner');
    //     matchFeature(/6[\s-]?(burners?|btu)/, '6 burner');
    //     matchFeature(/8[\s-]?(burners?|btu)/, '8 burner');

    //     matchFeature(/4[\s-]?burner/, '4 burner');
    //     matchFeature(/5[\s-]?burner/, '5 burner');
    //     matchFeature(/6[\s-]?burner/, '6 burner');
    //     matchFeature(/8[\s-]?burner/, '8 burner');

    //     // 🔍 Burner count from spec table key-value pairs
    //     const specTable = product.marketing_copy?.spec_table_html?.spec_table_as_key_value_pairs || [];
    //     specTable.forEach(section => {
    //         (section?.key_value_pairs || []).forEach(pair => {
    //             const key = pair.key?.toLowerCase?.() || '';
    //             const value = pair.value?.toLowerCase?.() || '';
    //             if (key.includes('burner')) {
    //                 const match = value.match(/\((\d+)\)/);
    //                 if (match && match[1]) {
    //                     features.push(`${match[1]} burner`);
    //                 }
    //             }
    //         });
    //     });

    //     // 🔁 Range-specific features
    //     matchFeature(/griddle/, 'griddle');
    //     matchFeature(/charbroiler/, 'charbroiler options');
    //     matchFeature(/french[\s-]?top/, 'french top');
    //     matchFeature(/wifi|wi[\s-]?fi|smartthings/, 'Wifi Capable');
    //     matchFeature(/self[\s-]?clean(ing)?/, 'Self Cleaning');
    //     matchFeature(/sabbath/, 'Sabbath Mode');
    //     matchFeature(/lp conversion/, 'LP Conversion');
    //     matchFeature(/leveling legs?/, 'Leveling Legs');
    //     matchFeature(/interior (oven )?light/, 'Interior Light');
    //     matchFeature(/broil/, 'Broil Element');
    //     matchFeature(/oven/, 'Oven');
    //     matchFeature(/clock/, 'Clock');
    //     matchFeature(/timer/, 'Includes Timer');
    //     matchFeature(/hot surface/, 'Hot Surface Indicator Lights');
    //     matchFeature(/warm function/, 'Warm Function');
    //     matchFeature(/title 20/, 'Title 20 Compliant');
    //     matchFeature(/smart home/, 'Smart Home');
    //     matchFeature(/fingerprint resistant/, 'Fingerprint Resistant');
    //     matchFeature(/air fry/, 'Air Fry');
    //     matchFeature(/\bada\b/, 'ADA');
    //     matchFeature(/auto shut[\s-]?off/, 'Auto Shut Off');
    //     matchFeature(/meat thermometer/, 'Meat Thermometer');
    //     matchFeature(/\bgrill\b/, 'Grill');
    //     matchFeature(/steam cook/, 'Steam Cooking');
    //     matchFeature(/pfas/, 'Contains PFAS Chemicals');
    //     matchFeature(/energy star/, 'Energy Star');
    //     matchFeature(/commercial use/, 'Approved for Commercial Use');
    //     matchFeature(/downdraft/, 'Downdraft Ventilated');
    //     matchFeature(/adjustable legs/, 'Adjustable Legs');
    //     matchFeature(/front loading/, 'Front Loading');
    //     matchFeature(/counter depth/, 'Counter Depth');

    //     return features.length > 0 ? features : null;
    // },




    //   Features: (product) => {
    //     const type = product.type?.toUpperCase();
    //     const predefined = typeFeatureValues[type];
    //     const typeFromSpecPairs = [];
    //     const specTable = product.marketing_copy?.spec_table_html?.spec_table_as_key_value_pairs || [];

    //     specTable.forEach(section => {
    //       section.key_value_pairs.forEach(pair => {
    //         const key = pair.key?.toLowerCase?.() || '';
    //         const value = pair.value?.toLowerCase?.() || '';
    //         if (key.includes('type')) {
    //           typeFromSpecPairs.push(value);
    //         }
    //       });
    //     });

    //     if (!predefined) return null;

    //     const searchableStrings = [
    //       ...(product.marketing_copy?.features?.feature || []),
    //       product.marketing_copy?.short_description || '',
    //       product.marketing_copy?.medium_description || '',
    //       product.marketing_copy?.paragraph_description || '',
    //     ].join(' ').toLowerCase();

    //     return predefined.filter((feature) =>
    //       searchableStrings.includes(feature.toLowerCase())
    //     );
    //   },

    // Configuration: (product) => {
    //     const type = product.type?.toUpperCase();
    //     const predefinedConfigurations = typeConfigurationValues[type];

    //     if (!predefinedConfigurations) return null;

    //     const searchSources = [
    //         ...(product.marketing_copy?.features?.feature || []),
    //         product.marketing_copy?.short_description || '',
    //         product.marketing_copy?.medium_description || '',
    //         product.marketing_copy?.paragraph_description || '',
    //     ].join(' ').toLowerCase();

    //     const specPairs = product.marketing_copy?.spec_table_as_key_value_pairs || [];

    //     const specValues = specPairs.flatMap(section =>
    //         (section.spec_table_pair || []).map(pair => `${pair.key || ''} ${pair.value || ''}`.toLowerCase())
    //     ).join(' ');

    //     const combinedText = `${searchSources} ${specValues}`;

    //     // Now search through predefined configuration values
    //     const foundConfig = predefinedConfigurations.find(config =>
    //         config && combinedText.includes(config.toLowerCase())
    //     );

    //     return foundConfig || null;
    // },

    // RefrigConfiguration: (product) => {
    //     const description = product.classification?.minor_class_description?.toLowerCase() || "";
    //     const paragraph = product.marketing_copy?.paragraph_description?.toLowerCase() || "";
    //     const features = (product.marketing_copy?.features?.feature || []).join(" ").toLowerCase();
    //     const minor_code = product.classification?.minor_class_code?.toLowerCase() || "";

    //     if (minor_code.includes("drawer")) return "Drawers";
    //     if (description.includes("freestanding")) return "Freestanding";
    //     if (
    //         description.includes("built in") ||
    //         description.includes("built-in") ||
    //         description.includes("builtin")
    //     ) return "Built In";
    //     if (description.includes("outdoor") || paragraph.includes("outdoor") || features.includes("outdoor")) {
    //         return "Outdoor";
    //     }
    //     return null;
    // },

    // CoffeeConfiguration: (product) => {
    //     const market_features = product.marketing_copy?.features?.feature?.join(' ').toLowerCase() || '';

    //     const image_features = product.marketing_copy?.image_features?.image_feature || [];
    //     const image_titles = image_features.map(f => f?.title?.toLowerCase() || '').join(' ');
    //     const image_description = image_features.map(f => f?.feature_description?.toLowerCase() || '').join(' ');

    //     const short = product.marketing_copy?.short_description?.toLowerCase() || '';
    //     const medium = product.marketing_copy?.medium_description?.toLowerCase() || '';
    //     const paragraph = product.marketing_copy?.paragraph_description?.toLowerCase() || '';

    //     const hierarchical = (product.marketing_copy?.hierarchical_features_html || '')
    //         .replace(/<[^>]*>/g, '')
    //         .toLowerCase();

    //     const allText = [
    //         market_features,
    //         image_titles,
    //         image_description,
    //         short,
    //         medium,
    //         paragraph,
    //         hierarchical
    //     ].join(' ');

    //     const plumbedInRegex = /\bplumbed(?:[-\s]?in)?\b/;

    //     if (plumbedInRegex.test(allText)) return 'Plumbed';

    //     return null;
    // },

    // LaundryConfiguration: (product) => {
    //     const minor_code = product.classification?.minor_class_code?.toUpperCase() || "";
    //     const types = [];

    //     if (["DRYE", "DRYTME", "DRYTMG", "WASHT", "WASHHE", "DRYG"].includes(minor_code)) types.push('Top Load');
    //     if (["DRYEF", "DRYGF", "WASHF"].includes(minor_code)) types.push('Front Load');
    //     if (["COMMW", "COMMC", "COMMD",].includes(minor_code)) types.push('Commercial');

    //     return types.length ? types : null;
    // },

    // Brand: (product) => product.brand || null,
    // Height: (product) => product.height ? `${Math.round(parseFloat(product.height))}"` : null,
    // Depth: (product) => product.depth ? `${Math.round(parseFloat(product.depth))}"` : null,
};
