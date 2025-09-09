import express from 'express';
import prisma from '../../../services/index.js';
import normalize from '../../../utils/normalize.js';
import {
  TTL_FILTERS, redisGet, redisSetEx, getTypeVersion
} from './cacheUtils.js';

const router = express.Router();

// GET /api/products/filter-options?type=...
router.get('/', async (req, res) => {
  const typeRaw = req.query.type;
  const type = normalize(typeRaw);
  if (!type) return res.status(400).json({ error: 'Missing type' });

  try {
    const ver = await getTypeVersion(type);
    const cacheKey = `filters:v${ver}:type=${type.toUpperCase()}`;

    const cached = await redisGet(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const products = await prisma.products.findMany({
      where: { type: { equals: type, mode: 'insensitive' } },
      select: { brand: true, productType: true, configuration: true, features: true, width: true, fuelType: true },
    });

    const brandSet = new Set();
    const productTypeSet = new Set();
    const configurationSet = new Set();
    const featureSet = new Set();
    const widthSet = new Set();
    const fuelTypeSet = new Set();

    products.forEach((p) => {
      if (p.brand) brandSet.add(p.brand);
      if (Array.isArray(p.productType)) p.productType.forEach(pt => { if (typeof pt === 'string' && pt.trim()) productTypeSet.add(pt.trim()); });
      if (Array.isArray(p.configuration)) p.configuration.forEach(c => { if (typeof c === 'string' && c.trim()) configurationSet.add(c.trim()); });
      if (Array.isArray(p.features)) p.features.forEach(f => { if (f) featureSet.add(f); });
      if (p.width) widthSet.add(p.width);
      if (Array.isArray(p.fuelType)) p.fuelType.forEach(ft => { if (typeof ft === 'string' && ft.trim()) fuelTypeSet.add(ft.trim()); });
    });

    const payload = {
      Brand: Array.from(brandSet).sort(),
      ...(productTypeSet.size > 0 && { productType: Array.from(productTypeSet).sort() }),
      ...(configurationSet.size > 0 && { Configuration: Array.from(configurationSet).sort() }),
      Width: Array.from(widthSet).sort(),
      ...(fuelTypeSet.size > 0 && { FuelType: Array.from(fuelTypeSet).sort() }),
      Features: Array.from(featureSet).sort(),
    };

    await redisSetEx(cacheKey, TTL_FILTERS, JSON.stringify(payload));
    res.json(payload);
  } catch (err) {
    console.error('❌ Failed to get filter options:', err);
    res.status(500).json({ error: 'Failed to load filter options' });
  }
});

export default router;
