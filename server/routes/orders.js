const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const PDFDocument = require('pdfkit');

// GET all orders
router.get('/', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    
    const where = {};
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customer: { name: { contains: search } } }
      ];
    }
    if (status) where.orderStatus = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { 
          customer: { select: { name: true, email: true } },
          _count: { select: { items: true } }
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      data: orders,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET single order
router.get('/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        items: {
          include: {
            product: { select: { name: true, sku: true } }
          }
        }
      }
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// UPDATE order status
router.put('/:id', async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    
    const data = {};
    if (orderStatus) data.orderStatus = orderStatus;
    if (paymentStatus) data.paymentStatus = paymentStatus;

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// GET order invoice PDF
router.get('/:id/invoice', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        items: { include: { product: true } }
      }
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const doc = new PDFDocument();
    let filename = `Invoice_${order.orderNumber}.pdf`;
    
    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');
    
    doc.pipe(res);
    
    // Header
    doc.fontSize(20).text('INVOICE', { align: 'center' });
    doc.moveDown();
    
    // Order info
    doc.fontSize(12).text(`Order Number: ${order.orderNumber}`);
    doc.text(`Date: ${new Date(order.date).toLocaleDateString()}`);
    doc.text(`Status: ${order.orderStatus.toUpperCase()}`);
    doc.moveDown();
    
    // Customer info
    doc.text(`Customer: ${order.customer?.name || 'Guest'}`);
    if (order.customer?.email) doc.text(`Email: ${order.customer.email}`);
    doc.moveDown();
    
    // Items
    doc.text('Items:', { underline: true });
    doc.moveDown(0.5);
    order.items.forEach(item => {
      doc.text(`${item.product.name} (x${item.quantity}) - $${item.price.toFixed(2)}`);
    });
    
    doc.moveDown();
    doc.fontSize(14).text(`Total: $${order.total.toFixed(2)}`, { align: 'right' });
    
    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate invoice' });
  }
});

module.exports = router;
