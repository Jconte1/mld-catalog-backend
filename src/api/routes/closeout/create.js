import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// POST /api/closeout/create
router.post('/create', async (req, res) => {
  try {
    // 1️⃣ Validate the Inserted array exists
    if (
      !req.body?.Inserted ||
      !Array.isArray(req.body.Inserted) ||
      req.body.Inserted.length === 0
    ) {
      return res.status(400).json({ error: "Invalid payload: Inserted array is required." });
    }

    // 2️⃣ Extract InventoryID (the Acumatica SKU) from first Inserted item
    const insertedItem = req.body.Inserted[0];
    const rawInventoryID = insertedItem.InventoryID;

    if (!rawInventoryID) {
      return res.status(400).json({ error: "Invalid payload: InventoryID is required." });
    }

    // 3️⃣ Trim trailing spaces from InventoryID
    const acumaticaSku = rawInventoryID.trim();

    // 4️⃣ Split to parse modelNumber
    const parts = acumaticaSku.split(" ");

    if (parts.length < 3) {
      return res.status(400).json({ error: "Invalid acumaticaSku format. Expected at least 3 parts." });
    }

    const modelNumber = parts[1];

    // 5️⃣ Extract DefaultPrice (safe)
    const defaultPriceRaw = insertedItem.DefaultPrice;
    const defaultPrice = typeof defaultPriceRaw === 'number' ? defaultPriceRaw : null;

    // 6️⃣ Check if model exists in products table
    const product = await prisma.products.findFirst({
      where: { model: modelNumber }
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found in catalog." });
    }

    // 7️⃣ Create new closeout_inventory record
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

    // 8️⃣ Return success response
    return res.status(200).json({ success: true, closeoutRecord });

  } catch (error) {
    console.error('Error in /api/closeout/create:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
