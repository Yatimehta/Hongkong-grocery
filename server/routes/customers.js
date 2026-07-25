const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// GET all customers
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: { _count: { select: { orders: true } } },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.customer.count({ where })
    ]);

    res.json({
      data: customers,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// GET single customer and order history
router.get('/:id', async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        orders: { orderBy: { date: 'desc' }, take: 10 },
        addresses: true
      }
    });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// CREATE customer (manual add)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, isActive } = req.body;
    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        isActive: isActive !== undefined ? isActive : true
      }
    });
    res.status(201).json(customer);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Email already exists' });
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// UPDATE customer
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, isActive } = req.body;
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: { name, email, phone, isActive }
    });
    res.json(customer);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Email already exists' });
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// DELETE customer
router.delete('/:id', async (req, res) => {
  try {
    await prisma.customer.delete({ where: { id: req.params.id } });
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

module.exports = router;
