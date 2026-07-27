const express = require('express');
const router = express.Router();
const { db } = require('../firebaseClient');
const PDFDocument = require('pdfkit');

// GET all orders
router.get('/', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    
    let ordersList = [];
    try {
      const snapshot = await db.collection('orders').get();
      snapshot.forEach(doc => {
        ordersList.push({ id: doc.id, ...doc.data() });
      });
    } catch (e) {
      console.log('Orders Firestore read failed, using empty array');
    }

    if (search) {
      const q = search.toLowerCase();
      ordersList = ordersList.filter(o => 
        (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
        (o.customer && o.customer.name && o.customer.name.toLowerCase().includes(q))
      );
    }
    if (status) {
      ordersList = ordersList.filter(o => o.orderStatus === status);
    }

    // Sort by createdAt desc
    ordersList.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    const total = ordersList.length;
    const limitNum = Number(limit);
    const skip = (Number(page) - 1) * limitNum;
    const paginatedOrders = ordersList.slice(skip, skip + limitNum);

    const data = paginatedOrders.map(o => ({
      ...o,
      _count: { items: o.items ? o.items.length : 0 }
    }));

    res.json({
      data,
      pagination: {
        total,
        page: Number(page),
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET single order
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('orders').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Order not found' });
    
    const order = { id: doc.id, ...doc.data() };
    
    // Resolve products for items if missing to match include logic
    if (order.items) {
      order.items = order.items.map(item => ({
        ...item,
        product: { name: item.productName || 'Product', sku: '' }
      }));
    }
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// UPDATE order status
router.put('/:id', async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    
    const docRef = db.collection('orders').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Order not found' });

    const updatedData = {
      updatedAt: new Date().toISOString()
    };
    if (orderStatus) updatedData.orderStatus = orderStatus;
    if (paymentStatus) updatedData.paymentStatus = paymentStatus;

    await docRef.update(updatedData);
    const updatedDoc = await docRef.get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// GET order invoice PDF
router.get('/:id/invoice', async (req, res) => {
  try {
    const doc = await db.collection('orders').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Order not found' });
    const order = doc.data();

    const pdfDoc = new PDFDocument();
    let filename = `Invoice_${order.orderNumber}.pdf`;
    
    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');
    
    pdfDoc.pipe(res);
    
    // Header
    pdfDoc.fontSize(20).text('INVOICE', { align: 'center' });
    pdfDoc.moveDown();
    
    // Order info
    pdfDoc.fontSize(12).text(`Order Number: ${order.orderNumber}`);
    pdfDoc.text(`Date: ${new Date(order.date).toLocaleDateString()}`);
    pdfDoc.text(`Status: ${(order.orderStatus || 'pending').toUpperCase()}`);
    pdfDoc.moveDown();
    
    // Customer info
    pdfDoc.text(`Customer: ${order.customer?.name || 'Guest'}`);
    if (order.customer?.email) pdfDoc.text(`Email: ${order.customer.email}`);
    pdfDoc.moveDown();
    
    // Items
    pdfDoc.text('Items:', { underline: true });
    pdfDoc.moveDown(0.5);
    if (order.items) {
      order.items.forEach(item => {
        pdfDoc.text(`${item.productName || 'Product'} (x${item.quantity}) - $${Number(item.price || 0).toFixed(2)}`);
      });
    }
    
    pdfDoc.moveDown();
    pdfDoc.fontSize(14).text(`Total: $${Number(order.total || 0).toFixed(2)}`, { align: 'right' });
    
    pdfDoc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate invoice' });
  }
});

module.exports = router;
