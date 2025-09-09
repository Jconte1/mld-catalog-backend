import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;
    const type = req.query.type ? req.query.type.toUpperCase() : null;

    const where = type ? { product: { type } } : {};

    const rows = await prisma.closeout_inventory.findMany({
      skip,
      take: limit,
      where: type
        ? { product: { type: { equals: type } }, quantity: { gt: 0 }  } // ✅ filter on related table
        : {},
      include: {
        product: {
          select: {
            id: true,
            brand: true,
            model: true,
            data: true,
            type: true,
            major: true,
            minor: true,
          },
        },
      },
    });

    const total = await prisma.closeout_inventory.count({
      where: type
        ? { product: { type: { equals: type } } } // ✅ same filter for count
        : {},
    });

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

export default router;
