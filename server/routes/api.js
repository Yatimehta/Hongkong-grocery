const express = require('express');
const authMiddleware = require('../middleware/auth');
const prisma = require('../prismaClient');

const router = express.Router();

// All API routes except auth require authentication
router.use(authMiddleware);

// Mount upload router
const uploadRouter = require('./upload');
router.use('/upload', uploadRouter);

// Mount products router
const productsRouter = require('./products');
router.use('/products', productsRouter);

const categoriesRouter = require('./categories');
router.use('/categories', categoriesRouter);

const brandsRouter = require('./brands');
router.use('/brands', brandsRouter);

const inventoryRouter = require('./inventory');
router.use('/inventory', inventoryRouter);

const ordersRouter = require('./orders');
router.use('/orders', ordersRouter);

const customersRouter = require('./customers');
router.use('/customers', customersRouter);

const couponsRouter = require('./coupons');
router.use('/coupons', couponsRouter);

const reportsRouter = require('./reports');
router.use('/reports', reportsRouter);

const bannersRouter = require('./banners');
router.use('/banners', bannersRouter);

const curationRouter = require('./curation');
router.use('/curation', curationRouter);

const mediaRouter = require('./media');
router.use('/media', mediaRouter);

const converterRouter = require('./converter');
router.use('/converter', converterRouter);

const blogsRouter = require('./blogs');
router.use('/blogs', blogsRouter);

const pagesRouter = require('./pages');
router.use('/pages', pagesRouter);

const reviewsRouter = require('./reviews');
router.use('/reviews', reviewsRouter);

const migrationRouter = require('./migration');
router.use('/migration', migrationRouter);

const settingsRouter = require('./settings');
router.use('/settings', settingsRouter);

const staffRouter = require('./staff');
router.use('/staff', staffRouter);
router.use('/users', staffRouter);

const logsRouter = require('./logs');
router.use('/logs', logsRouter);

const systemRouter = require('./system');
router.use('/system', systemRouter);

// --- DASHBOARD ---
router.get('/dashboard', async (req, res) => {
  try {
    const totalOrders = await prisma.order.count();
    const totalRevenueResult = await prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'paid' } });
    const totalRevenue = totalRevenueResult._sum.total || 0;
    
    const productsCount = await prisma.product.count();
    const customersCount = await prisma.customer.count();

    // Last 7 days revenue
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentOrders = await prisma.order.findMany({
      where: { date: { gte: sevenDaysAgo }, paymentStatus: 'paid' },
      select: { total: true, date: true }
    });

    // Group by day for the chart
    const revenueByDay = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      revenueByDay[d.toISOString().split('T')[0]] = 0;
    }
    
    recentOrders.forEach(order => {
      const day = order.date.toISOString().split('T')[0];
      if (revenueByDay[day] !== undefined) {
        revenueByDay[day] += order.total;
      }
    });

    // Order status breakdown
    const orderStatuses = await prisma.order.groupBy({
      by: ['orderStatus'],
      _count: { orderStatus: true }
    });

    // Recent 5 orders
    const latestOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: { customer: { select: { name: true } } }
    });

    // Top 5 Products by units sold
    const topProductsRaw = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    });

    const topProducts = await Promise.all(
      topProductsRaw.map(async (tp) => {
        const product = await prisma.product.findUnique({
          where: { id: tp.productId },
          select: { name: true, sku: true, price: true }
        });
        return {
          id: tp.productId,
          name: product?.name || 'Unknown Product',
          sku: product?.sku,
          price: product?.price,
          unitsSold: tp._sum.quantity || 0
        };
      })
    );

    res.json({
      stats: { totalOrders, totalRevenue, productsCount, customersCount },
      revenueChart: Object.keys(revenueByDay).map(date => ({ date, amount: revenueByDay[date] })).reverse(),
      orderStatuses: orderStatuses.map(s => ({ status: s.orderStatus, count: s._count.orderStatus })),
      latestOrders,
      topProducts
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
