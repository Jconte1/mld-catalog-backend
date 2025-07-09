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

    // DishwasherProductType: (product) => {
    //     console.log('🔍 classification:', product.classification);
    // const code = product.classification?.minor_class_code?.toUpperCase() || "";
    // const height = parseFloat(product.classification?.height);
    // const short = product.marketing_copy?.short_description?.toLowerCase?.() || '';
    // const medium = product.marketing_copy?.medium_description?.toLowerCase() || '';
    // const paragraph = product.marketing_copy?.paragraph_description?.toLowerCase?.() || '';
    // const minorDes = product.classification?.minor_class_description?.toLowerCase?.() || '';

    // const color_code = (product.classification?.color_code_description || '').toLowerCase();
    // const allText = [short, medium, paragraph, minorDes].join(' ');

    // const types = [];

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

    // MicrowaveFeatures: (product) => {
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

    //     const keywordMap = {
    //         "turntable": /\bturntables?\b/,
    //         "clock": /\bclock\b/,
    //         "includes timer": /\b(includes?|with|comes with)\b.*\btimer\b|\btimer\b.*\bincluded\b/,
    //         "light included": /\blight(s)?\b.*\b(included|included with|with light|lighting included)\b/,
    //         "title 20 compliant": /\btitle\s*20\b.*\bcompliant\b/,
    //         "end of cycle indicator": /\b(end|completion)\s+of\s+cycle\b|\bcycle\s+(complete|done|finished|indicator)\b/,
    //         "sensor cooking": /\bsensor\b.*\bcook(ing)?\b|\bcook(ing)?\b.*\bsensor\b/,
    //         "auto shut off": /\bauto(matic)?(ally)?\b.*\bshut\s*off\b|\bshuts?\s*off\b.*\bautomatically\b/,
    //         "bulb included": /\bbulbs?\b.*\b(included|included with)\b|\bincludes?\s+bulbs?\b/,
    //         "convection": /\bconvection\b/,
    //         "warm function": /\bwarm(ing)?\b.*\bfunction\b|\bkeep(s)?\s+(warm|food warm)\b/,
    //         "convertible to ductless / recirculating": /\bconvertible\b.*(ductless|recirculating)\b|\brecirculating\s+option\b/,
    //         "ductless": /\bductless\b/,
    //         "front loading": /\bfront[-\s]*load(ing)?\b/,
    //         "rebate offered": /\brebate(s)?\b.*(available|offered|included)\b|\bqualifies?\s+for\s+rebate\b/,
    //         "fingerprint resistant": /\bfingerprint[-\s]*(resistant|proof)\b/,
    //         "ada": /\bADA\b|\baccessible\b/,
    //         "baking element": /\bbaking\b.*\belement\b|\bbake\b.*\belement\b/,
    //         "optional trim kit": /\btrim\s*kit\b.*(optional|available)\b|\b(optional)?\s*trim\s*kit\b/,
    //         "smart home": /\bsmart\s+(home|device|technology)\b|\bwi[-\s]?fi\b|\bconnect(ed|ivity)\b|\bapp\s*control\b/,
    //         "broil element": /\bbroil(ing)?\b.*\belement\b/,
    //         "air fry": /\bair[-\s]?fry(ing)?\b/,
    //         "made in america": /\bmade in (the )?usa\b|\bmade in america\b/i,
    //         "sabbath mode": /\bsabbath\s*mode\b/,
    //         "contains pfas chemicals": /\bcontains\b.*\bpfas\b|\bpfas\s*(chemicals?)?\b/,
    //         "counter depth": /\bcounter[-\s]?depth\b/,
    //         "includes thermostat": /\b(includes?|with|comes with)\b.*\bthermostat\b|\bthermostat\b.*(included|available)\b/,
    //         "steam cooking": /\bsteam\b.*\bcook(ing)?\b/,
    //         "energy star": /\benergy[-\s]?star\b.*(compliant|rated|qualified)?\b/,
    //         "panel ready": /\bpanel\s*ready\b/,
    //         "includes freezer": /\bincludes?\b.*\bfreezer\b|\bfreezer\b.*(included|with)\b/,
    //         "automatic defrost": /\bauto(matic)?\s*defrost\b/,
    //         "interior light": /\binterior\b.*\blight(s)?\b/,
    //         "adjustable shelves": /\badjustable\b.*\bshelves\b|\bshelves\b.*\badjustable\b/,
    //         "approved for commercial use": /\bcommercial\s+use\b|\bnsf[-\s]?certified\b/,
    //         "leveling legs": /\blevel(ing)?\s+legs\b/,
    //         "night light": /\bnight[-\s]*light\b/
    //     };

    //     for (const [label, regex] of Object.entries(keywordMap)) {
    //         if (regex.test(allText)) {
    //             features.push(label);
    //         }
    //     }

    //     return features.length > 0 ? features : null;
    // },

    // OvenFeatures: (product) => {
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

    //     const keywordMap = {
    //         "convection": /\bconvection\b/,
    //         "broil element": /\bbroil(ing)?\b.*\belement\b|\belement\b.*\bbroil(ing)?\b/,
    //         "clock": /\bclock\b/,
    //         "baking element": /\bbak(e|ing)\b.*\belement\b|\bbake\b.*\belement\b/,
    //         "self cleaning": /\bself[-\s]?clean(ing)?\b|\bauto[-\s]?clean\b|\bautomatic(ally)?\s*clean\b|\bcleans itself\b/,
    //         "sabbath mode": /\bsabbath\s+mode\b/i,
    //         "includes timer": /\b(includes?|with|has)\b.*\btimer\b|\btimer\b.*\b(included|provided|available)\b/,
    //         "interior light": /\binterior\b.*\blight(s)?\b|\blight(s)?\b.*\binterior\b/,
    //         "light included": /\blight(s)?\b.*\b(included|provided|built-in|included with)\b/,
    //         "smart home": /\bsmart\b.*\b(home|device|connected|tech|technology)\b|\bwi[-\s]?fi\b|\bapp\s*enabled\b/,
    //         "air fry": /\bair\s*fry(ing)?\b/i,
    //         "warm function": /\bwarm\b.*\bfunction\b|\bkeep warm\b|\bwarming\b/,
    //         "meat thermometer": /\bmeat\b.*\bthermometer\b|\binternal\s+probe\b/,
    //         "rebate offered": /\brebate\b.*(offered|available|eligible|qualif(y|ies|ication))\b/,
    //         "auto shut off": /\bauto(matic)?(ally)?\b.*\bshut\s*off\b|\bshuts off automatically\b/,
    //         "sensor cooking": /\bsensor\b.*\bcook(ing)?\b|\bcook(ing)?\b.*\bsensor\b/,
    //         "ada": /\bADA\b/,
    //         "made in america": /\bmade\s+in\s+(usa|america|united states)\b/i,
    //         "combination oven": /\b(combination|combo|multi[-\s]?function)\b.*\boven\b/,
    //         "title 20 compliant": /\btitle\s*20\b.*(compliant|certified|approved)?\b/,
    //         "steam cooking": /\bsteam\b.*\bcook(ing)?\b/,
    //         "fingerprint resistant": /\bfingerprint\b.*\bresistant\b/,
    //         "humidity control": /\bhumidity\b.*\bcontrol\b/,
    //         "front loading": /\bfront[-\s]*loading\b/,
    //         "approved for commercial use": /\bcommercial\s*(use|approved|certified)\b|\bnsf[-\s]?certified\b/,
    //         "contains pfas chemicals": /\bpfas\b|\bcontains\b.*\bpfas\b/i,
    //         "lp conversion": /\blp\s*(conversion|kit)?\b|\bconvert(ed)?\s*(to|for)?\s*lp\b/i,
    //         "turntable": /\bturntables?\b/,
    //         "steam technology": /\bsteam\b.*\btechnology\b/,
    //         "bulb included": /\bbulb(s)?\b.*\bincluded\b/,
    //         "door viewer": /\bdoor\b.*\bviewer\b/,
    //     };


    //     for (const [label, regex] of Object.entries(keywordMap)) {
    //         if (regex.test(allText)) {
    //             features.push(label);
    //         }
    //     }

    //     return features.length > 0 ? features : null;
    // },

    // BbqFeatures: (product) => {
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

    //     const keywordMap = {
    //         "outdoor approved": /\boutdoor\b.*\bapproved\b|\bapproved\s*for\s*outdoor\b/i,
    //         "light included": /\blight(s)?\b.*\b(included|provided|built-in|with light)\b/i,
    //         "rotisserie": /\brotisser(ie|y)\b/i,
    //         "made in america": /\bmade\s+in\s+(usa|america|united states)\b/i,
    //         "includes thermostat": /\b(includes?|with)\b.*\bthermostat\b|\bthermostat\b.*\b(included|provided|built-in)?\b/i,
    //         "rust resistant": /\brust\b.*\bresist(ant|ance)\b/i,
    //         "with casters": /\bcasters?\b|\bwith\s+casters\b/i,
    //         "assembly required": /\bassembly\s+(required|needed|necessary)\b/i,
    //         "lp conversion": /\blp\s*(conversion|kit)?\b|\bconvert(ed)?\s*(to|for)?\s*lp\b/i,
    //         "rebate offered": /\brebate\b.*(offered|available|eligible|qualif(y|ies|ication))\b/i,
    //         "overheat protection": /\boverheat\b.*\bprotection\b|\bprotection\b.*\boverheat\b/i,
    //         "ada": /\bADA\b/i,
    //         "approved for commercial use": /\bcommercial\s*(use|approved|certified)\b|\bnsf[-\s]?certified\b/i,
    //         "energy star": /\benergy\s*star\b|\bENERGY\s*STAR\s*qualified\b/i,
    //     };

    //     for (const [label, regex] of Object.entries(keywordMap)) {
    //         if (regex.test(allText)) {
    //             features.push(label);
    //         }
    //     }

    //     return features.length > 0 ? features : null;
    // },

    // CoffeeFeatures: (product) => {
        // const market_features = product.marketing_copy?.features?.feature?.join(' ').toLowerCase() || '';
        // const image_features = product.marketing_copy?.image_features?.image_feature || [];
        // const image_titles = image_features.map(f => f?.title?.toLowerCase() || '').join(' ');
        // const image_description = image_features.map(f => f?.feature_description?.toLowerCase() || '').join(' ');
        // const short = product.marketing_copy?.short_description?.toLowerCase() || '';
        // const medium = product.marketing_copy?.medium_description?.toLowerCase() || '';
        // const paragraph = product.marketing_copy?.paragraph_description?.toLowerCase() || '';
        // const hierarchical = (product.marketing_copy?.hierarchical_features_html || '')
        //     .replace(/<[^>]*>/g, '')
        //     .toLowerCase();

        // const allText = [
        //     market_features,
        //     image_titles,
        //     image_description,
        //     short,
        //     medium,
        //     paragraph,
        //     hierarchical
        // ].join(' ');

        // const features = [];

    //     const keywordMap = {
    //         "programmable": /\bprogrammable\b|\bprogram\s+(settings|control|options)\b/i,
    //         "includes grinder": /\b(includes?|with|has)\b.*\bgrinder\b|\bgrinder\b.*\b(included|built[-\s]?in|provided)\b/i,
    //         "auto shut off": /\bauto(matic)?(ally)?\b.*\bshut\s*off\b|\bshuts off automatically\b/i,
    //         "rebate offered": /\brebate\b.*(offered|available|eligible|qualif(y|ies|ication))\b/i,
    //         "water filtration": /\bwater\b.*\bfiltration\b|\bfiltration\b.*\bwater\b/i,
    //         "ada": /\bADA\b/i,
    //         "approved for commercial use": /\bcommercial\s*(use|approved|certified)\b|\bnsf[-\s]?certified\b/i,
    //         "standby timer": /\bstandby\b.*\btimer\b|\btimer\b.*\bstandby\b/i,
    //     };

    //     for (const [label, regex] of Object.entries(keywordMap)) {
    //         if (regex.test(allText)) {
    //             features.push(label);
    //         }
    //     }

    //     return features.length > 0 ? features : null;
    // },

    // LaundryFeatures: (product) => {
    //     const market_features = product.marketing_copy?.features?.feature?.join(' ').toLowerCase() || '';
    //     const image_features = product.marketing_copy?.image_features?.image_feature || [];
    //     const image_titles = image_features.map(f => f?.title?.toLowerCase() || '').join(' ');
    //     const image_description = image_features.map(f => f?.feature_description?.toLowerCase() || '').join(' ');
    //     const short = product.marketing_copy?.short_description?.toLowerCase() || '';
    //     const medium = product.marketing_copy?.medium_description?.toLowerCase() || '';
    //     const paragraph = product.marketing_copy?.paragraph_description?.toLowerCase() || '';
    //     const hierarchical = (product.marketing_copy?.hierarchical_features_html || '').replace(/<[^>]*>/g, '').toLowerCase();
      
    //     const allText = [
    //       market_features,
    //       image_titles,
    //       image_description,
    //       short,
    //       medium,
    //       paragraph,
    //       hierarchical,
    //     ].join(' ');
      
    //     const features = [];
      
    //     const featureRegexMap = {
    //       "top loading": [/\btop[-\s]?loading\b/],
    //       "energy star": [/\benergy\s*star\b/],
    //       "title 20 compliant": [/\btitle\s*20\s*compliant\b/],
    //       "front loading": [/\bfront[-\s]?loading\b/],
    //       "stackable": [/\bstackable\b/],
    //       "smart home": [/\bsmart\s*home\b/, /\bsmart\s*enabled\b/],
    //       "made in america": [/\bmade\s*in\s*america\b/, /\bamerican[-\s]?made\b/],
    //       "sanitary rinse": [
    //         /\bsani(tary)?[-\s]?rinse\b/,
    //         /\bsanitize[-\s]?rinse\b/,
    //         /\bsanitary\s*cycle\b/,
    //         /\brinse\b.*\bsanitize\b/
    //       ],
    //       "agitator": [/\bagitator\b/],
    //       "steam technology": [
    //         /\bsteam\s*technology\b/,
    //         /\bsteam[-\s]?assist\b/,
    //         /\bsteam\s*clean(ing)?\b/
    //       ],
    //       "impeller": [/\bimpeller\b/],
    //       "ada": [/\bADA\b/, /\bADA\s*(compliant|certified)?\b/],
    //       "interior light": [/\binterior\s*light\b/, /\blight\s*(included)?\b/],
    //       "approved for commercial use": [
    //         /\bapproved\s*for\s*commercial\s*use\b/,
    //         /\bcommercial[-\s]*grade\b/
    //       ],
    //       "pedestal included": [/\bpedestal\s*included\b/],
    //       "pet friendly": [/\bpet\s*friendly\b/],
    //       "eco friendly": [/\beco[-\s]*friendly\b/],
    //       "fingerprint resistant": [/\bfingerprint\s*resistant\b/],
    //       "humidity sensing": [/\bhumidity\s*sensing\b/, /\bmoisture\s*(sensing|sensor)\b/],
    //       "rebate offered": [/\brebate\s*(available|offered)?\b/],
    //       "end of cycle indicator": [
    //         /\bend\s*of\s*cycle\s*indicator\b/,
    //         /\bcycle\s*end\s*(alert|chime|signal)\b/
    //       ],
    //       "sensor dry": [/\bsensor\s*dry\b/, /\bauto\s*dry\b/],
    //       "lp conversion": [/\bLP\s*conversion\b/, /\bconvertible\s*to\s*LP\b/],
    //       "vent free": [/\bvent[-\s]?free\b/],
    //       "quick ship": [/\bquick\s*ship(ping)?\b/],
    //       "light included": [/\blight\s*included\b/],
    //     };
      
    //     for (const [label, regexes] of Object.entries(featureRegexMap)) {
    //       if (regexes.some((regex) => regex.test(allText))) {
    //         features.push(label);
    //       }
    //     }
      
    //     return features.length ? features : null;
    //   },

    HoodFeatures: (product) => {
      const market_features = product.marketing_copy?.features?.feature?.join(' ').toLowerCase() || '';
      const image_features = product.marketing_copy?.image_features?.image_feature || [];
      const image_titles = image_features.map(f => f?.title?.toLowerCase() || '').join(' ');
      const image_description = image_features.map(f => f?.feature_description?.toLowerCase() || '').join(' ');
      const short = product.marketing_copy?.short_description?.toLowerCase() || '';
      const medium = product.marketing_copy?.medium_description?.toLowerCase() || '';
      const paragraph = product.marketing_copy?.paragraph_description?.toLowerCase() || '';
      const hierarchical = (product.marketing_copy?.hierarchical_features_html || '')
          .replace(/<[^>]*>/g, '')
          .toLowerCase();

      const allText = [
          market_features,
          image_titles,
          image_description,
          short,
          medium,
          paragraph,
          hierarchical
      ].join(' ');

      const features = [];
    },
    IceFeatures: (product) => {
      const market_features = product.marketing_copy?.features?.feature?.join(' ').toLowerCase() || '';
      const image_features = product.marketing_copy?.image_features?.image_feature || [];
      const image_titles = image_features.map(f => f?.title?.toLowerCase() || '').join(' ');
      const image_description = image_features.map(f => f?.feature_description?.toLowerCase() || '').join(' ');
      const short = product.marketing_copy?.short_description?.toLowerCase() || '';
      const medium = product.marketing_copy?.medium_description?.toLowerCase() || '';
      const paragraph = product.marketing_copy?.paragraph_description?.toLowerCase() || '';
      const hierarchical = (product.marketing_copy?.hierarchical_features_html || '')
          .replace(/<[^>]*>/g, '')
          .toLowerCase();

      const allText = [
          market_features,
          image_titles,
          image_description,
          short,
          medium,
          paragraph,
          hierarchical
      ].join(' ');

      const features = [];
    },
    WarmingDrawerFeatures: (product) => {
      const market_features = product.marketing_copy?.features?.feature?.join(' ').toLowerCase() || '';
      const image_features = product.marketing_copy?.image_features?.image_feature || [];
      const image_titles = image_features.map(f => f?.title?.toLowerCase() || '').join(' ');
      const image_description = image_features.map(f => f?.feature_description?.toLowerCase() || '').join(' ');
      const short = product.marketing_copy?.short_description?.toLowerCase() || '';
      const medium = product.marketing_copy?.medium_description?.toLowerCase() || '';
      const paragraph = product.marketing_copy?.paragraph_description?.toLowerCase() || '';
      const hierarchical = (product.marketing_copy?.hierarchical_features_html || '')
          .replace(/<[^>]*>/g, '')
          .toLowerCase();

      const allText = [
          market_features,
          image_titles,
          image_description,
          short,
          medium,
          paragraph,
          hierarchical
      ].join(' ');

      const features = [];
    },
      



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

    // MicroProductType: (product) => {
    //     const code = product.classification?.minor_class_code?.toUpperCase() || "";
    //     const height = parseFloat(product.classification?.height);
    //     const short = product.marketing_copy?.short_description?.toLowerCase?.() || '';
    //     const medium = product.marketing_copy?.medium_description?.toLowerCase() || '';
    //     const paragraph = product.marketing_copy?.paragraph_description?.toLowerCase() || '';
    //     const minorDes = product.classification?.minor_class_description?.toLowerCase?.() || '';


    //     const allText = [short, medium, paragraph].join('');

    //     if (code === "HALOGN") return "halogen light";
    //     if (code === "MICBI") return "built in microwave";
    //     if (code === "MICOR" ) return "over the range micorwave";
    //     if (code === "MICCO") return "countertop";

    //     return null;
    // },

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

    //     if (builtInRegex.test(description) || builtInRegex.test(allText)) return "built in";
    //     if (counterTopRegex.test(description) || counterTopRegex.test(allText)) return "counter top";

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
    // if (minor_code.includes('BBQPRO')) types.push('pro style');
    // if (minor_code.includes('BBQPL')) types.push('pellet bbq');
    // if (minor_code.includes('BBQCH')) types.push('charcoal bbq');

    //     const sideBurnerRegex = /\bside[-\s]?burner(s)?\b/i;
    //     const exclusionRegex = /\b(optional|includes?|with|featuring)\b.{0,30}side[-\s]?burner(s)?\b/i;

    //     if (sideBurnerRegex.test(allText) &&
    //         !exclusionRegex.test(allText) &&
    //         brandCode !== 'BROILKING') {
    //         types.push('side burners');
    //     }

    //     return types.length ? types : null;
    // },

    // FreezerProductType: (product) => {
    //     const code = product.classification?.minor_class_code?.toUpperCase() || "";
    //     const height = parseFloat(product.classification?.height);
    //     const short = product.marketing_copy?.short_description?.toLowerCase?.() || '';
    //     const medium = product.marketing_copy?.medium_description?.toLowerCase() || '';
    //     const paragraph = product.marketing_copy?.paragraph_description?.toLowerCase() || '';
    //     const minorDes = product.classification?.minor_class_description?.toLowerCase?.() || '';


    //     const allText = [short, medium, paragraph].join('');

    //     if (code === "DRAWER") return "freezer drawers";
    //     if (code === "CHFRZE" || allText.includes("chest")) return "chest freezer";
    //     if (code === "UPFRZE" && height < 36) return "undercounter";
    //     if (code === "UPFRZE") return "upright freezer";

    //     return null;
    // },

    // LaundryProductType: (product) => {
    //     const minor_code = product.classification?.minor_class_code?.toUpperCase() || "";
    //     const types = [];

    //     if (minor_code.includes('PDSTL')) types.push('Laundry Accessories');
    //     if (["DRYE", "COMMD", "DRYTME", "DRYTMG", "DRYEF", "DRYGF", "DRYG", "DRYP"].includes(minor_code)) types.push('Dryers');
    //     if (["WASHF", "WASHT", "WASHHE", "WASHP", "COMMW"].includes(minor_code)) types.push('Washers');
    //     if (["WASHCE", "WASHCG"].includes(minor_code)) types.push('Washer Dryer Combos')
    //     if (["STEAM"].includes(minor_code)) types.push('Garment Steamers')
    //     if (["COMMC", "WASHC"].includes(minor_code)) types.push('WashTowers')

    //     return types.length ? types : null;
    // },

    // RangeWidth: (product) => {



    // // 1. Try to extract width from minor first
    // let raw = null;

    // if (typeof product.minor === 'string') {
    //     const match = product.minor.match(/(\d{2})(?=")/);
    //     if (match) {
    //         raw = parseInt(match[1], 10);
    //         // console.log(`🟢 Width from MINOR: ${product.minor} → ${raw}"`);
    //     }
    // }
    // // console.log('📦 Checking fallback width from classification:', product.classification);
    // // 2. Fallback to classification fields if needed
    // if (raw === null) {
    //     const rawString =
    //         product.classification?.nominal_width_in_inches_string ||
    //         product.classification?.width_string ||
    //         String(product.classification?.width || '');

    //     if (rawString) {
    //         // Match patterns like "35 7/8", "36", or "35.875"
    //         const match = rawString.match(/(\d+)(?:\s+(\d+\/\d+))?/);

    //         if (match) {
    //             const whole = parseInt(match[1], 10);
    //             const fraction = match[2] ? eval(match[2]) : 0;
    //             let numeric = whole + fraction;

    //             const upper = rawString.toUpperCase();
    //             if (upper.includes('CM')) numeric *= 0.393701;
    //             else if (upper.includes('MM') || numeric > 100) numeric *= 0.0393701;

    //             raw = Math.round(numeric);
    //             // console.log(`🟡 Width from CLASSIFICATION: ${rawString} → ${numeric}"`);
    //         } else {
    //             // fallback if above didn't match
    //             const cleaned = rawString.replace(/[^\d.]/g, '');
    //             let numeric = parseFloat(cleaned);
    //             if (!isNaN(numeric)) {
    //                 raw = Math.round(numeric);
    //                 // console.log(`🟡 (fallback) Width from CLASSIFICATION: ${rawString} → ${numeric}"`);
    //             }
    //         }
    //     }
    // }

    // if (raw === null || isNaN(raw)) return null;
    // console.log(`📏 Final raw width for product: ${raw}"`);
    // // 🎯 Map to predefined width ranges
    // if (raw <= 22) return '23" and Less';
    // if (raw >= 23 && raw < 27) return '24"';
    // if (raw >= 27 && raw < 33) return '30"';
    // if (raw >= 33 && raw < 39) return '36"';
    // if (raw >= 39 && raw < 45) return '42"';
    // if (raw >= 45 && raw < 54) return '48"';
    // if (raw >= 54 && raw < 61) return '60"';
    // if (raw >= 61) return '61" and above';

    // return null; // fallback
    // },

    // LaundryWidth: (product) => {

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
    //     if (raw <= 19) return '20" and Less';
    //     if (raw >= 20 && raw < 22) return '21"';
    //     if (raw >= 23 && raw < 25) return '24"';
    //     if (raw >= 26 && raw < 28) return '27"';
    //     if (raw >= 29 && raw < 31) return '30"';
    //     if (raw >= 32) return '31" and above';

    //     return null; // fallback
    // },


    // IceMakerWidth: (product) => {

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
    //     if (raw <= 13) return '14" and Less';
    //     if (raw >= 14 && raw < 16) return '15"';
    //     if (raw >= 17 && raw < 19) return '18"';
    //     if (raw >= 20 && raw < 22) return '21"';
    //     if (raw >= 23 && raw < 25) return '24"';
    //     if (raw >= 26) return '25" and above';

    //     return null; // fallback
    // },


    // CoffeeWidth: (product) => {

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

    //     if (raw >= 23 && raw < 25) return '24"';
    //     if (raw >= 29 && raw < 31) return '30"';

    //     return null;
    // },


    // HoodWidth: (product) => {
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

    //     // Now map raw width into the correct range
    //     if (raw < 18) return '17" or Less';
    //     if (raw >= 18 && raw <= 23) return '18"-23"';
    //     if (raw >= 24 && raw <= 36) return '24"-36"';
    //     if (raw >= 37 && raw <= 48) return '37"-48"';
    //     if (raw >= 49 && raw <= 66) return '49"-66"';
    //     if (raw > 66) return '67" or more';

    //     // If width falls outside defined groups, return null
    //     return null;
    // },

    // WarmingDrawerWidth: (product) => {
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
    //     if (raw <= 19) return '20" and Less';
    //     if (raw >= 19.5 && raw < 22) return '21"';
    //     if (raw >= 23 && raw < 25) return '24"';
    //     if (raw >= 26 && raw < 28) return '27"';
    //     if (raw >= 29 && raw < 31) return '30"';
    //     if (raw >= 32) return '31" and above';

    //     return null;
    // },

    // BbqWidth: (product) => {
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
    //     if (raw >= 45 && raw < 50) return '48"';
    //     if (raw >= 51 && raw < 53) return '52"';
    //     if (raw >= 54 && raw < 58) return '56"';
    //     if (raw >= 59 && raw < 61) return '60"';
    //     if (raw >= 61) return '61" and above';

    //     return null; // fallback
    // },

    // CooktopWidth: (product) => {
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

    // OvenWidth: (product) => {
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
    //     if (raw >= 33 && raw < 38) return '36"';
    //     if (raw >= 39) return '37" and above';

    //     return null;
    // },

    // CooktopProductType: (product) => {
    //     const short = product.marketing_copy?.short_description?.toLowerCase?.() || '';
    //     const medium = product.marketing_copy?.medium_description?.toLowerCase() || '';
    //     const paragraph = product.marketing_copy?.paragraph_description?.toLowerCase?.() || '';
    //     const minorDes = product.classification?.minor_class_description?.toLowerCase?.() || '';

    //     const allText = [short, medium, paragraph, minorDes].join(' ');

    //     if (allText.includes('rangetop') || allText.includes('range top') || allText.includes('range-top')) return 'rangetop';
    //     if (allText.includes('cooktop') || allText.includes('cook top') || allText.includes('cook-top')) return 'cooktop';


    //     return null;
    // },

    // CooktopFuelType: (product) => {
    //     const code = product.classification?.minor_class_code?.toUpperCase() || "";
    //     const height = parseFloat(product.classification?.height);
    //     const short = product.marketing_copy?.short_description?.toLowerCase() || '';
    //     const medium = product.marketing_copy?.medium_description?.toLowerCase() || '';
    //     const paragraph = product.marketing_copy?.paragraph_description?.toLowerCase() || '';
    //     const minorDes = product.classification?.minor_class_description?.toLowerCase() || '';
    //     const color_code = (product.classification?.color_code_description || '').toLowerCase();
    //     const allText = [short, medium, paragraph, minorDes].join(' ');

    //     const types = [];

    //     if (allText.includes('induction')) types.push('induction');
    //     if (code.includes('ERSURF')) types.push('electric');
    //     if (code.includes('GRSURF')) types.push('gas');

    //     return types.length ? types : null;

    // },

    // CooktopWidth: (product) => {
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
    //     // 🎯 Map to predefined width cooktops
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

    // HoodProductType: (product) => {

    //     const code = product.classification?.minor_class_code?.toUpperCase() || "";
    //     const height = parseFloat(product.classification?.height);
    //     const short = product.marketing_copy?.short_description?.toLowerCase?.() || '';
    //     const medium = product.marketing_copy?.medium_description?.toLowerCase() || '';
    //     const paragraph = product.marketing_copy?.paragraph_description?.toLowerCase() || '';
    //     const minorDes = product.classification?.minor_class_description?.toLowerCase?.() || '';


    //     const allText = [short, medium, paragraph].join('');

    //     if (code === "DUCTED") return "ducted hood";
    //     if (code === "DCTLES") return "ductless hood";
    //     if (code === "PROHD" ) return "professional hood";
    //     if (code === "CONVHD") return "convertible hood";
    //     if (code === "INSERT") return "hood inserts";

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

    // RefrigConfiguration: (product) => {
    //     const description = product.classification?.minor_class_description?.toLowerCase() || "";
    //     const paragraph = product.marketing_copy?.paragraph_description?.toLowerCase() || "";
    //     const features = (product.marketing_copy?.features?.feature || []).join(" ").toLowerCase();
    //     const minor_code = product.classification?.minor_class_code?.toLowerCase() || "";


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

    CoffeeConfiguration: (product) => {
        const market_features = product.marketing_copy?.features?.feature?.join(' ').toLowerCase() || '';

        const image_features = product.marketing_copy?.image_features?.image_feature || [];
        const image_titles = image_features.map(f => f?.title?.toLowerCase() || '').join(' ');
        const image_description = image_features.map(f => f?.feature_description?.toLowerCase() || '').join(' ');

        const short = product.marketing_copy?.short_description?.toLowerCase() || '';
        const medium = product.marketing_copy?.medium_description?.toLowerCase() || '';
        const paragraph = product.marketing_copy?.paragraph_description?.toLowerCase() || '';

        const hierarchical = (product.marketing_copy?.hierarchical_features_html || '')
            .replace(/<[^>]*>/g, '')
            .toLowerCase();

        const allText = [
            market_features,
            image_titles,
            image_description,
            short,
            medium,
            paragraph,
            hierarchical
        ].join(' ');

        const plumbedInRegex = /\bplumbed(?:[-\s]?in)?\b/;

        if (plumbedInRegex.test(allText)) return 'Plumbed';

        return null;
    },

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
