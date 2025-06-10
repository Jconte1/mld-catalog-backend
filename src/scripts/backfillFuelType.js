import { PrismaClient } from '@prisma/client';
import mapSpecToProduct from '../utils/productMapper.js';
import { filterValueExtractors } from '../utils/filterMapper.js';

const prisma = new PrismaClient();
const BATCH_SIZE = 1000;
const TYPES_TO_UPDATE = ['RANGES', 'OUTDOOR GRILLS'];

async function backfillFuelType() {
    const total = await prisma.products.count({
        where: {
            type: { in: TYPES_TO_UPDATE }
        }
    });

    console.log(`🧮 Total products to update: ${total}`);

    for (let skip = 0; skip < total; skip += BATCH_SIZE) {
        const batch = await prisma.products.findMany({
            where: {
                type: { in: TYPES_TO_UPDATE }
            },
            skip,
            take: BATCH_SIZE,
        });

        console.log(`🔄 Processing batch: ${skip} to ${skip + BATCH_SIZE}`);

        for (const product of batch) {
            try {
                const mapped = {
                    ...mapSpecToProduct(product.data),
                    minor: product.minor,
                    model: product.model,
                };

                const rawFuelType = filterValueExtractors.FuelType(mapped);
                const fuelType = Array.isArray(rawFuelType)
                    ? rawFuelType
                    : rawFuelType
                        ? [rawFuelType]
                        : [];

                await prisma.products.update({
                    where: { id: product.id },
                    data: { fuelType },
                });

                if (fuelType.length > 0) {
                    console.log(`✅ ${product.model || product.id} → Fuel Type: ${fuelType.join(', ')}`);
                } else {
                    console.log(`⚠️ ${product.model || product.id} → No fuel type found. Set to empty array.`);
                }

            } catch (err) {
                console.error(`❌ Failed to process ${product.model || product.id}: ${err.message}`);
            }
        }
    }

    console.log('\n✅ Full backfill complete. FuelTypes updated for all RANGES and OUTDOOR GRILLS.\n');
    await prisma.$disconnect();
}

backfillFuelType().catch(console.error);
