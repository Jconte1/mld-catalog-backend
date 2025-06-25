// src/scripts/backfillWidth.js

import { PrismaClient } from '@prisma/client';
import mapSpecToProduct from '../utils/productMapper.js';
import { filterValueExtractors } from '../utils/filterMapper.js';

const prisma = new PrismaClient();
const BATCH_SIZE = 1000;

async function backfillWidthByType(label, filter, extractorFn) {
  const total = await prisma.products.count({ where: filter });
  console.log(`🧮 ${label}: ${total} products`);

  for (let skip = 0; skip < total; skip += BATCH_SIZE) {
    const batch = await prisma.products.findMany({
      where: filter,
      skip,
      take: BATCH_SIZE,
    });

    console.log(`🔄 ${label}: Processing batch ${skip} - ${skip + BATCH_SIZE}`);

    for (const product of batch) {
      try {
        const mapped = {
          ...mapSpecToProduct(product.data),
          minor: product.minor,
          model: product.model,
          type: product.type,
        };

        const width = extractorFn(mapped) || null;

        await prisma.products.update({
          where: { id: product.id },
          data: { width },
        });

        console.log(`✅ ${product.model || product.id} → width: ${width}`);
      } catch (err) {
        console.error(`❌ ${product.model || product.id} failed: ${err.message}`);
      }
    }
  }

  console.log(`🎉 ${label}: Widths backfilled\n`);
}

async function runAll() {
//   await backfillWidthByType(
//     'ICE MAKERS',
//     { type: 'ICE MAKERS' },
//     filterValueExtractors.IceMakerWidth
//   );

//   await backfillWidthByType(
//     'COFFEE SYSTEMS',
//     { type: 'COFFEE SYSTEMS' },
//     filterValueExtractors.CoffeeWidth
//   );

//   await backfillWidthByType(
//     'LAUNDRY',
//     { type: 'LAUNDRY' },
//     filterValueExtractors.LaundryWidth
//   );

  // await backfillWidthByType(
  //   'LAUNDRY',
  //   { type: 'LAUNDRY' },
  //   filterValueExtractors.LaundryWidth
  // );

//   await backfillWidthByType(
//     'VENTILATION',
//     { type: 'VENTILATION' },
//     filterValueExtractors.HoodWidth
//   );

//   await backfillWidthByType(
//     'WARMING DRAWERS',
//     { type: 'WARMING DRAWERS' },
//     filterValueExtractors.WarmingDrawerWidth
//   );

//   await backfillWidthByType(
//     'OUTDOOR GRILLS',
//     { type: 'OUTDOOR GRILLS' },
//     filterValueExtractors.BbqWidth
//   );

  await backfillWidthByType(
    'COOKTOPS AND RANGETOPS',
    { type: 'COOKTOPS AND RANGETOPS' },
    filterValueExtractors.CooktopWidth
  );

//   await backfillWidthByType(
//     'BUILT IN OVENS',
//     { type: 'BUILT IN OVENS' },
//     filterValueExtractors.OvenWidth
//   );

  await prisma.$disconnect();
}

runAll().catch((err) => {
  console.error('❌ Global error:', err);
  prisma.$disconnect();
});
