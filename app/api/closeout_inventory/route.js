// app/api/closeout_inventory/route.js
import prisma from "../../../lib/prisma";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "https://www.mld.com/",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

// Map URL store ids -> actual warehouse names in DB
const WAREHOUSE_BY_STORE_ID = {
  "salt-lake": "SALT LAKE CLOSEOUT",
  boise: "BOISE CLOSEOUT",
  // add more stores here as needed
};

// 🔹 bins we never want to show on the site
const RESTRICTED_BINS = ["SOLD", "AUDIT", "STAGE", "SERVICE", "RETURN", "CLQUEUE"];

export async function GET(req) {
  try {
    const url = new URL(req.url);

    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "15", 10);
    const typeParam = url.searchParams.get("type");
    const type = typeParam ? typeParam.toUpperCase() : null;
    const storeId = url.searchParams.get("storeId"); // 👈 from frontend ?storeId=salt-lake
    const skip = (page - 1) * limit;

    const where = {};

    // 🔹 Filter by store / warehouse
    if (storeId) {
      const warehouseName = WAREHOUSE_BY_STORE_ID[storeId];

      if (warehouseName) {
        where.warehouse = { equals: warehouseName };
      } else {
        // Unknown storeId -> return empty result set
        return Response.json(
          {
            page,
            limit,
            total: 0,
            totalPages: 0,
            data: [],
          },
          { headers: corsHeaders() }
        );
      }
    }

    // 🔹 Filter by product type
    if (type) {
      where.product = { type: { equals: type } };
    }

    // 🔹 Only items with quantity > 0
    where.quantity = { gt: 0 };

    // 🔹 Exclude restricted bins (SOLD, AUDIT, etc.)
    //    Adjust "bin" if your Prisma model uses a different field name
    where.bin = { notIn: RESTRICTED_BINS };

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
            slug: true,
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
      { error: "Database query failed" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
