const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// GET inventory status for all products
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        lowStockThreshold: true,
        unit: true,
        status: true
      },
      orderBy: { stock: 'asc' }
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// GET inventory adjustment history
router.get('/history', async (req, res) => {
  try {
    const history = await prisma.inventoryAdjustment.findMany({
      include: {
        product: { select: { name: true, sku: true } }
      },
      orderBy: { date: 'desc' },
      take: 100
    });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inventory history' });
  }
});

// POST inventory adjustment
router.post('/adjust', async (req, res) => {
  try {
    const { productId, quantityChanged, reason } = req.body;
    
    if (!productId || quantityChanged === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Run in transaction to update stock and create history log
    const result = await prisma.$transaction(async (prisma) => {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error('Product not found');

      const updatedStock = product.stock + Number(quantityChanged);
      
      await prisma.product.update({
        where: { id: productId },
        data: { stock: updatedStock }
      });

      const adjustment = await prisma.inventoryAdjustment.create({
        data: {
          productId,
          quantityChanged: Number(quantityChanged),
          reason: reason || 'Manual adjustment'
        }
      });

      return adjustment;
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Failed to adjust inventory' });
  }
});

module.exports = router;
