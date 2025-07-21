import express from 'express';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();
const router = express.Router();

// Setup reusable email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.AUTO_EMAIL,
    pass: process.env.AUTO_EMAIL_PASSWORD
  }
});

function sendErrorEmail(subject, message) {
  return transporter.sendMail({
    from: `"Closeout API Error" <${process.env.AUTO_EMAIL}>`,
    to: process.env.END_USER_EMAIL,
    cc: process.env.CC_EMAIL, 
    subject,
    text: message
  });
}

// POST /api/closeout/create
router.post('/create', async (req, res) => {
  try {
    if (
      !req.body?.Inserted ||
      !Array.isArray(req.body.Inserted) ||
      req.body.Inserted.length === 0
    ) {
      return res.status(400).json({ error: "Invalid payload: Inserted array is required." });
    }

    const insertedItem = req.body.Inserted[0];
    const rawInventoryID = insertedItem.InventoryID;

    if (!rawInventoryID) {
      return res.status(400).json({ error: "Invalid payload: InventoryID is required." });
    }

    const acumaticaSku = rawInventoryID.trim();
    const parts = acumaticaSku.split(" ");

    if (parts.length < 3) {
      return res.status(400).json({ error: "Invalid acumaticaSku format. Expected at least 3 parts." });
    }

    const modelNumber = parts[1];
    const defaultPriceRaw = insertedItem.DefaultPrice;
    const defaultPrice = typeof defaultPriceRaw === 'number' ? defaultPriceRaw : null;

    const product = await prisma.products.findFirst({
      where: { model: modelNumber }
    });

    if (!product) {
      const subject = "❌ Product Not Found in Catalog (Create Endpoint)";
      const message = `Product not found in catalog.\n\nModel Number: "${modelNumber}"\nAcumatica SKU: "${acumaticaSku}"`;
      await sendErrorEmail(subject, message);

      return res.status(404).json({ error: "Product not found in catalog." });
    }

    const closeoutRecord = await prisma.closeout_inventory.upsert({
      where: { acumaticaSku: acumaticaSku },
      update: {
        price: defaultPrice,
        lastSyncedAt: new Date()
      },
      create: {
        productId: product.id,
        modelNumber: modelNumber,
        acumaticaSku: acumaticaSku,
        quantity: 0,
        price: defaultPrice,
        lastSyncedAt: new Date()
      }
    });

    return res.status(200).json({ success: true, closeoutRecord });

  } catch (error) {
    console.error('Error in /api/closeout/create:', error);

    const subject = "🔥 Server Error in Create Endpoint";
    const message = `An error occurred in /api/closeout/create:\n\n${error.stack || error.message}`;
    await sendErrorEmail(subject, message);

    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
