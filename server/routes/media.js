const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const fs = require('fs');
const path = require('path');

// GET all media files and folder counts
router.get('/', async (req, res) => {
  try {
    const { folder, type, search } = req.query;
    const where = {};

    if (folder && folder !== 'All' && folder !== 'all') {
      where.folder = folder.toLowerCase();
    }
    
    if (type && type !== 'All') {
      if (type === 'Images') where.mimeType = { startsWith: 'image/' };
      if (type === 'Videos') where.mimeType = { startsWith: 'video/' };
      if (type === 'Documents') where.NOT = { OR: [{ mimeType: { startsWith: 'image/' } }, { mimeType: { startsWith: 'video/' } }] };
    }

    if (search) {
      where.filename = { contains: search };
    }

    const files = await prisma.mediaFile.findMany({
      where,
      orderBy: { dateUploaded: 'desc' }
    });

    // Compute exact counts per folder
    const allCount = await prisma.mediaFile.count();
    const productsCount = await prisma.mediaFile.count({ where: { folder: 'products' } });
    const bannersCount = await prisma.mediaFile.count({ where: { folder: 'banners' } });
    const blogsCount = await prisma.mediaFile.count({ where: { folder: 'blogs' } });
    const brandsCount = await prisma.mediaFile.count({ where: { folder: 'brands' } });
    const generalCount = await prisma.mediaFile.count({ where: { folder: 'general' } });

    res.json({
      files,
      counts: {
        all: allCount,
        products: productsCount,
        banners: bannersCount,
        blogs: blogsCount,
        brands: brandsCount,
        general: generalCount
      }
    });
  } catch (err) {
    console.error('Error fetching media files:', err);
    res.status(500).json({ error: 'Failed to load media files' });
  }
});

// GET check if media file is referenced by active products or content
router.get('/:id/check-usage', async (req, res) => {
  try {
    const media = await prisma.mediaFile.findUnique({ where: { id: req.params.id } });
    if (!media) return res.status(404).json({ error: 'Media file not found' });

    const usedBy = [];
    const url = media.url;

    // Check Product Images
    const prodImages = await prisma.productImage.findMany({
      where: { url: url },
      include: { product: true }
    });
    prodImages.forEach(pi => {
      if (pi.product) usedBy.push(`Product: ${pi.product.name}`);
    });

    // Check Banners
    const banners = await prisma.banner.findMany({ where: { image: url } });
    banners.forEach(b => usedBy.push(`Banner Slide: ${b.title || `Slide #${b.displayOrder}`}`));

    // Check Brands
    const brands = await prisma.brand.findMany({ where: { logo: url } });
    brands.forEach(b => usedBy.push(`Brand Logo: ${b.name}`));

    // Check Blogs
    const blogs = await prisma.blogPost.findMany({ where: { coverImage: url } });
    blogs.forEach(b => usedBy.push(`Blog Post: ${b.title}`));

    res.json({ isUsed: usedBy.length > 0, usedBy });
  } catch (err) {
    console.error('Error checking usage:', err);
    res.status(500).json({ error: 'Failed to check file usage' });
  }
});

// DELETE media file
router.delete('/:id', async (req, res) => {
  try {
    const media = await prisma.mediaFile.findUnique({ where: { id: req.params.id } });
    if (!media) return res.status(404).json({ error: 'File not found' });

    // Remove from database
    await prisma.mediaFile.delete({ where: { id: req.params.id } });

    // Attempt physical file removal from uploads
    const filename = path.basename(media.url);
    const filePath = path.join(__dirname, '../uploads/', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: 'Media file deleted successfully' });
  } catch (err) {
    console.error('Error deleting media file:', err);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

module.exports = router;
