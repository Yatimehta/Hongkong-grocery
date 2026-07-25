const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// GET all brands
router.get('/', async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { displayOrder: 'asc' }
    });
    res.json(brands);
  } catch (err) {
    console.error('Error fetching brands:', err);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

// POST create brand
router.post('/', async (req, res) => {
  try {
    const { name, logo, url, displayOrder, status } = req.body;
    let order = displayOrder;
    if (order === undefined || order === null) {
      const count = await prisma.brand.count();
      order = count + 1;
    }
    const brand = await prisma.brand.create({
      data: {
        name,
        logo: logo || '',
        url: url || null,
        displayOrder: Number(order),
        status: status || 'active'
      }
    });
    res.status(201).json(brand);
  } catch (err) {
    console.error('Error creating brand:', err);
    res.status(500).json({ error: 'Failed to create brand' });
  }
});

// PUT update brand
router.put('/:id', async (req, res) => {
  try {
    const { name, logo, url, displayOrder, status } = req.body;
    const brand = await prisma.brand.update({
      where: { id: req.params.id },
      data: {
        name: name !== undefined ? name : undefined,
        logo: logo !== undefined ? logo : undefined,
        url: url !== undefined ? url : undefined,
        displayOrder: displayOrder !== undefined ? Number(displayOrder) : undefined,
        status: status !== undefined ? status : undefined
      }
    });
    res.json(brand);
  } catch (err) {
    console.error('Error updating brand:', err);
    res.status(500).json({ error: 'Failed to update brand' });
  }
});

// DELETE brand
router.delete('/:id', async (req, res) => {
  try {
    await prisma.brand.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Brand deleted successfully' });
  } catch (err) {
    console.error('Error deleting brand:', err);
    res.status(500).json({ error: 'Failed to delete brand' });
  }
});

module.exports = router;
