const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

const sampleLogs = [
  { action: 'Update Store Settings', user: 'Shop Owner', target: 'General Config', details: 'Changed announcement bar text and updated minimum order value to $15.00' },
  { action: 'Batch Import Catalog', user: 'Catalog Manager', target: 'Product Migration', details: 'Parsed and synchronized 42 organic grocery items from spreadsheet' },
  { action: 'Image Optimization Run', user: 'Super Admin', target: 'Media Library', details: 'Converted 14 hero asset JPGs into high-compression WebP formatting' },
  { action: 'Approve Customer Review', user: 'Store Staff', target: 'Review #104', details: 'Published 5-star review for Farm Fresh Honey 500g' },
  { action: 'Adjust Stock Levels', user: 'Warehouse Picker', target: 'Inventory Control', details: 'Decreased stock of Organic Bananas by 12 units due to damage write-off' },
  { action: 'Modify Delivery Fee', user: 'Shop Owner', target: 'Delivery Rates', details: 'Updated free shipping eligibility threshold to orders above $50' }
];

// GET activity logs with optional search & filtering
router.get('/', async (req, res) => {
  try {
    const { search, limit = 50 } = req.query;

    const count = await prisma.activityLog.count();
    if (count === 0) {
      // Seed sample activity logs for rich initial experience
      for (const log of sampleLogs) {
        await prisma.activityLog.create({ data: log });
      }
    }

    const whereClause = search ? {
      OR: [
        { action: { contains: search } },
        { user: { contains: search } },
        { target: { contains: search } },
        { details: { contains: search } }
      ]
    } : {};

    const logs = await prisma.activityLog.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      take: Number(limit)
    });

    res.json(logs);
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).json({ error: 'Failed to retrieve activity audit trail' });
  }
});

// DELETE clear all old activity logs
router.delete('/clear', async (req, res) => {
  try {
    await prisma.activityLog.deleteMany({});
    
    // Create one log record stating logs were pruned
    await prisma.activityLog.create({
      data: {
        action: 'Clear Audit Trail',
        user: 'Super Admin',
        target: 'System Logs',
        details: 'Admin user manually pruned and reset historical activity log archives'
      }
    });

    res.json({ success: true, message: 'Audit history successfully cleared' });
  } catch (err) {
    console.error('Error clearing logs:', err);
    res.status(500).json({ error: 'Failed to clear log history' });
  }
});

module.exports = router;
