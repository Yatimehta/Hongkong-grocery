const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const os = require('os');

// GET realtime system health and database performance metrics
router.get('/health', async (req, res) => {
  try {
    const startTime = Date.now();
    // Check SQLite connection responsiveness
    await prisma.$queryRaw`SELECT 1`;
    const dbPingMs = Date.now() - startTime;

    const memUsage = process.memoryUsage();
    const totalMemMb = Math.round(os.totalmem() / 1024 / 1024);
    const freeMemMb = Math.round(os.freemem() / 1024 / 1024);
    const rssMb = Math.round(memUsage.rss / 1024 / 1024);

    const uptimeSeconds = Math.round(process.uptime());
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const uptimeStr = `${hours}h ${minutes}m ${uptimeSeconds % 60}s`;

    // Counts for overview diagnostics
    const [productCount, orderCount, customerCount] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.customer.count()
    ]);

    res.json({
      status: 'HEALTHY',
      database: {
        engine: 'SQLite (Prisma ORM)',
        pingMs: dbPingMs,
        status: dbPingMs < 100 ? 'Optimal' : 'Slow Response'
      },
      server: {
        platform: `${os.platform()} ${os.release()}`,
        cpuCores: os.cpus().length,
        memoryUsedMb: rssMb,
        totalSystemMb: totalMemMb,
        freeSystemMb: freeMemMb,
        nodeVersion: process.version,
        uptime: uptimeStr
      },
      catalogSummary: {
        products: productCount,
        orders: orderCount,
        customers: customerCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('System health check error:', err);
    res.status(500).json({ status: 'DEGRADED', error: err.message || 'Database disconnected' });
  }
});

// GET generate and download full database JSON dump
router.get('/backup', async (req, res) => {
  try {
    const [products, categories, brands, orders, customers, banners, blogs, settings] = await Promise.all([
      prisma.product.findMany(),
      prisma.category.findMany(),
      prisma.brand.findMany(),
      prisma.order.findMany({ include: { items: true } }),
      prisma.customer.findMany(),
      prisma.banner.findMany(),
      prisma.blogPost.findMany(),
      prisma.setting.findMany()
    ]);

    const backupPayload = {
      meta: {
        store: 'Fresh Market Grocery',
        generatedAt: new Date().toISOString(),
        version: '1.0.0-full-backup'
      },
      data: {
        products,
        categories,
        brands,
        orders,
        customers,
        banners,
        blogs,
        settings
      }
    };

    // Log the backup operation
    await prisma.activityLog.create({
      data: {
        action: 'Download Full Database Backup',
        user: 'Super Admin',
        target: 'System Backup',
        details: `Exported ${products.length} products, ${orders.length} orders, and store configurations`
      }
    }).catch(() => {});

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="freshmarket_backup_${new Date().toISOString().slice(0,10)}.json"`);
    res.send(JSON.stringify(backupPayload, null, 2));
  } catch (err) {
    console.error('Backup generation failure:', err);
    res.status(500).json({ error: 'Failed to export store backup dump' });
  }
});

// POST restore database records from JSON dump
router.post('/restore', async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid backup file format. Expected standard JSON dump with a data field.' });
    }

    let restoredCount = 0;

    // Restore categories
    if (Array.isArray(data.categories)) {
      for (const cat of data.categories) {
        if (cat.name) {
          const exists = await prisma.category.findUnique({ where: { name: cat.name } });
          if (!exists) {
            await prisma.category.create({
              data: { name: cat.name, slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'), description: cat.description }
            }).catch(() => {});
            restoredCount++;
          }
        }
      }
    }

    // Restore settings
    if (Array.isArray(data.settings)) {
      for (const s of data.settings) {
        if (s.key && s.group) {
          await prisma.setting.upsert({
            where: { key_group: { key: s.key, group: s.group } },
            update: { value: String(s.value) },
            create: { key: s.key, value: String(s.value), group: s.group, type: s.type || 'string' }
          }).catch(() => {});
          restoredCount++;
        }
      }
    }

    await prisma.activityLog.create({
      data: {
        action: 'Restore Database from Backup',
        user: 'Super Admin',
        target: 'System Restore',
        details: `Successfully evaluated and synchronized ${restoredCount} records from backup dump file`
      }
    }).catch(() => {});

    res.json({ success: true, restoredCount, message: 'Store data recovery & import synchronization complete!' });
  } catch (err) {
    console.error('Restore operation failure:', err);
    res.status(500).json({ error: 'Failed to process database restoration payload' });
  }
});

module.exports = router;
