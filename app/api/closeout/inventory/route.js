// app/api/closeout/inventory/route.js
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

async function sendFailureEmail(toEmail, failures) {
  if (!failures.length) return;
  const transporter = makeTransporter();

  const htmlContent = `
    <h2>Inventory Sync Failures</h2>
    <p>The following inventory items could not be processed because they were not found in the product catalog:</p>
    <table border="1" cellpadding="6" cellspacing="0">
      <thead>
        <tr>
          <th>Acumatica SKU</th>
          <th>Normalized Model Number</th>
          <th>Reason</th>
        </tr>
      </thead>
      <tbody>
        ${failures
          .map(
            (f) => `
          <tr>
            <td>${f.acumaticaSku}</td>
            <td>${f.modelNumber}</td>
            <td>${f.reason}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `;

  await transporter.sendMail({
    from: `"Inventory Sync" <${process.env.AUTO_EMAIL}>`,
    to: toEmail,
    cc: process.env.CC_EMAIL,
    subject: '⚠️ Inventory Sync Failures Detected',
    html: htmlContent,
  });

  console.log(`✅ Failure email sent to ${toEmail}`);
}

export async function POST(req) {
  try {
    const body = await req.json();

    const inserted = body.Inserted || [];
    const deleted = body.Deleted || [];

    if (inserted.length === 0 && deleted.length === 0) {
      return Response.json(
        { error: 'No inventory records to process' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const updatedRecords = [];
    const failures = [];

    if (inserted.length > 0) {
      for (const item of inserted) {
        const acumaticaSku = (item.InventoryID || '').trim();
        const parts = acumaticaSku.split(' ');
        if (parts.length < 3) {
          console.log('❌ Invalid acumaticaSku format. Parts:', parts);
          continue;
        }

        const modelNumber = parts[1];
        const normalizedModelNumber = modelNumber.replace(/[-\/\s]/g, '');
        const qtyOnHand = item.QtyOnHand;
        const defaultPriceRaw = item.DefaultPrice;
        const defaultPrice = typeof defaultPriceRaw === 'number' ? defaultPriceRaw : null;

        console.log(
          `🔎 Processing Item - acumaticaSku: "${acumaticaSku}", modelNumber: "${modelNumber}", normalizedModelNumber: "${normalizedModelNumber}"`
        );

        const existingRecord = await prisma.closeout_inventory.findFirst({
          where: {
            modelNumber: normalizedModelNumber,
            acumaticaSku,
          },
        });

        if (existingRecord) {
          await prisma.closeout_inventory.update({
            where: { id: existingRecord.id },
            data: {
              quantity: qtyOnHand,
              lastSyncedAt: new Date(),
              price: defaultPrice,
            },
          });
          console.log(`✅ Updated existing closeout_inventory: "${normalizedModelNumber}"`);
          updatedRecords.push({ modelNumber: normalizedModelNumber, acumaticaSku, qtyOnHand, defaultPrice });
        } else {
          const product = await prisma.products.findFirst({
            where: { model: normalizedModelNumber },
          });

          if (!product) {
            console.log(
              `❌ Product not found in catalog for normalizedModelNumber: "${normalizedModelNumber}", acumaticaSku: "${acumaticaSku}"`
            );
            failures.push({
              acumaticaSku,
              modelNumber: normalizedModelNumber,
              reason: 'Product not found in catalog',
            });
            continue;
          }

          await prisma.closeout_inventory.create({
            data: {
              productId: product.id,
              modelNumber: normalizedModelNumber,
              acumaticaSku,
              quantity: qtyOnHand,
              lastSyncedAt: new Date(),
              price: defaultPrice,
            },
          });
          console.log(`✅ Created new closeout_inventory for normalizedModelNumber: "${normalizedModelNumber}"`);
          updatedRecords.push({ modelNumber: normalizedModelNumber, acumaticaSku, qtyOnHand, defaultPrice });
        }
      }

      if (failures.length > 0) {
        await sendFailureEmail(process.env.END_USER_EMAIL, failures);
      }

      return Response.json(
        { success: true, updatedRecords, failures },
        { headers: corsHeaders() }
      );
    }

    // DELETE events
    if (deleted.length > 0) {
      for (const item of deleted) {
        const acumaticaSku = (item.InventoryID || '').trim();
        const parts = acumaticaSku.split(' ');
        if (parts.length < 3) {
          console.log('❌ Invalid acumaticaSku format. Parts:', parts);
          continue;
        }

        const modelNumber = parts[1];
        const normalizedModelNumber = modelNumber.replace(/[-\/\s]/g, '');
        const qtyOnHand = item.QtyOnHand;
        const defaultPriceRaw = item.DefaultPrice;
        const defaultPrice = typeof defaultPriceRaw === 'number' ? defaultPriceRaw : null;

        console.log(
          `🔎 Processing DELETE Item - acumaticaSku: "${acumaticaSku}", modelNumber: "${modelNumber}", normalizedModelNumber: "${normalizedModelNumber}"`
        );

        const existingRecord = await prisma.closeout_inventory.findFirst({
          where: {
            modelNumber: normalizedModelNumber,
            acumaticaSku,
          },
        });

        if (existingRecord) {
          let newQuantity = existingRecord.quantity - qtyOnHand;
          if (newQuantity < 0) newQuantity = 0;

          await prisma.closeout_inventory.update({
            where: { id: existingRecord.id },
            data: {
              quantity: newQuantity,
              lastSyncedAt: new Date(),
              price: defaultPrice,
            },
          });

          console.log(
            `✅ Updated quantity for existing closeout_inventory: "${normalizedModelNumber}", newQuantity: ${newQuantity}`
          );
          updatedRecords.push({ modelNumber: normalizedModelNumber, acumaticaSku, newQuantity });
        } else {
          console.warn(`⚠️ No existing closeout_inventory found for acumaticaSku: "${acumaticaSku}"`);
        }
      }

      return Response.json({ success: true, updatedRecords }, { headers: corsHeaders() });
    }
  } catch (error) {
    console.error('Error in /api/closeout/inventory:', error);
    return Response.json({ error: 'Server error' }, { status: 500, headers: corsHeaders() });
  }
}
