import prisma from '../../../../../lib/prisma';
import mapSpecToProduct from '../../../../../src/utils/productMapper';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': 'https://www.mld.com/',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    Vary: 'Origin',
  };
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

const WAREHOUSE_BY_STORE_ID = {
  'salt-lake': 'SALT LAKE CLOSEOUT',
  boise: 'BOISE CLOSEOUT',
};

export async function GET(req, { params }) {
  const { storeId, slug } = params || {};

  if (!storeId || !slug) {
    return Response.json(
      { error: 'Missing storeId or slug' },
      { status: 400, headers: corsHeaders() }
    );
  }

  const warehouse = WAREHOUSE_BY_STORE_ID[storeId];
  if (!warehouse) {
    return Response.json(
      { error: 'Unknown storeId' },
      { status: 404, headers: corsHeaders() }
    );
  }

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

    const closeoutItem = await prisma.closeout_inventory.findFirst({
      where: {
        productId: product.id,
        warehouse,
        quantity: { gt: 0 },
      },
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
            slug: true,
          },
        },
      },
    });

    if (!closeoutItem) {
      return Response.json(
        { error: 'Closeout item not found' },
        { status: 404, headers: corsHeaders() }
      );
    }

    const mapped = mapSpecToProduct(product.data, product.major, product.minor);
    const mergedProduct = {
      ...mapped,
      quantity: closeoutItem.quantity,
      msrp: closeoutItem.msrp,
      price: closeoutItem.price,
    };

    return Response.json(
      { product: mergedProduct, closeoutItem },
      { headers: corsHeaders() }
    );
  } catch (err) {
    console.error('Failed to fetch closeout item by store/slug:', err);
    return Response.json(
      { error: 'Failed to fetch closeout item' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
