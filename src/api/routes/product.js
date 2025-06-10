import express from 'express';
import normalizeType from '../../utils/normalizeType.js';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/filter-options', async (req, res) => {
    const { type } = req.query;
    if (!type) return res.status(400).json({ error: 'Missing type' });

    try {
        const normalized = normalizeType(type);
        console.log('🔍 normalized types:', normalized);
        const whereClause = {
            OR: normalized.map((val) => ({
                minor: {
                    contains: val,
                    mode: 'insensitive',
                },
            })),
        };

        const products = await prisma.products.findMany({
            where: whereClause,
            select: {
                brand: true,
                features: true,
                width: true,
                fuelType: true,
            },
        });

        const brandSet = new Set();
        const featureSet = new Set();
        const widthSet = new Set();
        const fuelTypeSet = new Set();

        products.forEach((p) => {
            if (p.brand) brandSet.add(p.brand);

            if (Array.isArray(p.features)) {
                p.features.forEach((f) => {
                    if (f) featureSet.add(f);
                });
            }
            if (p.width) widthSet.add(p.width);
            if (typeof p.fuelType === 'string' && p.fuelType.trim() !== '') {
                fuelTypeSet.add(p.fuelType.trim());
            }
        });

        res.json({
            Brand: Array.from(brandSet).sort(),
            Features: Array.from(featureSet).sort(),
            Width: Array.from(widthSet).sort(),
            ...(fuelTypeSet.size > 0 && {
                FuelType: Array.from(fuelTypeSet).sort(),
              }),
        });
    } catch (err) {
        console.error('❌ Failed to get filter options:', err);
        res.status(500).json({ error: 'Failed to load filter options' });
    }
});

router.get('/:slug', async (req, res) => {
    const { slug } = req.params;

    try {
        const product = await prisma.products.findFirst({
            where: {
                OR: [
                    {
                        model: {
                            equals: slug,
                            mode: 'insensitive',
                        },
                    },
                    {
                        data: {
                            path: ['classification', 'pn'],
                            equals: slug,
                        },
                    },
                ],
            },
            select: {
                id: true,
                model: true,
                brand: true,
                major: true,
                minor: true,
                data: true,
            },
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (err) {
        console.error('❗ Failed to fetch product by slug:', err);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

router.get('/', async (req, res) => {
    const { type, page = 1, limit, filters } = req.query;

    const parsedLimit = limit === 'ALL' ? null : parseInt(limit) || 15;
    const skip = parseInt(page) > 1 ? (parseInt(page) - 1) * parsedLimit : 0;

    let typeClause = undefined;
    let filterClause = {};

    if (type) {
        const normalized = normalizeType(type);
        typeClause = {
            OR: normalized.map((val) => ({
                minor: {
                    contains: val,
                    mode: 'insensitive',
                },
            })),
        };
    }

    if (filters) {
        try {
            const parsedFilters = JSON.parse(filters);

            if (parsedFilters.features?.length) {
                const normalizedFeatures = parsedFilters.features.map((f) => f.toLowerCase().trim());
                filterClause.features = {
                    hasEvery: normalizedFeatures,
                };
            }

            if (parsedFilters.brand?.length) {
                filterClause.brand = {
                    in: parsedFilters.brand,
                };
            }

            if (parsedFilters.width?.length) {
                filterClause.width = {
                    in: parsedFilters.width,
                };
            }

            if (parsedFilters.fuelType?.length) {
                filterClause.fuelType = {
                    in: parsedFilters.fuelType,
                };
            }
        } catch (err) {
            console.error('❌ Failed to parse filters:', filters, err);
        }
    }

    const where = {
        ...typeClause,
        ...filterClause,
    };

    try {
        // 🧮 Count total matching records
        const totalCount = await prisma.products.count({ where });

        // 🧲 Fetch paginated results
        const products = await prisma.products.findMany({
            where,
            skip,
            take: parsedLimit,
            orderBy: { created_at: 'desc' },
            select: {
                id: true,
                model: true,
                brand: true,
                major: true,
                minor: true,
                features: true,
                data: true,
            },
        });

        // 📦 Return both products and count
        res.json({
            products,
            totalCount,
        });
    } catch (err) {
        console.error('❌ Failed to fetch products from DB:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

export default router;
