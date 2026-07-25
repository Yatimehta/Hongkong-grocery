const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

const DEFAULT_PAGES = [
  { title: 'About Us', slug: '/about', content: 'Welcome to our Grocery E-commerce store! We provide the freshest local farm grocery products delivered right to your doorstep.' },
  { title: 'Terms & Conditions', slug: '/terms', content: 'By using our online store and purchasing groceries from us, you agree to these standard terms of service, payment processing policies, and quality guarantees.' },
  { title: 'Privacy Policy', slug: '/privacy', content: 'We value your digital privacy. Your customer information, delivery addresses, and payment references are encrypted and never sold to third parties.' },
  { title: 'Frequently Asked Questions (FAQ)', slug: '/faq', content: 'Q: How fast is delivery?\nA: Within 2 hours for urban delivery zones!\n\nQ: Are produce items organic?\nA: Yes, all items marked Organic are certified by national standards.' },
  { title: 'Delivery & Return Info', slug: '/delivery-info', content: 'If any grocery item arrives damaged or below quality standards, return it instantly to our delivery agent for a full cash or store credit refund.' }
];

// GET all static pages (auto-seeds defaults if empty)
router.get('/', async (req, res) => {
  try {
    const count = await prisma.staticPage.count();
    if (count === 0) {
      for (const p of DEFAULT_PAGES) {
        await prisma.staticPage.create({
          data: {
            title: p.title,
            slug: p.slug,
            content: p.content,
            active: true
          }
        });
      }
    }
    const pages = await prisma.staticPage.findMany({
      orderBy: { title: 'asc' }
    });
    res.json(pages);
  } catch (err) {
    console.error('Error fetching pages:', err);
    res.status(500).json({ error: 'Failed to fetch static pages' });
  }
});

// GET single static page by slug or id
router.get('/:identifier', async (req, res) => {
  try {
    const page = await prisma.staticPage.findFirst({
      where: {
        OR: [
          { id: req.params.identifier },
          { slug: req.params.identifier.startsWith('/') ? req.params.identifier : `/${req.params.identifier}` },
          { slug: req.params.identifier }
        ]
      }
    });
    if (!page) return res.status(404).json({ error: 'Page not found' });
    res.json(page);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch page' });
  }
});

// POST create custom page
router.post('/', async (req, res) => {
  try {
    const { title, slug, content, status } = req.body;
    let formattedSlug = slug.startsWith('/') ? slug : `/${slug}`;
    
    const existing = await prisma.staticPage.findUnique({ where: { slug: formattedSlug } });
    if (existing) {
      return res.status(400).json({ error: 'A page with this URL slug already exists.' });
    }

    const page = await prisma.staticPage.create({
      data: {
        title,
        slug: formattedSlug,
        content: content || '',
        active: status === 'active' || status === true
      }
    });
    res.status(201).json(page);
  } catch (err) {
    console.error('Error creating static page:', err);
    res.status(500).json({ error: 'Failed to create static page' });
  }
});

// PUT update page
router.put('/:id', async (req, res) => {
  try {
    const { title, slug, content, status } = req.body;
    const page = await prisma.staticPage.findUnique({ where: { id: req.params.id } });
    if (!page) return res.status(404).json({ error: 'Page not found' });

    let formattedSlug = slug !== undefined ? (slug.startsWith('/') ? slug : `/${slug}`) : undefined;

    const updated = await prisma.staticPage.update({
      where: { id: req.params.id },
      data: {
        title: title !== undefined ? title : undefined,
        slug: formattedSlug,
        content: content !== undefined ? content : undefined,
        active: status !== undefined ? (status === 'active' || status === true) : undefined
      }
    });
    res.json(updated);
  } catch (err) {
    console.error('Error updating static page:', err);
    res.status(500).json({ error: 'Failed to update static page' });
  }
});

// DELETE page
router.delete('/:id', async (req, res) => {
  try {
    await prisma.staticPage.delete({ where: { id: req.params.id } });
    res.json({ message: 'Static page deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete static page' });
  }
});

module.exports = router;
