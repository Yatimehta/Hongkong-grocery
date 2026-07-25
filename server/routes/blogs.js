const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// GET all blog posts
router.get('/', async (req, res) => {
  try {
    const { search, category, status } = req.query;
    const where = {};
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } }
      ];
    }
    if (category && category !== 'All') where.category = category;
    if (status && status !== 'All') where.status = status;

    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    res.json(posts);
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

// GET single post by slug or ID
router.get('/:identifier', async (req, res) => {
  try {
    const post = await prisma.blogPost.findFirst({
      where: {
        OR: [
          { id: req.params.identifier },
          { slug: req.params.identifier }
        ]
      }
    });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// POST create post
router.post('/', async (req, res) => {
  try {
    const { title, slug, coverImage, content, author, category, status, seoTitle, seoDescription } = req.body;
    
    // Check slug uniqueness
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    let finalSlug = slug;
    if (existing) {
      finalSlug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug: finalSlug,
        coverImage: coverImage || null,
        content: content || '',
        author: author || 'Admin',
        category: category || 'General',
        status: status || 'DRAFT',
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || ''
      }
    });
    res.status(201).json(post);
  } catch (err) {
    console.error('Error creating blog post:', err);
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

// PUT update post
router.put('/:id', async (req, res) => {
  try {
    const { title, slug, coverImage, content, author, category, status, seoTitle, seoDescription } = req.body;
    const post = await prisma.blogPost.update({
      where: { id: req.params.id },
      data: {
        title: title !== undefined ? title : undefined,
        slug: slug !== undefined ? slug : undefined,
        coverImage: coverImage !== undefined ? coverImage : undefined,
        content: content !== undefined ? content : undefined,
        author: author !== undefined ? author : undefined,
        category: category !== undefined ? category : undefined,
        status: status !== undefined ? status : undefined,
        seoTitle: seoTitle !== undefined ? seoTitle : undefined,
        seoDescription: seoDescription !== undefined ? seoDescription : undefined
      }
    });
    res.json(post);
  } catch (err) {
    console.error('Error updating blog post:', err);
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});

// DELETE post
router.delete('/:id', async (req, res) => {
  try {
    await prisma.blogPost.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Blog post deleted successfully' });
  } catch (err) {
    console.error('Error deleting blog post:', err);
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

module.exports = router;
