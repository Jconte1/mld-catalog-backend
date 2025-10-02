import prisma from '../../../lib/prisma';
import normalize from '../../../src/utils/normalize';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': 'https://www.mld.com',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    // allow localhost too (matches your old express cors list)
    'Vary': 'Origin',
  };
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(req) {
  const url = new URL(req.url);
  const type = normalize(url.searchParams.get('type') || '');
  if (!type) {
    return Response.json({ error: 'Missing type' }, { status: 400, headers: corsHeaders() });
  }

  try {
    const products = await prisma.products.findMany({
      where: { type: { equals: type, mode: 'insensitive' } },
      select: {
        brand: true,
        productType: true,
        configuration: true,
        features: true,
        width: true,
        fuelType: true,
      },
    });

    const brandSet = new Set();
    const productTypeSet = new Set();
    const configurationSet = new Set();
    const featureSet = new Set();
    const widthSet = new Set();
    const fuelTypeSet = new Set();

    products.forEach((p) => {
      if (p.brand) brandSet.add(p.brand);
      if (Array.isArray(p.productType)) {
        p.productType.forEach((pt) => {
          if (typeof pt === 'string' && pt.trim() !== '') productTypeSet.add(pt.trim());
        });
      }
      if (Array.isArray(p.configuration)) {
        p.configuration.forEach((config) => {
          if (typeof config === 'string' && config.trim() !== '') configurationSet.add(config.trim());
        });
      }
      if (Array.isArray(p.features)) p.features.forEach((f) => { if (f) featureSet.add(f); });
      if (p.width) widthSet.add(p.width);
      if (Array.isArray(p.fuelType)) {
        p.fuelType.forEach((ft) => {
          if (typeof ft === 'string' && ft.trim() !== '') fuelTypeSet.add(ft.trim());
        });
      }
    });

    return Response.json({
      Brand: Array.from(brandSet).sort(),
      ...(productTypeSet.size > 0 && { productType: Array.from(productTypeSet).sort() }),
      ...(configurationSet.size > 0 && { Configuration: Array.from(configurationSet).sort() }),
      Width: Array.from(widthSet).sort(),
      ...(fuelTypeSet.size > 0 && { FuelType: Array.from(fuelTypeSet).sort() }),
      Features: Array.from(featureSet).sort(),
    }, { headers: corsHeaders() });
  } catch (err) {
    console.error('❌ Failed to get filter options:', err);
    return Response.json({ error: 'Failed to load filter options' }, { status: 500, headers: corsHeaders() });
  }
}
