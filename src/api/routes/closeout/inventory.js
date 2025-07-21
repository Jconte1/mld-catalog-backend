import express from 'express';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const router = new express.Router();
const prisma = new PrismaClient();

// Email utility
async function sendFailureEmail(toEmail, failures) {
  if (!failures.length) return;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.AUTO_EMAIL,
      pass: process.env.AUTO_EMAIL_PASSWORD
    }
  });

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
        ${failures.map(f => `
          <tr>
            <td>${f.acumaticaSku}</td>
            <td>${f.modelNumber}</td>
            <td>${f.reason}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  await transporter.sendMail({
    from: `"Inventory Sync" <${process.env.AUTO_EMAIL}>`,
    to: toEmail,
    cc: process.env.CC_EMAIL,   
    subject: '⚠️ Inventory Sync Failures Detected',
    html: htmlContent
  });

  console.log(`✅ Failure email sent to ${toEmail}`);
}

// Route
router.post('/inventory', async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not Accepted' });
    }

    const inserted = req.body.Inserted || [];
    const deleted = req.body.Deleted || [];

    if (inserted.length === 0 && deleted.length === 0) {
      return res.status(400).json({ error: 'No inventory records to process' });
    }

    const updatedRecords = [];
    const failures = [];

    if (inserted.length > 0) {
      for (const item of inserted) {
        const acumaticaSku = item.InventoryID.trim();
        const parts = acumaticaSku.split(" ");
        if (parts.length < 3) {
          console.log(`❌ Invalid acumaticaSku format. Parts:`, parts);
          continue;
        }

        const modelNumber = parts[1];
        const normalizedModelNumber = modelNumber.replace(/[-\/\s]/g, '');
        const qtyOnHand = item.QtyOnHand;
        const defaultPriceRaw = item.DefaultPrice;
        const defaultPrice = typeof defaultPriceRaw === 'number' ? defaultPriceRaw : null;

        console.log(`🔎 Processing Item - acumaticaSku: "${acumaticaSku}", modelNumber: "${modelNumber}", normalizedModelNumber: "${normalizedModelNumber}"`);

        const existingRecord = await prisma.closeout_inventory.findFirst({
          where: {
            modelNumber: normalizedModelNumber,
            acumaticaSku: acumaticaSku
          }
        });

        if (existingRecord) {
          await prisma.closeout_inventory.update({
            where: { id: existingRecord.id },
            data: {
              quantity: qtyOnHand,
              lastSyncedAt: new Date(),
              price: defaultPrice,
            }
          });
          console.log(`✅ Updated existing closeout_inventory: "${normalizedModelNumber}"`);
          updatedRecords.push({ modelNumber: normalizedModelNumber, acumaticaSku, qtyOnHand, defaultPrice });
        } else {
          const product = await prisma.products.findFirst({
            where: { model: normalizedModelNumber }
          });

          if (!product) {
            console.log(`❌ Product not found in catalog for normalizedModelNumber: "${normalizedModelNumber}", acumaticaSku: "${acumaticaSku}"`);
            failures.push({
              acumaticaSku,
              modelNumber: normalizedModelNumber,
              reason: "Product not found in catalog"
            });
            continue;
          }

          await prisma.closeout_inventory.create({
            data: {
              productId: product.id,
              modelNumber: normalizedModelNumber,
              acumaticaSku: acumaticaSku,
              quantity: qtyOnHand,
              lastSyncedAt: new Date(),
              price: defaultPrice,
            }
          });
          console.log(`✅ Created new closeout_inventory for normalizedModelNumber: "${normalizedModelNumber}"`);
          updatedRecords.push({ modelNumber: normalizedModelNumber, acumaticaSku, qtyOnHand, defaultPrice });
        }
      }

      if (failures.length > 0) {
        await sendFailureEmail(process.env.END_USER_EMAIL, failures);
      }

      return res.status(200).json({ success: true, updatedRecords, failures });
    } 
    else if (deleted.length > 0) {
      for (const item of deleted) {
        const acumaticaSku = item.InventoryID.trim();
        const parts = acumaticaSku.split(" ");
        if (parts.length < 3) {
          console.log(`❌ Invalid acumaticaSku format. Parts:`, parts);
          continue;
        }

        const modelNumber = parts[1];
        const normalizedModelNumber = modelNumber.replace(/[-\/\s]/g, '');
        const qtyOnHand = item.QtyOnHand;
        const defaultPriceRaw = item.DefaultPrice;
        const defaultPrice = typeof defaultPriceRaw === 'number' ? defaultPriceRaw : null;

        console.log(`🔎 Processing DELETE Item - acumaticaSku: "${acumaticaSku}", modelNumber: "${modelNumber}", normalizedModelNumber: "${normalizedModelNumber}"`);

        const existingRecord = await prisma.closeout_inventory.findFirst({
          where: {
            modelNumber: normalizedModelNumber,
            acumaticaSku: acumaticaSku
          }
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
            }
          });

          console.log(`✅ Updated quantity for existing closeout_inventory: "${normalizedModelNumber}", newQuantity: ${newQuantity}`);
          updatedRecords.push({ modelNumber: normalizedModelNumber, acumaticaSku, newQuantity });
        } else {
          console.warn(`⚠️ No existing closeout_inventory found for acumaticaSku: "${acumaticaSku}"`);
        }
      }

      return res.status(200).json({ success: true, updatedRecords });
    }
  } catch (error) {
    console.error('Error in /inventory route:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
