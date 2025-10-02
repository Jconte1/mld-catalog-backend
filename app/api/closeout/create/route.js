// app/api/closeout/create/route.js
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';

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

function makeTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.AUTO_EMAIL,
      pass: process.env.AUTO_EMAIL_PASSWORD,
    },
  });
}

async function sendErrorEmail(subject, message) {
  const transporter = makeTransporter();
  await transporter.sendMail({
    from: `"Closeout API Error" <${process.env.AUTO_EMAIL}>`,
    to: process.env.END_USER_EMAIL,
    cc: process.env.CC_EMAIL,
    subject,
    text: message,
  });
}

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body?.Inserted || !Array.isArray(body.Inserted) || body.Inserted.length === 0) {
      return Response.json(
        { error: 'Invalid payload: Inserted array is required.' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const insertedItem = body.Inserted[0];
    const rawInventoryID = insertedItem.InventoryID;

    if (!rawInventoryID) {
      return Response.json(
        { error: 'Invalid payload: InventoryID is required.' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const acumaticaSku = rawInventoryID.trim();
    const parts = acumaticaSku.split(' ');
    if (parts.length < 3) {
      return Response.json(
        { error: 'Invalid acumaticaSku format. Expected at least 3 parts.' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const modelNumber = parts[1];
    const defaultPriceRaw = insertedItem.DefaultPrice;
    const defaultPrice = typeof defaultPriceRaw === 'number' ? defaultPriceRaw : null;

    const product = await prisma.products.findFirst({
      where: { model: modelNumber },
    });

    if (!product) {
      const subject = '❌ Product Not Found in Catalog (Create Endpoint)';
      const message = `Product not found in catalog.\n\nModel Number: "${modelNumber}"\nAcumatica SKU: "${acumaticaSku}"`;
      await sendErrorEmail(subject, message);

      return Response.json(
        { error: 'Product not found in catalog.' },
        { status: 404, headers: corsHeaders() }
      );
    }

    const closeoutRecord = await prisma.closeout_inventory.upsert({
      where: { acumaticaSku },
      update: {
        price: defaultPrice,
        lastSyncedAt: new Date(),
      },
      create: {
        productId: product.id,
        modelNumber,
        acumaticaSku,
        quantity: 0,
        price: defaultPrice,
        lastSyncedAt: new Date(),
      },
    });

    return Response.json({ success: true, closeoutRecord }, { headers: corsHeaders() });
  } catch (error) {
    console.error('Error in /api/closeout/create:', error);

    const subject = '🔥 Server Error in Create Endpoint';
    const message = `An error occurred in /api/closeout/create:\n\n${error.stack || error.message}`;
    try {
      await sendErrorEmail(subject, message);
    } catch (e) {
      console.error('Failed to send error email:', e);
    }

    return Response.json({ error: 'Server error' }, { status: 500, headers: corsHeaders() });
  }
}
