import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = new express.Router();
const prisma = new PrismaClient();

router.post('/inventory', async (req, res) => {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not Accepted' });
        }

        const inserted = req.body.Inserted || [];
        const deleted = req.body.Deleted || [];

        if (inserted.length === 0 && deleted.length === 0) {
            return res.status(400).json({ error: 'No inventory records to process' })
        }



        if (inserted.length > 0) {
            const updatedRecords = [];
            for (const item of inserted) {
                const acumaticaSku = item.InventoryID.trim();
                const parts = acumaticaSku.split(" ");

                if (parts.length < 3) {
                    return res.status(400).json({ error: "Invalid acumaticaSku format. Expected at least 3 parts." });
                }

                const modelNumber = parts[1];
                const qtyOnHand = item.QtyOnHand;

                const defaultPriceRaw = item.DefaultPrice;
                const defaultPrice = typeof defaultPriceRaw === 'number' ? defaultPriceRaw : null;

                const existingRecord = await prisma.closeout_inventory.findFirst({
                    where: {
                        modelNumber: modelNumber,
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
                    })
                    updatedRecords.push({ modelNumber, acumaticaSku, qtyOnHand, defaultPrice });
                } else {
                    const product = await prisma.products.findFirst({
                        where: { model: modelNumber }
                    });
                    if (!product) {
                        return res.status(404).json({ error: "Product not found in catalog." });
                    }
                    await prisma.closeout_inventory.create({
                        data: {
                            productId: product.id,
                            modelNumber: modelNumber,
                            acumaticaSku: acumaticaSku,
                            quantity: qtyOnHand,
                            lastSyncedAt: new Date(),
                            price: defaultPrice,
                        }
                    })
                    updatedRecords.push({ modelNumber, acumaticaSku, qtyOnHand, defaultPrice  });
                }
            }
            return res.status(200).json({ success: true, updatedRecords });
        } else if (deleted.length > 0) {
            const updatedRecords = [];

            for (const item of deleted) {
                const acumaticaSku = item.InventoryID.trim();
                const parts = acumaticaSku.split(" ");

                if (parts.length < 3) {
                    return res.status(400).json({ error: "Invalid acumaticaSku format. Expected at least 3 parts." });
                }

                const modelNumber = parts[1];
                const qtyOnHand = item.QtyOnHand;

                const defaultPriceRaw = item.DefaultPrice;
                const defaultPrice = typeof defaultPriceRaw === 'number' ? defaultPriceRaw : null;

                // 1️⃣ Find existing closeout_inventory record
                const existingRecord = await prisma.closeout_inventory.findFirst({
                    where: {
                        modelNumber: modelNumber,
                        acumaticaSku: acumaticaSku
                    }
                });

                // 2️⃣ If record exists, subtract qtyOnHand
                if (existingRecord) {
                    // Compute new quantity
                    let newQuantity = existingRecord.quantity - qtyOnHand;
                    if (newQuantity < 0) newQuantity = 0;

                    // Update DB
                    await prisma.closeout_inventory.update({
                        where: { id: existingRecord.id },
                        data: {
                            quantity: newQuantity,
                            lastSyncedAt: new Date(),
                            price: defaultPrice,
                        }
                    });

                    // Track result
                    updatedRecords.push({ modelNumber, acumaticaSku, newQuantity });
                } else {
                    // Optionally log or skip missing records
                    console.warn(`No existing closeout_inventory found for ${acumaticaSku}`);
                }
            }

            // Respond with what was updated
            return res.status(200).json({ success: true, updatedRecords });
        }
    } catch (error) {
        console.error('Error in /inventory route:', error);
        return res.status(500).json({ error: 'Server error' });
    }
});

export default router;