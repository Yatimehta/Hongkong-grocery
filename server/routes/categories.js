const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// GET all categories
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
      include: { 
        parent: { select: { name: true } },
        _count: { select: { products: true } }
      }
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// CREATE category
router.post('/', async (req, res) => {
  try {
    const { name, slug, description, image, parentId, displayOrder } = req.body;
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image,
        parentId: parentId || null,
        displayOrder: displayOrder ? parseInt(displayOrder) : 0
      }
    });
    res.status(201).json(category);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Slug must be unique' });
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// UPDATE category
router.put('/:id', async (req, res) => {
  try {
    const { name, slug, description, image, parentId, displayOrder } = req.body;
    
    // Prevent self-referencing parent
    if (parentId === req.params.id) {
      return res.status(400).json({ error: 'Category cannot be its own parent' });
    }

    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: {
        name,
        slug,
        description,
        image,
        parentId: parentId || null,
        displayOrder: displayOrder !== undefined ? parseInt(displayOrder) : undefined
      }
    });
    res.json(category);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Slug must be unique' });
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE category
router.delete('/:id', async (req, res) => {
  try {
    // Check if category has products
    const productsCount = await prisma.product.count({ where: { categoryId: req.params.id } });
    if (productsCount > 0) {
      return res.status(400).json({ error: 'Cannot delete category that contains products' });
    }
    
    // Check if category has children
    const childrenCount = await prisma.category.count({ where: { parentId: req.params.id } });
    if (childrenCount > 0) {
      return res.status(400).json({ error: 'Cannot delete category that has subcategories' });
    }

    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;
