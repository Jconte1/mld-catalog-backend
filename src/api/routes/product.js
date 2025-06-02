import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// 🔁 Map frontend slugs to DB values in `minor`
function normalizeType(typeParam) {
  const t = typeParam?.toLowerCase?.() || '';

  switch (t) {
    case 'cooktops-and-rangetops':
      return ['COOKTOPS (ELECTRIC)', 'COOKTOPS (GAS)', 'RANGETOPS'];
    case 'built-in-ovens':
      return ['SINGLE WALL OVEN', 'DOUBLE WALL OVEN', 'BUILT-IN OVEN'];
    case 'warming-drawers':
      return ['WARMING DRAWER'];
    case 'microwave':
      return ['MICROWAVE', 'OVER THE RANGE MICROWAVE', 'COUNTERTOP MICROWAVE', 'BUILT-IN MICROWAVE'];
    case 'coffee-systems':
      return ['COFFEE MAKERS AND GRINDERS'];
    case 'refrigerators':
      return [
        'FRENCH DOOR REFRIGERATOR',
        'SIDE BY SIDE REFRIGERATOR',
        'TOP FREEZER REFRIGERATOR',
        'BOTTOM FREEZER REFRIGERATOR',
        'NO FREEZER BUILT IN REFRIGERATOR',
        'FRENCH DOOR FREESTANDING REFRIGERATOR',
        'SIDE BY SIDE BUILT IN REFRIGERATOR',
        'COMPACT REFRIGERATOR',
        'SPECIALTY REFRIGERATOR',
        'TOP FREEZER FREESTANDING REFRIGERATOR',
        'GLASS DOOR REFRIGERATOR',
      ];
    case 'freezers':
      return ['REFRIGERATED DRAWER', 'UPRIGHT FREEZERS', 'CHEST FREEZERS'];
    case 'ice-makers':
      return ['ICE MAKERS'];
    case 'outdoor-grills':
      return ['LP GAS BBQ', 'NATURAL GAS BBQ', 'PRO STYLE BBQ', 'CHARCOAL BBQ', 'ELECTRIC BBQ', 'PELLET BBQ'];
    case 'laundry':
      return [
        'TOP LOAD MATCHING ELECTRIC DRYER',
        'FRONT LOAD ELECTRIC DRYER',
        'COMBINATION WASHER DRYER',
        'FRONT LOAD GAS DRYER',
        'HIGH EFFICIENCY TOP LOAD WASHER',
        'TRADITIONAL TOP LOAD WASHER',
        'TOP LOAD GAS DRYER',
        'LAUNDRY PEDESTAL',
        'ELECTRIC DRYER',
        'FRONT LOAD ELECTRIC DRYER',
        'COMMERCIAL WASHER',
        'PORTABLE DRYER',
      ];
      //testing azure deployment commment line here (you can erase this when you see it)
    case 'ranges':
      return [
        'PROFESSIONAL AND LARGE FREE STANDING GAS RANGE',
        'PROFESSIONAL GAS RANGE',
        'FREESTANDING SMOOTHTOP ELECTRIC RANGE',
        'ELECTRIC SPECIALTY RANGE',
        'SLIDE-IN ELECTRIC RANGE',
        'SLIDE IN GAS RANGE',
        'SLIDE IN ELECTRIC RANGE',
        '20" FREESTANDING COIL ELECTRIC RANGE',
        '20" FREE STANDING GAS RANGE',
        '24" FREE STANDING GAS RANGE',
        '24" FREESTANDING COIL ELECTRIC RANGE',
        '30" FREE STANDING ELECTRIC RANGE',
        '30" FREE STANDING GAS RANGE',
        '30" SLIDE-IN GAS RANGE',
        '30" ELECTRIC COIL RANGE',
        '30" FREESTANDING COIL ELECTRIC RANGE',
        
        '36" FREE STANDING GAS RANGE',
        '36" AND LARGER FREE STANDING GAS RANGE',
        '36" AND LARGER FREESTANDING COIL RANGE',
        '30" FREESTANDING COIL ELECTRIC RANGE',
        'ELECTRIC FREESTANDING COIL RANGE',
        
        'DROP IN ELECTRIC RANGE',
        'SPECIALTY RANGE',
        'SPECIALTY GAS RANGE'
      ];
    default:
      return [typeParam.toUpperCase()];
  }
}

// 🟢 Handle /api/products/:slug
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

// 🔽 Handle /api/products?type=...&page=...&limit=...
router.get('/', async (req, res) => {
  const { type, page = 1, limit = 15 } = req.query;

  const skip = parseInt(page) > 1 ? (parseInt(page) - 1) * parseInt(limit) : 0;
  const isAll = limit === 'ALL';
  const take = isAll ? undefined : parseInt(limit);

  try {
    let whereClause = undefined;

    if (type) {
      const normalized = normalizeType(type);
      whereClause = {
        OR: normalized.map((val) => ({
          minor: {
            contains: val,
            mode: 'insensitive',
          },
        })),
      };
    }

    const products = await prisma.products.findMany({
      where: whereClause,
      skip,
      take,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        model: true,
        brand: true,
        major: true,
        minor: true,
        data: true,
      },
    });

    res.json(products);
  } catch (err) {
    console.error('❌ Failed to fetch products from DB:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

export default router;
