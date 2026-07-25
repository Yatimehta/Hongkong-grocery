const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// --- CATALOG SEARCH FOR CURATION ---
router.get('/catalog', async (req, res) => {
  try {
    const { search, type } = req.query;
    const where = { status: 'active' };
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } }
      ];
    }
    
    if (type === 'hero') where.isHero = false;
    if (type === 'featured') where.isFeatured = false;
    if (type === 'trending') where.isTrending = false;

    const products = await prisma.product.findMany({
      where,
      include: { images: true, category: true },
      take: 50,
      orderBy: { name: 'asc' }
    });
    
    const totalCount = await prisma.product.count({ where: type ? {} : where }); // total in catalog
    res.json({ products, totalCount });
  } catch (err) {
    console.error('Error in curation catalog search:', err);
    res.status(500).json({ error: 'Failed to search catalog' });
  }
});

// --- HERO PRODUCTS ---
router.get('/hero', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isHero: true },
      include: { images: true, category: true },
      orderBy: [{ heroOrder: 'asc' }, { createdAt: 'desc' }]
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch hero products' });
  }
});

router.put('/hero/:id', async (req, res) => {
  try {
    const { isHero, badge, heroOrder, isFeatured, status } = req.body;
    const data = {};
    if (isHero !== undefined) {
      data.isHero = Boolean(isHero);
      if (isHero && (heroOrder === undefined)) {
        const count = await prisma.product.count({ where: { isHero: true } });
        data.heroOrder = count + 1;
      }
    }
    if (badge !== undefined) data.badge = badge;
    if (heroOrder !== undefined) data.heroOrder = Number(heroOrder);
    if (isFeatured !== undefined) data.isFeatured = Boolean(isFeatured);
    if (status !== undefined) data.status = status;

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data,
      include: { images: true, category: true }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update hero product' });
  }
});

router.put('/hero-reorder', async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, heroOrder }
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.id },
        data: { heroOrder: Number(item.heroOrder) }
      });
    }
    res.json({ message: 'Hero order saved successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reorder hero products' });
  }
});

// --- FEATURED PRODUCTS ---
router.get('/featured', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isFeatured: true },
      include: { images: true, category: true },
      orderBy: [{ featuredOrder: 'asc' }, { name: 'asc' }]
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch featured products' });
  }
});

router.put('/featured/:id', async (req, res) => {
  try {
    const { isFeatured, featuredOrder } = req.body;
    const data = {};
    if (isFeatured !== undefined) data.isFeatured = Boolean(isFeatured);
    if (featuredOrder !== undefined) data.featuredOrder = Number(featuredOrder);

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data,
      include: { images: true, category: true }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update featured status' });
  }
});

router.post('/featured-clear', async (req, res) => {
  try {
    await prisma.product.updateMany({
      where: { isFeatured: true },
      data: { isFeatured: false, featuredOrder: 0 }
    });
    res.json({ message: 'Cleared all featured products' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear featured products' });
  }
});

// --- TRENDING PRODUCTS (BEST SELLERS) ---
router.get('/trending', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isTrending: true },
      include: { images: true, category: true },
      orderBy: [{ trendingOrder: 'asc' }, { name: 'asc' }]
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trending products' });
  }
});

router.put('/trending/:id', async (req, res) => {
  try {
    const { isTrending, trendingOrder } = req.body;
    const data = {};
    if (isTrending !== undefined) data.isTrending = Boolean(isTrending);
    if (trendingOrder !== undefined) data.trendingOrder = Number(trendingOrder);

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data,
      include: { images: true, category: true }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update trending status' });
  }
});

router.post('/trending-clear', async (req, res) => {
  try {
    await prisma.product.updateMany({
      where: { isTrending: true },
      data: { isTrending: false, trendingOrder: 0 }
    });
    res.json({ message: 'Cleared all trending products' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear trending products' });
  }
});

module.exports = router;
