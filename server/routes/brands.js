const express = require('express');
const router = express.Router();
const { db } = require('../firebaseClient');
const { v4: uuidv4 } = require('uuid');

let brandsCache = null;

// GET all brands
router.get('/', async (req, res) => {
  try {
    if (!brandsCache) {
      try {
        const snapshot = await db.collection('brands').get();
        const brands = [];
        snapshot.forEach(doc => brands.push({ id: doc.id, ...doc.data() }));
        brands.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        brandsCache = brands;
      } catch (e) {
        console.log('Brands Firestore read failed, using empty array');
        brandsCache = [];
      }
    }
    res.json(brandsCache);
  } catch (err) {
    console.error('Error fetching brands:', err);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

// POST create brand
router.post('/', async (req, res) => {
  try {
    const { name, logo, url, displayOrder, status } = req.body;
    const order = displayOrder !== undefined && displayOrder !== null ? displayOrder : (brandsCache ? brandsCache.length + 1 : 1);
    const id = uuidv4();
    const brand = {
      id,
      name,
      logo: logo || '',
      url: url || null,
      displayOrder: Number(order),
      status: status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await db.collection('brands').doc(id).set(brand);
    if (brandsCache) brandsCache.push(brand);
    res.status(201).json(brand);
  } catch (err) {
    console.error('Error creating brand:', err);
    res.status(500).json({ error: 'Failed to create brand' });
  }
});

// PUT update brand
router.put('/:id', async (req, res) => {
  try {
    const { name, logo, url, displayOrder, status } = req.body;
    
    const existing = brandsCache ? brandsCache.find(b => b.id === req.params.id) : null;
    if (!existing) return res.status(404).json({ error: 'Brand not found' });

    const updatedData = { updatedAt: new Date().toISOString() };
    if (name !== undefined) updatedData.name = name;
    if (logo !== undefined) updatedData.logo = logo;
    if (url !== undefined) updatedData.url = url;
    if (displayOrder !== undefined) updatedData.displayOrder = Number(displayOrder);
    if (status !== undefined) updatedData.status = status;

    await db.collection('brands').doc(req.params.id).update(updatedData);
    const fullUpdated = { ...existing, ...updatedData };
    if (brandsCache) {
      const idx = brandsCache.findIndex(b => b.id === req.params.id);
      if (idx >= 0) brandsCache[idx] = fullUpdated;
    }
    res.json(fullUpdated);
  } catch (err) {
    console.error('Error updating brand:', err);
    res.status(500).json({ error: 'Failed to update brand' });
  }
});

// DELETE brand
router.delete('/:id', async (req, res) => {
  try {
    await db.collection('brands').doc(req.params.id).delete();
    if (brandsCache) brandsCache = brandsCache.filter(b => b.id !== req.params.id);
    res.json({ message: 'Brand deleted successfully' });
  } catch (err) {
    console.error('Error deleting brand:', err);
    res.status(500).json({ error: 'Failed to delete brand' });
  }
});

module.exports = router;
