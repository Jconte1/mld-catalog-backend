// app/api/closeout_inventory/route.js
import prisma from '@/lib/prisma';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': 'https://www.mld.com',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    Vary: 'Origin',
  };
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '15', 10);
    const typeParam = url.searchParams.get('type');
    const type = typeParam ? typeParam.toUpperCase() : null;
    const skip = (page - 1) * limit;

    const where =
      type
        ? { product: { type: { equals: type } } }   // filter on related table
        : {};

    const rows = await prisma.closeout_inventory.findMany({
      skip,
      take: limit,
      where,
      include: {
        product: {
          select: {
            id: true,
            brand: true,
            model: true,
            data: true,
            type: true,
            major: true,
            minor: true,
          },
        },
      },
    });

    const total = await prisma.closeout_inventory.count({ where });

    return Response.json(
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        data: rows,
      },
      { headers: corsHeaders() }
    );
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: 'Database query failed' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
