import prisma from '../../../../lib/prisma';
import mapSpecToProduct from '../../../../src/utils/productMapper';

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

export async function GET(req, { params }) {
  const { slug } = params;

  try {
    const product = await prisma.products.findFirst({
      where: { slug: { equals: slug, mode: 'insensitive' } },
      select: {
        id: true,
        slug: true,
        model: true,
        brand: true,
        major: true,
        minor: true,
        type: true,
        data: true,
      },
    });

    if (!product) {
      return Response.json(
        { error: 'Product not found' },
        { status: 404, headers: corsHeaders() }
      );
    }

    // ✅ minimal: fetch closeout fields for this product (no store filter)
    const closeout = await prisma.closeout_inventory.findFirst({
      where: {
        productId: product.id, // assumes closeout_inventory has productId FK
      },
      select: {
        quantity: true,
        msrp: true,
        price: true,
      },
    });

    const mapped = mapSpecToProduct(product.data, product.major, product.minor);

    // ✅ merge fields onto the response (only when they exist)
    const merged = {
      ...mapped,
      ...(closeout
        ? { quantity: closeout.quantity, msrp: closeout.msrp, price: closeout.price }
        : {}),
    };

    return Response.json(merged, { headers: corsHeaders() });
  } catch (err) {
    console.error('❗ Failed to fetch product by slug:', err);
    return Response.json(
      { error: 'Failed to fetch product' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
