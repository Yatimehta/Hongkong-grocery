const express = require('express');
const router = express.Router();
const { db } = require('../firebaseClient');
const { v4: uuidv4 } = require('uuid');

// In-memory cache for categories
let categoriesCache = null;

function getCache() {
  return categoriesCache;
}

function clearCache() {
  categoriesCache = null;
}

function updateCacheEntry(id, data) {
  if (categoriesCache) {
    const idx = categoriesCache.findIndex(c => c.id === id);
    if (idx >= 0) {
      categoriesCache[idx] = { ...categoriesCache[idx], ...data };
    } else {
      categoriesCache.push({
        ...data,
        parent: null,
        _count: { products: 0 }
      });
    }
  }
}

function removeCacheEntry(id) {
  if (categoriesCache) {
    categoriesCache = categoriesCache.filter(c => c.id !== id);
  }
}

// Ensure cache is populated
async function ensureCache() {
  if (categoriesCache) return categoriesCache;

  console.log('Cache miss: fetching categories from Firestore...');
  try {
    const snapshot = await db.collection('categories').get();
    const categories = [];
    snapshot.forEach(doc => categories.push({ id: doc.id, ...doc.data() }));

    // Fetch product counts
    let prodSnapshot;
    try {
      prodSnapshot = await db.collection('products').get();
    } catch (e) {
      prodSnapshot = { forEach: () => {} };
    }
    const counts = {};
    prodSnapshot.forEach(doc => {
      const p = doc.data();
      if (p.categoryId) {
        counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
      }
    });

    const enrichedCategories = categories.map(c => {
      const parentName = c.parentId ? (categories.find(p => p.id === c.parentId)?.name || '') : '';
      return {
        ...c,
        parent: c.parentId ? { name: parentName } : null,
        _count: { products: counts[c.id] || 0 }
      };
    });

    enrichedCategories.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    categoriesCache = enrichedCategories;
  } catch (firestoreErr) {
    console.error('Firestore query failed. Falling back to local categories.json...', firestoreErr);
    const fs = require('fs');
    const path = require('path');
    const localPath = path.join(__dirname, '../../dist/data/categories.json');
    if (fs.existsSync(localPath)) {
      const raw = fs.readFileSync(localPath, 'utf8');
      const localCats = JSON.parse(raw);
      categoriesCache = localCats.map(c => ({
        ...c,
        parent: null,
        _count: { products: 0 }
      }));
      console.log(`Loaded ${categoriesCache.length} categories from local categories.json fallback.`);
    } else {
      categoriesCache = [];
    }
  }
  return categoriesCache;
}

// GET all categories
router.get('/', async (req, res) => {
  try {
    await ensureCache();
    res.json(categoriesCache);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// CREATE category
router.post('/', async (req, res) => {
  try {
    const { name, description, image, parentId, displayOrder } = req.body;
    
    // Auto-generate slug if not provided
    const slug = req.body.slug || (name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now() : 'cat-' + Date.now());
    
    // Unique slug check from cache
    await ensureCache();
    if (slug && categoriesCache.some(c => c.slug === slug)) {
      return res.status(400).json({ error: 'Slug must be unique' });
    }

    const id = uuidv4();
    const newCategory = {
      id,
      name: name || '',
      slug,
      description: description || '',
      image: image || '',
      parentId: parentId || null,
      displayOrder: Number(displayOrder || 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.collection('categories').doc(id).set(newCategory);
    updateCacheEntry(id, newCategory);
    res.status(201).json(newCategory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// UPDATE category
router.put('/:id', async (req, res) => {
  try {
    const { name, slug, description, image, parentId, displayOrder } = req.body;
    
    // Check existence from cache
    await ensureCache();
    const existing = categoriesCache.find(c => c.id === req.params.id);
    if (!existing) return res.status(404).json({ error: 'Category not found' });

    // Unique slug check from cache
    if (slug) {
      const conflict = categoriesCache.find(c => c.slug === slug && c.id !== req.params.id);
      if (conflict) {
        return res.status(400).json({ error: 'Slug must be unique' });
      }
    }

    const updatedData = {
      updatedAt: new Date().toISOString()
    };
    if (name !== undefined) updatedData.name = name;
    if (slug !== undefined) updatedData.slug = slug;
    if (description !== undefined) updatedData.description = description;
    if (image !== undefined) updatedData.image = image;
    if (parentId !== undefined) updatedData.parentId = parentId || null;
    if (displayOrder !== undefined) updatedData.displayOrder = Number(displayOrder);

    const docRef = db.collection('categories').doc(req.params.id);
    await docRef.update(updatedData);
    
    // Update cache directly
    const fullUpdated = { ...existing, ...updatedData };
    updateCacheEntry(req.params.id, fullUpdated);
    res.json(fullUpdated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE category
router.delete('/:id', async (req, res) => {
  try {
    // Check if category is used in products (from cache)
    await ensureCache();
    try {
      const prodRoute = require('./products');
      const prodCache = prodRoute.getCache ? prodRoute.getCache() : null;
      if (prodCache) {
        const hasProducts = prodCache.some(p => p.categoryId === req.params.id);
        if (hasProducts) {
          return res.status(400).json({ error: 'Cannot delete category because it contains active products.' });
        }
      }
    } catch (e) {
      // If check fails, skip it
    }

    await db.collection('categories').doc(req.params.id).delete();
    removeCacheEntry(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;
module.exports.getCache = getCache;
module.exports.ensureCache = ensureCache;
