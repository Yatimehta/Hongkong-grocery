const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// GET reviews with KPI stats and filters
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    const where = {};
    if (status && status !== 'All') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { customerEmail: { contains: search } },
        { product: { name: { contains: search } } },
        { comment: { contains: search } }
      ];
    }

    const reviews = await prisma.review.findMany({
      where,
      include: { product: true },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate KPI metrics across the whole store
    const totalCount = await prisma.review.count();
    const pendingCount = await prisma.review.count({ where: { status: 'PENDING' } });
    const approvedCount = await prisma.review.count({ where: { status: 'APPROVED' } });
    const rejectedCount = await prisma.review.count({ where: { status: 'REJECTED' } });
    
    const avgResult = await prisma.review.aggregate({
      _avg: { rating: true },
      where: { status: 'APPROVED' }
    });
    const avgRating = avgResult._avg.rating ? Number(avgResult._avg.rating.toFixed(1)) : 0;

    res.json({
      reviews,
      stats: {
        total: totalCount,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        avgRating
      }
    });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// POST submit a review (customer side or testing)
router.post('/', async (req, res) => {
  try {
    const { productId, customerName, customerEmail, rating, comment } = req.body;
    if (!productId || !rating) {
      return res.status(400).json({ error: 'Product and rating are required' });
    }
    const review = await prisma.review.create({
      data: {
        productId,
        customerName: customerName || 'Anonymous Customer',
        customerEmail: customerEmail || 'guest@example.com',
        rating: Number(rating),
        comment: comment || '',
        status: 'PENDING'
      },
      include: { product: true }
    });
    res.status(201).json(review);
  } catch (err) {
    console.error('Error creating review:', err);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// PUT change review status (Approve / Reject)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body; // 'APPROVED' | 'REJECTED' | 'PENDING'
    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    const updated = await prisma.review.update({
      where: { id: req.params.id },
      data: { status },
      include: { product: true }
    });
    res.json(updated);
  } catch (err) {
    console.error('Error updating review status:', err);
    res.status(500).json({ error: 'Failed to update review status' });
  }
});

// DELETE review
router.delete('/:id', async (req, res) => {
  try {
    await prisma.review.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

module.exports = router;
