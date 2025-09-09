import express from 'express';
import prisma from '../../../services/index.js';
import mapSpecToProduct from '../../../utils/productMapper.js'
import { TTL_PRODUCT, redisGet, redisSetEx } from './cacheUtils.js';

const router = express.Router();

// GET /api/products/:slug
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  const key = `product:${String(slug).toLowerCase()}`;

  try {
    const cached = await redisGet(key);
    if (cached) return res.json(JSON.parse(cached));

    const product = await prisma.products.findFirst({
      where: { slug: { equals: slug, mode: 'insensitive' } },
      select: { id: true, slug: true, model: true, brand: true, major: true, minor: true, type: true, data: true },
    });

    if (!product) return res.status(404).json({ error: 'Product not found' });

    const mapped = mapSpecToProduct(product.data, product.major, product.minor);
    await redisSetEx(key, TTL_PRODUCT, JSON.stringify(mapped));
    res.json(mapped);
  } catch (err) {
    console.error('❗ Failed to fetch product by slug:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

export default router;
