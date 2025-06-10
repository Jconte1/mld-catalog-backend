// // // src/scripts/backfillWidth.js 📁 BACKEND

import { PrismaClient } from '@prisma/client';
import mapSpecToProduct from '../utils/productMapper.js';
import { filterValueExtractors } from '../utils/filterMapper.js';

const prisma = new PrismaClient();
const BATCH_SIZE = 1000;

async function backfillWidthForRanges() {
    const total = await prisma.products.count({
        where: { type: 'RANGES' },
    });

    console.log(`🧮 RANGES products: ${total}\n`);

    for (let skip = 0; skip < total; skip += BATCH_SIZE) {
        const batch = await prisma.products.findMany({
            where: { type: 'RANGES' },
            skip,
            take: BATCH_SIZE,
        });

        console.log(`🔍 Processing ${batch.length} RANGES products for width backfill\n`);

        for (const product of batch) {
            try {
                const mapped = {
                    ...mapSpecToProduct(product.data),
                    minor: product.minor,
                    model: product.model,
                };
                const width = filterValueExtractors.RangeWidth(mapped) || null;

                await prisma.products.update({
                    where: { id: product.id },
                    data: { width },
                });

                console.log(`✅ ${product.model || product.id} → width: ${width}`);
            } catch (err) {
                console.error(`❌ Failed to process ${product.model || product.id}: ${err.message}`);
            }
        }
    }

    console.log('\n✅ Full backfill complete. Widths updated for all RANGES.\n');
    await prisma.$disconnect();
}

// backfillWidthForRanges().catch(console.error);
