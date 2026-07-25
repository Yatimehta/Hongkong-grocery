const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { Parser } = require('json2csv');

// GET Sales Report
router.get('/sales', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const orders = await prisma.order.findMany({
      where,
      include: { customer: { select: { name: true, email: true } } },
      orderBy: { date: 'desc' }
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;

    res.json({
      summary: { totalOrders, totalRevenue },
      orders
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sales report' });
  }
});

// GET Top Products
router.get('/top-products', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Prisma SQLite doesn't support relation filtering in groupBy directly easily
    // So we'll fetch orderItems based on date if needed
    const orderWhere = {};
    if (startDate && endDate) {
      orderWhere.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const orderItems = await prisma.orderItem.findMany({
      where: { order: orderWhere },
      include: { product: { select: { name: true, sku: true, price: true } } }
    });

    // Aggregate manually
    const productStats = {};
    orderItems.forEach(item => {
      if (!productStats[item.productId]) {
        productStats[item.productId] = {
          id: item.productId,
          name: item.product.name,
          sku: item.product.sku,
          price: item.product.price,
          unitsSold: 0,
          revenue: 0
        };
      }
      productStats[item.productId].unitsSold += item.quantity;
      productStats[item.productId].revenue += (item.quantity * item.price);
    });

    const sortedProducts = Object.values(productStats)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 50); // Top 50

    res.json(sortedProducts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch top products' });
  }
});

// EXPORT CSV
router.get('/export/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;

    let data = [];
    let fields = [];

    if (type === 'sales') {
      const where = {};
      if (startDate && endDate) {
        where.date = { gte: new Date(startDate), lte: new Date(endDate) };
      }
      const orders = await prisma.order.findMany({ where, include: { customer: true } });
      data = orders.map(o => ({
        OrderNumber: o.orderNumber,
        Date: new Date(o.date).toLocaleDateString(),
        Customer: o.customer?.name || 'Guest',
        Email: o.customer?.email || '',
        Status: o.orderStatus,
        Total: o.total
      }));
      fields = ['OrderNumber', 'Date', 'Customer', 'Email', 'Status', 'Total'];
    } 
    else if (type === 'inventory') {
      const products = await prisma.product.findMany();
      data = products.map(p => ({
        Name: p.name,
        SKU: p.sku,
        Stock: p.stock,
        Status: p.status
      }));
      fields = ['Name', 'SKU', 'Stock', 'Status'];
    }

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment(`${type}_report.csv`);
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ error: 'Export failed' });
  }
});

module.exports = router;
