import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * /api/search
 * Example: /api/search?q=wolf
 */
router.get('/', async (req, res) => {
    const q = req.query.q?.toLowerCase() || '';

    // Return early if query is empty
    if (!q || q.trim() === '') {
        return res.json({ products: [], productTypes: [] });
    }

    try {
        console.log('🔎 Received search query:', q);

        // ✅ Split query into words (tokens)
        const tokens = q.trim().split(/\s+/);

        // ✅ Build AND/OR Prisma filter for tokens
        const andConditions = tokens.map((token) => ({
            OR: [
                { model: { contains: token, mode: 'insensitive' } },
                { brand: { contains: token, mode: 'insensitive' } },
                { major: { contains: token, mode: 'insensitive' } },
                { minor: { contains: token, mode: 'insensitive' } },
                { type: { contains: token, mode: 'insensitive' } },
                {
                    data: {
                        path: ['marketing_copy', 'short_description'],
                        string_contains: token
                    }
                }
            ]
        }));

        // ✅ Add exclusion for accessories in minor
        const productsRaw = await prisma.products.findMany({
            where: {
                AND: [
                    ...andConditions,
                    {
                        NOT: {
                            minor: {
                                contains: 'accessories',
                                mode: 'insensitive'
                            }
                        }
                    }
                ]
            },
            take: 20, // fetch more to allow for filtering
            select: {
                id: true,
                model: true,
                brand: true,
                major: true,
                minor: true,
                type: true,
                slug: true, // ✅ Include slug from DB
            },
        });

        console.log(`✅ Found ${productsRaw.length} matching raw products.`);

        // ✅ Prepare "products" array using pre-built slug
        const products = productsRaw
            .slice(0, 5)  // limit to 5 after filtering
            .map((p) => ({
                id: p.id,
                model: p.model,
                brand: p.brand,
                major: p.major,
                minor: p.minor,
                type: p.type?.toLowerCase(),
                slug: p.slug // ✅ Use DB field as-is
            }));

        // ✅ Deduplicate and prepare "productTypes" array
        const typeSet = new Set();
        const productTypes = [];

        for (const p of productsRaw) {
            if (p.major && p.minor && p.type) {
                const key = `${p.major}||${p.minor}||${p.type}`;
                if (!typeSet.has(key)) {
                    typeSet.add(key);
                    productTypes.push({
                        major: p.major,
                        minor: p.minor,
                        type: p.type?.toLowerCase(),
                        category: 'appliances', // hard-coded for now
                    });
                }
            }
            if (productTypes.length >= 10) break; // limit to 10 unique types
        }

        console.log(`✅ Returning ${products.length} products and ${productTypes.length} productTypes.`);

        return res.json({ products, productTypes });
    } catch (error) {
        console.error('❌ Search API error:', error);
        return res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

export default router;
