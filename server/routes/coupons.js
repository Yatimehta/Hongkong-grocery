const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// GET all coupons
router.get('/', async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

// CREATE coupon
router.post('/', async (req, res) => {
  try {
    const { 
      code, discountType, discountValue, minOrderValue, 
      maxDiscount, validFrom, validUntil, usageLimit, isActive 
    } = req.body;

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minOrderValue: minOrderValue ? Number(minOrderValue) : null,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        validFrom: validFrom ? new Date(validFrom) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        isActive: isActive !== undefined ? isActive : true
      }
    });
    res.status(201).json(coupon);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Coupon code already exists' });
    res.status(500).json({ error: 'Failed to create coupon' });
  }
});

// UPDATE coupon
router.put('/:id', async (req, res) => {
  try {
    const { 
      code, discountType, discountValue, minOrderValue, 
      maxDiscount, validFrom, validUntil, usageLimit, isActive 
    } = req.body;

    const coupon = await prisma.coupon.update({
      where: { id: req.params.id },
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minOrderValue: minOrderValue ? Number(minOrderValue) : null,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        validFrom: validFrom ? new Date(validFrom) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        isActive
      }
    });
    res.json(coupon);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Coupon code already exists' });
    res.status(500).json({ error: 'Failed to update coupon' });
  }
});

// DELETE coupon
router.delete('/:id', async (req, res) => {
  try {
    await prisma.coupon.delete({ where: { id: req.params.id } });
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
});

module.exports = router;
