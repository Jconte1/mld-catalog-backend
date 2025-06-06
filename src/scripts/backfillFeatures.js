// // // src/scripts/backfillFeatures.js 📁 BACKEND

// import { PrismaClient } from '@prisma/client';
// import mapSpecToProduct from '../utils/productMapper.js';
// import { filterValueExtractors } from '../utils/filterMapper.js'; 

// const prisma = new PrismaClient();
// const BATCH_SIZE = 1000;

// async function backfillFeaturesForRanges() {
//   const total = await prisma.products.count({
//     where: { type: 'RANGES' },
//   });

//   console.log(`🧮 RANGES products: ${total}\n`);

//   for (let skip = 0; skip < total; skip += BATCH_SIZE) {
//     const batch = await prisma.products.findMany({
//       where: { type: 'RANGES' },
//       skip,
//       take: BATCH_SIZE,
//     });

//     console.log(`🔄 Processing batch: ${skip} to ${skip + BATCH_SIZE}`);

//     for (const product of batch) {
//       try {
//         const mapped = mapSpecToProduct(product.data);
//         const features = filterValueExtractors.RangeFeatures(mapped) || [];

//         await prisma.products.update({
//           where: { id: product.id },
//           data: { features },
//         });

//         console.log(`✅ ${product.model || product.id} → features: [${features.join(', ')}]`);
//       } catch (err) {
//         console.error(`❌ Failed to process ${product.model || product.id}: ${err.message}`);
//       }
//     }
//   }

//   console.log('\n🎉 All RANGES features backfilled.\n');
//   await prisma.$disconnect();
// }

// backfillFeaturesForRanges().catch(console.error);
