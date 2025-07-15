// src/scripts/backfillFeatures.js

import { PrismaClient } from '@prisma/client';
import mapSpecToProduct from '../utils/productMapper.js';
import { filterValueExtractors } from '../utils/filterMapper.js';

const prisma = new PrismaClient();
const BATCH_SIZE = 1000;

async function backfillFeaturesByType(productTypeName, filter, extractorFn) {
  const total = await prisma.products.count({ where: filter });
  console.log(`🧮 ${productTypeName}: ${total} products`);

  for (let skip = 0; skip < total; skip += BATCH_SIZE) {
    const batch = await prisma.products.findMany({
      where: filter,
      skip,
      take: BATCH_SIZE,
    });

    console.log(`🔄 ${productTypeName}: Processing batch ${skip} - ${skip + BATCH_SIZE}`);

    for (const product of batch) {
      try {
        const mapped = mapSpecToProduct(product.data);
        const raw = extractorFn(mapped);
        const features = Array.isArray(raw) ? raw : raw ? [raw] : [];

        await prisma.products.update({
          where: { id: product.id },
          data: { features },
        });

        console.log(`✅ ${product.model || product.id} → features: [${features.join(', ')}]`);
      } catch (err) {
        console.error(`❌ Failed to update ${product.model || product.id}: ${err.message}`);
      }
    }
  }

  console.log(`🎉 ${productTypeName}: Features backfill complete!\n`);
}

async function runAll() {
  // await backfillFeaturesByType(
  //   'LAUNDRY',
  //   { type: 'LAUNDRY' },
  //   filterValueExtractors.LaundryFeatures
  // );

  await backfillFeaturesByType(
    'VENTILATION',
    { type: 'VENTILATION' },
    filterValueExtractors.HoodFeatures
  );

  await backfillFeaturesByType(
    'ICE MAKERS',
    { type: 'ICE MAKERS' },
    filterValueExtractors.IceFeatures
  );

  await backfillFeaturesByType(
    'WARMING DRAWERS',
    { type: 'WARMING DRAWERS' },
    filterValueExtractors.WarmingDrawerFeatures
  );

  await prisma.$disconnect();
}

runAll().catch((err) => {
  console.error('❌ Global error:', err);
  prisma.$disconnect();
});
