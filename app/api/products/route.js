import prisma from '../../../lib/prisma';
import normalize from '../../../src/utils/normalize';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': 'https://www.mld.com',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin',
  };
}

export const dynamic = 'force-dynamic'; // fetch fresh data

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(req) {
  const url = new URL(req.url);
  const rawType = url.searchParams.get('type');
  const type = rawType ? normalize(rawType) : undefined;
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limitParam = url.searchParams.get('limit');
  const filters = url.searchParams.get('filters');
  const sort = url.searchParams.get('sort');
  const fields = url.searchParams.get('fields');
  const sitemapMode = fields === 'sitemap' || url.searchParams.get('sitemap') === 'true';

  if (!sitemapMode) {
    console.log('📥 FULL QUERY OBJECT:', Object.fromEntries(url.searchParams));
  }

  try {
    if (filters) {
      const parsed = JSON.parse(filters);
      if (!sitemapMode) {
        console.log('🔍 Parsed filters object:', parsed);
      }
    }
  } catch (e) {
    console.error('❌ Failed to parse filters JSON:', e);
  }

  const parsedLimit = limitParam === 'ALL' ? null : parseInt(limitParam || '15', 10);
  const skip = page > 1 && parsedLimit ? (page - 1) * parsedLimit : 0;

  let typeClause;
  let filterClause = {};

  if (type) typeClause = { type: { equals: type.toUpperCase() } };

  if (filters) {
    try {
      const parsedFilters = JSON.parse(filters);

      if (parsedFilters.features?.length)
        filterClause.features = { hasEvery: parsedFilters.features.map(f => f.trim().toLowerCase()) };

      if (parsedFilters.brand?.length)
        filterClause.OR = parsedFilters.brand.map(b => ({ brand: { equals: b, mode: 'insensitive' } }));

      if (parsedFilters.width?.length)
        filterClause.width = { in: parsedFilters.width };

      if (parsedFilters.fueltype?.length)
        filterClause.fuelType = { hasSome: parsedFilters.fueltype.map(ft => ft.trim().toLowerCase()) };

      if (parsedFilters.configuration?.length)
        filterClause.configuration = { hasSome: parsedFilters.configuration.map(c => c.trim().toLowerCase()) };

      if (parsedFilters.producttype?.length)
        filterClause.productType = { hasSome: parsedFilters.producttype.map(c => c.trim().toLowerCase()) };
    } catch (err) {
      console.error('❌ Failed to parse filters:', filters, err);
    }
  }

  const where = { ...typeClause, ...filterClause };

  if (!sitemapMode) {
    console.log('📥 sort param:', sort);
  }

  let orderBy;
  if (sort === 'name_asc') orderBy = { model: 'asc' };
  else if (sort === 'name_desc') orderBy = { model: 'desc' };
  else if (sort === 'popular') orderBy = { popularity: 'desc' };
  else orderBy = { created_at: 'desc' };

  try {
    if (!sitemapMode) {
      console.log('🟣 Using orderBy:', orderBy);
    }

    const totalCount = await prisma.products.count({ where });

    const products = await prisma.products.findMany({
      where,
      skip,
      take: parsedLimit ?? undefined,
      orderBy,
      select: sitemapMode
        ? {
            slug: true,
            category: true,
            type: true,
            created_at: true,
          }
        : {
            id: true, slug: true, category: true, type: true, model: true,
            brand: true, major: true, minor: true, features: true, configuration: true, data: true,
          },
    });

    return Response.json({ products, totalCount }, { headers: corsHeaders() });
  } catch (err) {
    console.error('❌ Prisma error in /api/products:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    return Response.json({ error: 'Failed to fetch products' }, { status: 500, headers: corsHeaders() });
  }
}
