const express = require('express');
const router = express.Router();
const { db } = require('../firebaseClient');
const { v4: uuidv4 } = require('uuid');

// GET all banners ordered by displayOrder
router.get('/', async (req, res) => {
  try {
    let banners = [];
    try {
      const snapshot = await db.collection('banners').get();
      snapshot.forEach(doc => banners.push({ id: doc.id, ...doc.data() }));
      banners.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    } catch (e) {
      console.log('Banners Firestore read failed, using empty array');
    }
    res.json(banners);
  } catch (err) {
    console.error('Error fetching banners:', err);
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
});

// POST create a banner
router.post('/', async (req, res) => {
  try {
    const { title, subtext, buttonText, image, link, mediaType, displayOrder, active, startDate, endDate } = req.body;
    
    // Calculate displayOrder if not provided
    let order = displayOrder;
    if (order === undefined || order === null) {
      const snapshot = await db.collection('banners').get();
      order = snapshot.size + 1;
    }

    const id = uuidv4();
    const banner = {
      id,
      title: title || '',
      subtext: subtext || null,
      buttonText: buttonText || null,
      image: image,
      link: link || null,
      mediaType: mediaType || 'IMAGE',
      displayOrder: Number(order),
      active: active !== undefined ? Boolean(active) : true,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate: endDate ? new Date(endDate).toISOString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.collection('banners').doc(id).set(banner);
    res.status(201).json(banner);
  } catch (err) {
    console.error('Error creating banner:', err);
    res.status(500).json({ error: 'Failed to create banner' });
  }
});

// PUT update a banner
router.put('/:id', async (req, res) => {
  try {
    const { title, subtext, buttonText, image, link, mediaType, displayOrder, active, startDate, endDate } = req.body;
    const docRef = db.collection('banners').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Banner not found' });

    const updatedData = {
      updatedAt: new Date().toISOString()
    };
    if (title !== undefined) updatedData.title = title;
    if (subtext !== undefined) updatedData.subtext = subtext;
    if (buttonText !== undefined) updatedData.buttonText = buttonText;
    if (image !== undefined) updatedData.image = image;
    if (link !== undefined) updatedData.link = link;
    if (mediaType !== undefined) updatedData.mediaType = mediaType;
    if (displayOrder !== undefined) updatedData.displayOrder = Number(displayOrder);
    if (active !== undefined) updatedData.active = Boolean(active);
    if (startDate !== undefined) updatedData.startDate = startDate ? new Date(startDate).toISOString() : null;
    if (endDate !== undefined) updatedData.endDate = endDate ? new Date(endDate).toISOString() : null;

    await docRef.update(updatedData);
    const updatedDoc = await docRef.get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (err) {
    console.error('Error updating banner:', err);
    res.status(500).json({ error: 'Failed to update banner' });
  }
});

// PUT reorder banners (bulk order update)
router.put('/reorder/all', async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, displayOrder }
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items must be an array' });
    }
    const batch = db.batch();
    for (const item of items) {
      const docRef = db.collection('banners').doc(item.id);
      batch.update(docRef, { displayOrder: Number(item.displayOrder), updatedAt: new Date().toISOString() });
    }
    await batch.commit();
    res.json({ message: 'Banners reordered successfully' });
  } catch (err) {
    console.error('Error reordering banners:', err);
    res.status(500).json({ error: 'Failed to reorder banners' });
  }
});

// DELETE banner
router.delete('/:id', async (req, res) => {
  try {
    await db.collection('banners').doc(req.params.id).delete();
    res.json({ message: 'Banner deleted successfully' });
  } catch (err) {
    console.error('Error deleting banner:', err);
    res.status(500).json({ error: 'Failed to delete banner' });
  }
});

module.exports = router;
