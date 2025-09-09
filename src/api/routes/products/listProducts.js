import express from 'express';
import prisma from '../../../services/index.js';
import {
  TTL_LIST, redisGet, redisSetEx, getTypeVersion, canonicalizeFilters
} from './cacheUtils.js';

const router = express.Router();

// GET /api/products  (list w/ filters, pagination, sort)
router.get('/', async (req, res) => {
  const rawType = req.query.type;
  const type = rawType ? String(rawType).trim() : undefined;
  const { page = 1, limit, filters, sort } = req.query;

  const { hash: filtersHash } = canonicalizeFilters(filters);
  const typePart  = type ? type.toUpperCase() : 'ALL';
  const pagePart  = String(page);
  const limitPart = limit === 'ALL' ? 'ALL' : String(parseInt(limit) || 15);
  const sortPart  = sort || 'default';

  try {
    const ver = type ? await getTypeVersion(type) : '1';
    const cacheKey = `list:v${ver}:type=${typePart}|p=${pagePart}|n=${limitPart}|s=${sortPart}|f=${filtersHash}`;

    const cached = await redisGet(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    // original logic
    try { const parsed = JSON.parse(filters); console.log('🔍 Parsed filters object:', parsed); }
    catch (e) { if (filters) console.error('❌ Failed to parse filters JSON:', e); }

    const parsedLimit = limit === 'ALL' ? null : parseInt(limit) || 15;
    const skip = parseInt(page) > 1 ? (parseInt(page) - 1) * parsedLimit : 0;

    let typeClause = undefined;
    let filterClause = {};

    if (type) typeClause = { type: { equals: type.toUpperCase() } };

    if (filters) {
      try {
        const parsedFilters = JSON.parse(filters);
        if (parsedFilters.features?.length)      filterClause.features      = { hasEvery: parsedFilters.features.map(f => f.trim().toLowerCase()) };
        if (parsedFilters.brand?.length)         filterClause.OR            = parsedFilters.brand.map(b => ({ brand: { equals: b, mode: 'insensitive' } }));
        if (parsedFilters.width?.length)         filterClause.width         = { in: parsedFilters.width };
        if (parsedFilters.fueltype?.length)      filterClause.fuelType      = { hasSome: parsedFilters.fueltype.map(ft => ft.trim().toLowerCase()) };
        if (parsedFilters.configuration?.length) filterClause.configuration = { hasSome: parsedFilters.configuration.map(c => c.trim().toLowerCase()) };
        if (parsedFilters.producttype?.length)   filterClause.productType   = { hasSome: parsedFilters.producttype.map(c => c.trim().toLowerCase()) };
      } catch (err) {
        console.error('❌ Failed to parse filters:', filters, err);
      }
    }

    const where = { ...typeClause, ...filterClause };
    let orderBy;
    if (sort === 'name_asc')      orderBy = { model: 'asc' };
    else if (sort === 'name_desc')orderBy = { model: 'desc' };
    else if (sort === 'popular')  orderBy = { popularity: 'desc' };
    else                          orderBy = { created_at: 'desc' };

    const totalCount = await prisma.products.count({ where });

    const products = await prisma.products.findMany({
      where, skip, take: parsedLimit, orderBy,
      select: { id: true, slug: true, category: true, type: true, model: true, brand: true, major: true, minor: true, features: true, configuration: true, data: true },
    });

    const payload = { products, totalCount };
    await redisSetEx(cacheKey, TTL_LIST, JSON.stringify(payload));
    res.json(payload);
  } catch (err) {
    console.error('❌ Prisma error in /api/products:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

export default router;
