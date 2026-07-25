const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// GET all products with pagination, search, and filter
router.get('/', async (req, res) => {
  try {
    const { search, categoryId, brandId, status, page = 1, limit = 5000 } = req.query;
    
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } }
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;
    if (status) where.status = status;

    const limitNum = limit === 'all' ? 10000 : Number(limit || 5000);
    const skip = (Number(page) - 1) * limitNum;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          sku: true,
          price: true,
          salePrice: true,
          stock: true,
          unit: true,
          status: true,
          categoryId: true,
          brandId: true,
          category: { select: { id: true, name: true } },
          brand: { select: { id: true, name: true } },
          images: { select: { url: true, isPrimary: true } }
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    const enrichedProducts = products.map(p => ({
      ...p,
      categoryName: p.category ? p.category.name : 'Uncategorized',
      image_urls: p.images ? p.images.map(i => i.url) : [],
      image: p.images && p.images.length > 0 ? p.images[0].url : (p.image || ''),
      in_stock: p.stock > 0 || p.status === 'active'
    }));

    res.json({
      data: enrichedProducts,
      products: enrichedProducts, // dual property for maximum frontend compatibility
      pagination: {
        total,
        page: Number(page),
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { images: true }
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// CREATE product
router.post('/', async (req, res) => {
  try {
    const { name, sku, description, price, salePrice, stock, unit, status, categoryId, brandId, images } = req.body;
    
    const product = await prisma.product.create({
      data: {
        name,
        sku,
        description: description || '',
        price: Number(price),
        salePrice: salePrice ? Number(salePrice) : null,
        stock: Number(stock || 0),
        unit: unit || 'piece',
        status: status || 'active',
        categoryId,
        brandId,
        images: {
          create: (images || []).map(img => ({
            url: img.url,
            isPrimary: img.isPrimary || false
          }))
        }
      },
      include: { images: true }
    });
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    if (err.code === 'P2002') return res.status(400).json({ error: 'SKU must be unique' });
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// UPDATE product
router.put('/:id', async (req, res) => {
  try {
    const { name, sku, description, price, salePrice, stock, unit, status, categoryId, brandId, images } = req.body;
    
    // For images, it's easier to delete old and create new to avoid complex syncing
    if (images) {
      await prisma.productImage.deleteMany({ where: { productId: req.params.id } });
    }

    const dataToUpdate = {
      name, sku, description,
      price: price !== undefined ? Number(price) : undefined,
      salePrice: salePrice !== undefined ? (salePrice ? Number(salePrice) : null) : undefined,
      stock: stock !== undefined ? Number(stock) : undefined,
      unit, status, categoryId, brandId
    };

    if (images) {
      dataToUpdate.images = {
        create: images.map(img => ({ url: img.url, isPrimary: img.isPrimary || false }))
      };
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: dataToUpdate,
      include: { images: true }
    });
    res.json(product);
  } catch (err) {
    console.error(err);
    if (err.code === 'P2002') return res.status(400).json({ error: 'SKU must be unique' });
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    // Note: In real world, check if used in orders before deleting, 
    // or just soft-delete by setting status = 'archived'.
    // For now, doing hard delete as requested.
    
    // Check if used in orders
    const orderItems = await prisma.orderItem.count({ where: { productId: req.params.id } });
    if (orderItems > 0) {
      return res.status(400).json({ error: 'Cannot delete product because it is part of an existing order.' });
    }

    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// BULK DELETE
router.post('/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids array required' });
    
    // Verify none are in orders
    const used = await prisma.orderItem.count({ where: { productId: { in: ids } } });
    if (used > 0) {
      return res.status(400).json({ error: 'One or more products are in orders and cannot be deleted.' });
    }

    await prisma.product.deleteMany({ where: { id: { in: ids } } });
    res.json({ message: 'Products deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete products' });
  }
});

module.exports = router;
