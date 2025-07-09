import express from 'express';
import { PrismaClient } from '@prisma/client';
import mapSpecToProduct from '../../utils/productMapper.js';
import normalize from '../../utils/normalize.js';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/filter-options', async (req, res) => {
    const type = normalize(req.query.type);
    if (!type) return res.status(400).json({ error: 'Missing type' });

    try {
        const whereClause = {
            type: {
                equals: type,
                mode: 'insensitive',
            },
        };

        const products = await prisma.products.findMany({
            where: whereClause,
            select: {
                brand: true,
                productType: true,
                configuration: true,
                features: true,
                width: true,
                fuelType: true,
            },
        });

        const brandSet = new Set();
        const productTypeSet = new Set();
        const configurationSet = new Set();
        const featureSet = new Set();
        const widthSet = new Set();
        const fuelTypeSet = new Set();

        products.forEach((p) => {
            if (p.brand) brandSet.add(p.brand);
            if (Array.isArray(p.productType)) {
                p.productType.forEach((pt) => {
                    if (typeof pt === 'string' && pt.trim() !== '') {
                        productTypeSet.add(pt.trim());
                    }
                });
            }
            if (Array.isArray(p.configuration)) {
                p.configuration.forEach((config) => {
                    if (typeof config === 'string' && config.trim() !== '') {
                        configurationSet.add(config.trim());
                    }
                });
            }
            if (Array.isArray(p.features)) {
                p.features.forEach((f) => {
                    if (f) featureSet.add(f);
                });
            }
            if (p.width) widthSet.add(p.width);
            if (Array.isArray(p.fuelType)) {
                p.fuelType.forEach((ft) => {
                    if (typeof ft === 'string' && ft.trim() !== '') {
                        fuelTypeSet.add(ft.trim());
                    }
                });
            }
        });

        res.json({
            Brand: Array.from(brandSet).sort(),
            ...(productTypeSet.size > 0 && { productType: Array.from(productTypeSet).sort() }),
            ...(configurationSet.size > 0 && { Configuration: Array.from(configurationSet).sort() }),
            Width: Array.from(widthSet).sort(),
            ...(fuelTypeSet.size > 0 && { FuelType: Array.from(fuelTypeSet).sort() }),
            Features: Array.from(featureSet).sort(),
        });
    } catch (err) {
        console.error('❌ Failed to get filter options:', err);
        res.status(500).json({ error: 'Failed to load filter options' });
    }
});


// ✅ THIS ROUTE: Fetch by friendly "slug" field instead of "model"
router.get('/:slug', async (req, res) => {
    const { slug } = req.params;

    try {
        const product = await prisma.products.findFirst({
            where: {
                slug: {
                    equals: slug,
                    mode: 'insensitive',
                },
            },
            select: {
                id: true,
                slug: true,
                model: true,
                brand: true,
                major: true,
                minor: true,
                type: true,
                data: true,
            },
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const mapped = mapSpecToProduct(product.data, product.major, product.minor);
        res.json(mapped);
    } catch (err) {
        console.error('❗ Failed to fetch product by slug:', err);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});


router.get('/', async (req, res) => {
    console.log('📥 FULL QUERY OBJECT:', req.query);
    const rawType = req.query.type;
    const type = rawType ? normalize(rawType) : undefined;
    const { page = 1, limit, filters, sort } = req.query;

    console.log('📥 Received filters query param:', filters);

    try {
        const parsedFilters = JSON.parse(filters);
        console.log('🔍 Parsed filters object:', parsedFilters);
    } catch (e) {
        console.error('❌ Failed to parse filters JSON:', e);
    }

    const parsedLimit = limit === 'ALL' ? null : parseInt(limit) || 15;
    const skip = parseInt(page) > 1 ? (parseInt(page) - 1) * parsedLimit : 0;

    let typeClause = undefined;
    let filterClause = {};

    if (type) {
        typeClause = {
            type: {
                equals: type.toUpperCase(),
            },
        };
    }

    if (filters) {
        try {
            const parsedFilters = JSON.parse(filters);

            if (parsedFilters.features?.length) {
                filterClause.features = {
                    hasEvery: parsedFilters.features.map((f) => f.trim().toLowerCase()),
                };
            }

            if (parsedFilters.brand?.length) {
                filterClause.OR = parsedFilters.brand.map((b) => ({
                    brand: {
                        equals: b,
                        mode: 'insensitive',
                    },
                }));
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

            if (parsedFilters.configuration?.length) {
                filterClause.configuration = {
                    hasSome: parsedFilters.configuration.map((c) => c.trim().toLowerCase()),
                };
            }

            if (parsedFilters.productType?.length) {
                filterClause.productType = {
                    hasSome: parsedFilters.productType.map((c) => c.trim().toLowerCase()),
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
    console.log('📥 sort param:', sort);
    let orderBy;
    if (sort === 'name_asc') {
        orderBy = { model: 'asc' };
    } else if (sort === 'name_desc') {
        orderBy = { model: 'desc' };
    } else if (sort === 'popular') {
        orderBy = { popularity: 'desc' };
    } else {
        orderBy = { created_at: 'desc' }; 
    }

    try {
        console.log('🟣 Using orderBy:', orderBy);
        // 🧮 Count total matching records
        const totalCount = await prisma.products.count({ where });

        // 🧲 Fetch paginated results
        let products = await prisma.products.findMany({
            where,
            skip,
            take: parsedLimit,
            orderBy,
            select: {
                id: true,
                slug: true,
                type: true,
                model: true,
                brand: true,
                major: true,
                minor: true,
                features: true,
                configuration: true,
                data: true,
            },
        });

        // ✅ Hardcode category = 'appliances'
        products = products.map((p) => ({
            ...p,
            category: 'appliances',
        }));

        // 📦 Return both products and count
        res.json({
            products,
            totalCount,
        });
    } catch (err) {
        console.error('❌ Prisma error in /api/products:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

export default router;
