const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// GET all banners ordered by displayOrder
router.get('/', async (req, res) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { displayOrder: 'asc' }
    });
    res.json(banners);
  } catch (err) {
    console.error('Error fetching banners:', err);
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
});

// POST create a banner
router.post('/', async (req, res) => {
  try {
    const { title, subtext, buttonText, image, link, mediaType, displayOrder, active, startDate, endDate } = req.body;
    
    // Calculate displayOrder if not provided
    let order = displayOrder;
    if (order === undefined || order === null) {
      const count = await prisma.banner.count();
      order = count + 1;
    }

    const banner = await prisma.banner.create({
      data: {
        title: title || '',
        subtext: subtext || null,
        buttonText: buttonText || null,
        image: image,
        link: link || null,
        mediaType: mediaType || 'IMAGE',
        displayOrder: Number(order),
        active: active !== undefined ? Boolean(active) : true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      }
    });
    res.status(201).json(banner);
  } catch (err) {
    console.error('Error creating banner:', err);
    res.status(500).json({ error: 'Failed to create banner' });
  }
});

// PUT update a banner
router.put('/:id', async (req, res) => {
  try {
    const { title, subtext, buttonText, image, link, mediaType, displayOrder, active, startDate, endDate } = req.body;
    const banner = await prisma.banner.update({
      where: { id: req.params.id },
      data: {
        title: title !== undefined ? title : undefined,
        subtext: subtext !== undefined ? subtext : undefined,
        buttonText: buttonText !== undefined ? buttonText : undefined,
        image: image !== undefined ? image : undefined,
        link: link !== undefined ? link : undefined,
        mediaType: mediaType !== undefined ? mediaType : undefined,
        displayOrder: displayOrder !== undefined ? Number(displayOrder) : undefined,
        active: active !== undefined ? Boolean(active) : undefined,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      }
    });
    res.json(banner);
  } catch (err) {
    console.error('Error updating banner:', err);
    res.status(500).json({ error: 'Failed to update banner' });
  }
});

// PUT reorder banners (bulk order update)
router.put('/reorder/all', async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, displayOrder }
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items must be an array' });
    }
    for (const item of items) {
      await prisma.banner.update({
        where: { id: item.id },
        data: { displayOrder: Number(item.displayOrder) }
      });
    }
    res.json({ message: 'Banners reordered successfully' });
  } catch (err) {
    console.error('Error reordering banners:', err);
    res.status(500).json({ error: 'Failed to reorder banners' });
  }
});

// DELETE banner
router.delete('/:id', async (req, res) => {
  try {
    await prisma.banner.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Banner deleted successfully' });
  } catch (err) {
    console.error('Error deleting banner:', err);
    res.status(500).json({ error: 'Failed to delete banner' });
  }
});

module.exports = router;
