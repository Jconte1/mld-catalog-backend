// // src/scripts/backfillType.js 📁 BACKEND

import { PrismaClient } from '@prisma/client';
import mapSpecToProduct from '../utils/productMapper.js';

const prisma = new PrismaClient();
const BATCH_SIZE = 1000;

async function backfillProductTypes() {
  const total = await prisma.products.count();
  console.log(`🧮 Total products: ${total}\n`);

  for (let skip = 0; skip < total; skip += BATCH_SIZE) {
    const batch = await prisma.products.findMany({
      skip,
      take: BATCH_SIZE,
    });

    console.log(`🔄 Processing batch: ${skip} to ${skip + BATCH_SIZE}`);

    for (const product of batch) {
      try {
        const mapped = mapSpecToProduct(product.data);

        if (!mapped?.type) {
          console.warn(`⚠️ Skipping ${product.model || product.id} — no type detected`);
          continue;
        }

        await prisma.products.update({
          where: { id: product.id },
          data: { type: mapped.type },
        });

        console.log(`✅ Updated ${product.model || product.id} → type: ${mapped.type}`);
      } catch (err) {
        console.error(`❌ Failed to process product ${product.model || product.id}`, err.message);
      }
    }
  }

  console.log('\n🎉 All batches complete.\n');
  await prisma.$disconnect();
}

backfillProductTypes().catch(console.error);
