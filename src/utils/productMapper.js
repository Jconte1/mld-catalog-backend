import { predefinedTypes } from "./productTypes.js";

export function normalizeType(major, minor, classification, marketing_copy) {
  const majorUpper = major?.toUpperCase() || '';
  const minorUpper = minor?.toUpperCase() || '';
  const shortDes = marketing_copy?.short_description?.toUpperCase() || '';
  const major_code = classification?.major_class_code?.toUpperCase() || '';


  if (!majorUpper && !minorUpper) return null;
  if (major_code.includes('MIC') || minorUpper.includes('MICROWAVE')) return 'MICROWAVE';
  if (majorUpper === 'ACCESSORIES') return null;
  if (minorUpper.includes('WARMING DRAWER')) return 'WARMING DRAWERS';

  if (minorUpper.includes('COOKTOP') || minorUpper.includes('RANGETOP')) return 'COOKTOPS AND RANGETOPS';
  if (minorUpper.includes('OVEN')) return 'BUILT IN OVENS';

  if (majorUpper.includes('SMALL APPLIANCES')) {
    if (minorUpper.includes('WARMING DRAWER')) return 'WARMING DRAWERS';
    if (minorUpper.includes('COFFEE')) return 'COFFEE SYSTEMS';
    return 'MISC';
  }

  if (majorUpper.includes('RANGES') || minorUpper.includes('RANGE')) return 'RANGES';

  if (majorUpper.includes('REFRIGERATORS')) {
    if (minorUpper.includes('REFRIGERATED DRAWER') && shortDes.includes('FREEZER')) return 'FREEZERS';
    return 'REFRIGERATORS';
  }
  if (majorUpper.includes('FREEZERS')) {
    if (minorUpper.includes('ICE MAKERS')) return 'ICE MAKERS';
    return 'FREEZERS';
  }

  if (majorUpper.includes('DISHWASHERS')) return 'DISHWASHERS';
  if (major_code.includes('BBQ') || minorUpper.includes('BARBEQUES')) return 'OUTDOOR GRILLS';
  if (majorUpper.includes('HOODS')) return 'VENTILATION';
  if (majorUpper.includes('LAUNDRY')) return 'LAUNDRY';

  for (const type of predefinedTypes) {
    if (majorUpper.includes(type) || minorUpper.includes(type)) return type;
  }

  return 'MISC';
}


function selectBestImage(imageArray) {
  if (!Array.isArray(imageArray)) return '';
  const sorted = imageArray.sort((a, b) => {
    const aUrl = a.full_size_url || '';
    const bUrl = b.full_size_url || '';
    return scoreImage(bUrl) - scoreImage(aUrl);
  });
  return sorted[0]?.full_size_url || '';
}

function scoreImage(url) {
  if (!url) return 0;
  let score = 0;
  if (url.includes('.jpg')) score += 2;
  if (!url.includes('?')) score += 1;
  return score;
}

export default function mapSpecToProduct(spec, categoryFromRoute, typeFromRoute) {
  const classification = spec?.data?.classification || spec?.classification || {};
  const marketing_copy = spec?.data?.marketing_copy || spec?.marketing_copy || {};
  const media = spec?.data?.media || spec?.media || {};
  const managed_data = spec?.data?.managed_data || spec?.managed_data || {};

  const model =
    typeof classification?.manufacturer_pn === 'string' && classification.manufacturer_pn.trim()
      ? classification.manufacturer_pn
      : typeof classification?.pn === 'string' && classification.pn.trim()
        ? classification.pn
        : 'Model not available';
  const slug = classification.pn || '';
  const brand = classification.brand_name || 'Unknown';
  const width = classification.width_string || null;
  const height = classification.height_string || null;
  const depth = classification.depth_string || null;

  const name = marketing_copy?.short_description || 'Unnamed Product';
  const short_description = marketing_copy?.short_description || '';
  const paragraph_description = marketing_copy?.paragraph_description || '';

  const rawFeatures = marketing_copy?.features?.feature;
  const features = Array.isArray(rawFeatures)
    ? rawFeatures
    : typeof rawFeatures === 'string'
      ? [rawFeatures]
      : [];

  const hierarchical_features_html = marketing_copy?.hierarchical_features_html || '';

  const image_features = (Array.isArray(marketing_copy?.image_features?.image_feature)
    ? marketing_copy.image_features.image_feature
    : marketing_copy?.image_features?.image_feature
      ? [marketing_copy.image_features.image_feature]
      : []).map((feature) => ({
        title: feature.title || '',
        feature_description: feature.feature_description || '',
        image_file_name: feature.image_file_name || '',
      }));

  const spec_table_as_key_value_pairs =
    Array.isArray(marketing_copy?.spec_table_as_key_value_pairs)
      ? marketing_copy.spec_table_as_key_value_pairs
      : [];

  const pdfs = Array.isArray(media?.pdfs?.pdf)
    ? media.pdfs.pdf
    : media?.pdfs?.pdf
      ? [media.pdfs.pdf]
      : [];

  const imageArray = Array.isArray(media?.images?.image)
    ? media.images.image
    : media?.images?.image
      ? [media.images.image]
      : [];

  const mediaImage = selectBestImage(imageArray);

  const images = imageArray.map((img) => ({
    file_name: img.file_name || '',
    full_size_url: img.full_size_url || '',
    thumbnail_url: img.thumbnail_url || '',
  }));

  const productVideoRaw = classification?.product_videos?.product_video;

const videos = Array.isArray(productVideoRaw)
  ? productVideoRaw.map((video) => ({
      title: video?.title || '',
      video_file_name: video?.video_file_name || '',
      thumbnail_image_file_name: video?.thumbnail_image_file_name || '',
      video_type: video?.video_type || '',
    }))
  : productVideoRaw
  ? [
      {
        title: productVideoRaw?.title || '',
        video_file_name: productVideoRaw?.video_file_name || '',
        thumbnail_image_file_name: productVideoRaw?.thumbnail_image_file_name || '',
        video_type: productVideoRaw?.video_type || '',
      },
    ]
  : [];


  const regular_fpv = managed_data?.column_data?.REGULAR_FPV || null;

  const major = classification?.major_class_description || '';
  const minor = classification?.minor_class_description || '';
  const normalizedType = normalizeType(major, minor, classification, marketing_copy);

  const relatedKeys = Array.isArray(classification?.related_items?.related_item_key)
    ? classification.related_items.related_item_key.map((key) =>
      key.includes(':') ? key.split(':')[1] : key
    )
    : classification?.related_items?.related_item_key
      ? [classification.related_items.related_item_key].map((key) =>
        key.includes(':') ? key.split(':')[1] : key
      )
      : [];



  return {
    slug,
    model,
    name,
    image: mediaImage,
    brand,
    width,
    height,
    depth,
    date: spec?.created_at || '2023-01-01',
    category: categoryFromRoute,
    type: normalizedType,
    rawCategory: major,
    rawType: minor,
    relatedKeys,
    videos,
    classification: {
      brand_name: brand,
      pn: slug,
      width_string: width,
      height_string: height,
      height: classification?.height || null,
      depth_string: depth,
      nominal_width_in_inches_string: classification?.nominal_width_in_inches_string || null,
      minor_class_code: classification?.minor_class_code || '',
      minor_class_description: classification?.minor_class_description || '',
    },
    marketing_copy: {
      short_description,
      paragraph_description,
      features,
      image_features,
      spec_table_html: spec_table_as_key_value_pairs,
      hierarchical_features_html,
    },
    media: {
      images,
      pdfs,
    },
    managed_data: {
      regular_fpv,
    },
  };
}
