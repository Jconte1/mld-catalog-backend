// app/api/search/route.js
import prisma from "../../../lib/prisma";

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': 'https://www.mld.com',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin',
  };
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

/**
 * GET /api/search?q=wolf
 */
export async function GET(req) {
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') || '').toLowerCase();

  if (!q || q.trim() === '') {
    return Response.json({ products: [], productTypes: [] }, { headers: corsHeaders() });
  }

  try {
    console.log('🔎 Received search query:', q);

    const tokens = q.trim().split(/\s+/);

    const andConditions = tokens.map((token) => ({
      OR: [
        { model: { contains: token, mode: 'insensitive' } },
        { brand: { contains: token, mode: 'insensitive' } },
        { major: { contains: token, mode: 'insensitive' } },
        { minor: { contains: token, mode: 'insensitive' } },
        { type:  { contains: token, mode: 'insensitive' } },
        {
          data: {
            path: ['marketing_copy', 'short_description'],
            string_contains: token
          }
        }
      ]
    }));

    const productsRaw = await prisma.products.findMany({
      where: {
        AND: [
          ...andConditions,
          {
            NOT: {
              minor: { contains: 'accessories', mode: 'insensitive' }
            }
          }
        ]
      },
      take: 20,
      select: {
        id: true,
        model: true,
        brand: true,
        major: true,
        minor: true,
        type: true,
        slug: true,
      },
    });

    console.log(`✅ Found ${productsRaw.length} matching raw products.`);

    const products = productsRaw.slice(0, 5).map((p) => ({
      id: p.id,
      model: p.model,
      brand: p.brand,
      major: p.major,
      minor: p.minor,
      type: p.type?.toLowerCase(),
      slug: p.slug,
    }));

    const typeSet = new Set();
    const productTypes = [];

    for (const p of productsRaw) {
      if (p.major && p.minor && p.type) {
        const key = `${p.major}||${p.minor}||${p.type}`;
        if (!typeSet.has(key)) {
          typeSet.add(key);
          productTypes.push({
            major: p.major,
            minor: p.minor,
            type: p.type?.toLowerCase(),
            category: 'appliances',
          });
        }
      }
      if (productTypes.length >= 10) break;
    }

    console.log(`✅ Returning ${products.length} products and ${productTypes.length} productTypes.`);
    return Response.json({ products, productTypes }, { headers: corsHeaders() });
  } catch (error) {
    console.error('❌ Search API error:', error);
    return Response.json({ error: 'Server error. Please try again.' }, { status: 500, headers: corsHeaders() });
  }
}
