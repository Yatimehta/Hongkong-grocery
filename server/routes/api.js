const express = require('express');
const authMiddleware = require('../middleware/auth');
const { db } = require('../firebaseClient');

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
    // Use caches instead of Firestore reads where possible
    let orders = [];
    try {
      const ordersSnapshot = await db.collection('orders').get();
      ordersSnapshot.forEach(doc => orders.push({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.log('Dashboard: orders read failed, using empty');
    }

    // Products count from cache
    let productsCount = 0;
    try {
      const prodRoute = require('./products');
      const prodCache = prodRoute.getCache ? prodRoute.getCache() : null;
      productsCount = prodCache ? prodCache.length : 0;
    } catch (e) {}

    // Customers count
    let customersCount = 0;
    try {
      const customersSnapshot = await db.collection('customers').get();
      customersCount = customersSnapshot.size;
    } catch (e) {
      console.log('Dashboard: customers read failed, using 0');
    }

    const totalOrders = orders.length;
    const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);

    // Last 7 days revenue
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentOrders = paidOrders.filter(o => new Date(o.date) >= sevenDaysAgo);

    const revenueByDay = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      revenueByDay[d.toISOString().split('T')[0]] = 0;
    }
    
    recentOrders.forEach(order => {
      const day = order.date ? order.date.split('T')[0] : '';
      if (revenueByDay[day] !== undefined) {
        revenueByDay[day] += Number(order.total || 0);
      }
    });

    const statusCounts = {};
    orders.forEach(o => {
      const status = o.orderStatus || 'pending';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    const orderStatuses = Object.keys(statusCounts).map(status => ({
      status,
      count: statusCounts[status]
    }));

    const latestOrders = [...orders]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map(o => ({
        ...o,
        customer: o.customer ? { name: o.customer.name } : null
      }));

    // Top Products from cache
    const itemSales = {};
    orders.forEach(o => {
      if (o.items) {
        o.items.forEach(item => {
          itemSales[item.productId] = (itemSales[item.productId] || 0) + Number(item.quantity || 0);
        });
      }
    });

    const topProductsRaw = Object.keys(itemSales)
      .map(productId => ({ productId, quantity: itemSales[productId] }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    let prodCacheArr = [];
    try {
      const prodRoute = require('./products');
      prodCacheArr = prodRoute.getCache ? (prodRoute.getCache() || []) : [];
    } catch (e) {}

    const topProducts = topProductsRaw.map(tp => {
      const pData = prodCacheArr.find(p => p.id === tp.productId);
      return {
        id: tp.productId,
        name: pData?.name || 'Unknown Product',
        sku: pData?.sku || '',
        price: pData?.price || 0,
        unitsSold: tp.quantity
      };
    });

    res.json({
      stats: { totalOrders, totalRevenue, productsCount, customersCount },
      revenueChart: Object.keys(revenueByDay).map(date => ({ date, amount: revenueByDay[date] })).reverse(),
      orderStatuses,
      latestOrders,
      topProducts
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

