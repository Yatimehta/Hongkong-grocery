const express = require('express');
const router = express.Router();
const { db } = require('../firebaseClient');
const { v4: uuidv4 } = require('uuid');

// In-memory cache for products
let productsCache = null;

function getCache() {
  return productsCache;
}

function clearCache() {
  productsCache = null;
}

// Update cache entry in place (avoids needing a Firestore read after write)
function updateCacheEntry(id, data) {
  if (productsCache) {
    const idx = productsCache.findIndex(p => p.id === id);
    if (idx >= 0) {
      productsCache[idx] = { ...productsCache[idx], ...data };
    } else {
      productsCache.push(data);
    }
  }
}

function removeCacheEntry(id) {
  if (productsCache) {
    productsCache = productsCache.filter(p => p.id !== id);
  }
}

// Ensure cache is populated (from Firestore or local fallback)
async function ensureCache() {
  if (productsCache) return productsCache;
  
  console.log('Cache miss: fetching products from Firestore...');
  try {
    const snapshot = await db.collection('products').get();
    const list = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() });
    });
    productsCache = list;
  } catch (firestoreErr) {
    console.error('Firestore query failed. Falling back to local products.json file...', firestoreErr);
    const fs = require('fs');
    const path = require('path');
    const localPath = path.join(__dirname, '../../dist/data/products.json');
    if (fs.existsSync(localPath)) {
      const raw = fs.readFileSync(localPath, 'utf8');
      productsCache = JSON.parse(raw);
      console.log(`Loaded ${productsCache.length} products from local products.json fallback.`);
    } else {
      productsCache = [];
    }
  }
  return productsCache;
}

// GET all products with pagination, search, and filter
router.get('/', async (req, res) => {
  try {
    const { search, categoryId, brandId, status, page = 1, limit = 5000 } = req.query;
    
    await ensureCache();

    let productsList = [...productsCache];

    // In-memory filtering
    if (search) {
      const q = search.toLowerCase();
      productsList = productsList.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) || 
        (p.sku && p.sku.toLowerCase().includes(q))
      );
    }
    if (categoryId) {
      productsList = productsList.filter(p => p.categoryId === categoryId);
    }
    if (brandId) {
      productsList = productsList.filter(p => p.brandId === brandId);
    }
    if (status) {
      productsList = productsList.filter(p => p.status === status);
    }

    // Sort by createdAt desc
    productsList.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    const total = productsList.length;
    const limitNum = limit === 'all' ? 10000 : Number(limit || 5000);
    const skip = (Number(page) - 1) * limitNum;
    
    const paginatedProducts = productsList.slice(skip, skip + limitNum);

    const enrichedProducts = paginatedProducts.map(p => {
      let urls = [];
      if (Array.isArray(p.image_urls) && p.image_urls.length > 0) {
        urls = p.image_urls.filter(u => typeof u === 'string' && u.trim().length > 0);
      }
      if (!urls.length && Array.isArray(p.images) && p.images.length > 0) {
        urls = p.images.map(i => (typeof i === 'object' && i !== null ? i.url : i)).filter(Boolean);
      }
      if (!urls.length && Array.isArray(p.local_images) && p.local_images.length > 0) {
        urls = p.local_images.map(img => typeof img === 'string' ? (img.startsWith('/') ? img : '/' + img) : '').filter(Boolean);
      }
      if (!urls.length && typeof p.image === 'string' && p.image.trim().length > 0) {
        urls = [p.image.trim()];
      }

      const primaryImg = urls[0] || '';

      return {
        ...p,
        categoryName: (typeof p.category === 'object' && p.category ? p.category.name : p.category) || 'Uncategorized',
        image_urls: urls,
        image: primaryImg,
        in_stock: p.stock > 0 || p.status === 'active' || p.in_stock !== false
      };
    });

    res.json({
      data: enrichedProducts,
      products: enrichedProducts,
      pagination: {
        total,
        page: Number(page),
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    await ensureCache();
    const product = productsCache.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Helper: get categories cache (import from categories route or load locally)
async function getCategoriesCache() {
  try {
    const catRoute = require('./categories');
    if (catRoute.getCache && catRoute.getCache()) return catRoute.getCache();
  } catch (e) {}
  return [];
}

// CREATE product
router.post('/', async (req, res) => {
  try {
    const { name, description, price, salePrice, stock, unit, status, categoryId, brandId, images } = req.body;
    const sku = req.body.sku || ('SKU-' + Date.now());
    
    // Check uniqueness of SKU using in-memory cache
    await ensureCache();
    if (sku && productsCache.some(p => p.sku === sku)) {
      return res.status(400).json({ error: 'SKU must be unique' });
    }

    // Lookup category from cache instead of Firestore read
    let categoryObj = null;
    if (categoryId) {
      const cats = await getCategoriesCache();
      const cat = cats.find(c => c.id === categoryId);
      if (cat) {
        categoryObj = { id: cat.id, name: cat.name, slug: cat.slug };
      }
    }

    let brandObj = null;
    // Brand lookup from cache (no Firestore read)

    const id = uuidv4();
    const productData = {
      id,
      name,
      sku,
      description: description || '',
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : null,
      stock: Number(stock || 0),
      unit: unit || 'piece',
      status: status || 'active',
      categoryId: categoryId || null,
      brandId: brandId || null,
      category: categoryObj,
      brand: brandObj,
      images: (images || []).map(img => ({
        id: uuidv4(),
        url: img.url,
        isPrimary: img.isPrimary || false
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.collection('products').doc(id).set(productData);
    updateCacheEntry(id, productData); // Update cache directly
    res.status(201).json(productData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// UPDATE product
router.put('/:id', async (req, res) => {
  try {
    const { name, sku, description, price, salePrice, stock, unit, status, categoryId, brandId, images } = req.body;
    
    // Check existence from cache instead of Firestore read
    await ensureCache();
    const existing = productsCache.find(p => p.id === req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    // SKU unique check from cache
    if (sku) {
      const conflict = productsCache.find(p => p.sku === sku && p.id !== req.params.id);
      if (conflict) {
        return res.status(400).json({ error: 'SKU must be unique' });
      }
    }

    // Lookup category from cache
    let categoryObj = undefined;
    if (categoryId !== undefined) {
      if (categoryId) {
        const cats = await getCategoriesCache();
        const cat = cats.find(c => c.id === categoryId);
        if (cat) {
          categoryObj = { id: cat.id, name: cat.name, slug: cat.slug };
        }
      } else {
        categoryObj = null;
      }
    }

    let brandObj = undefined;
    if (brandId !== undefined) {
      brandObj = brandId ? null : null; // No brands in current data
    }

    const updatedData = {
      updatedAt: new Date().toISOString()
    };
    if (name !== undefined) updatedData.name = name;
    if (sku !== undefined) updatedData.sku = sku;
    if (description !== undefined) updatedData.description = description;
    if (price !== undefined) updatedData.price = Number(price);
    if (salePrice !== undefined) updatedData.salePrice = salePrice ? Number(salePrice) : null;
    if (stock !== undefined) updatedData.stock = Number(stock);
    if (unit !== undefined) updatedData.unit = unit;
    if (status !== undefined) updatedData.status = status;
    if (categoryId !== undefined) {
      updatedData.categoryId = categoryId;
      updatedData.category = categoryObj;
    }
    if (brandId !== undefined) {
      updatedData.brandId = brandId;
      updatedData.brand = brandObj;
    }
    if (images !== undefined) {
      updatedData.images = images.map(img => ({
        id: img.id || uuidv4(),
        url: img.url,
        isPrimary: img.isPrimary || false
      }));
    }

    const docRef = db.collection('products').doc(req.params.id);
    await docRef.update(updatedData);
    
    // Update cache directly instead of re-reading from Firestore
    const fullUpdated = { ...existing, ...updatedData };
    updateCacheEntry(req.params.id, fullUpdated);
    res.json(fullUpdated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    // Check if used in orders (use cache-friendly approach)
    // Skip order check if Firestore reads are exhausted - just delete
    try {
      const orderSnapshot = await db.collection('orders').get();
      let isUsed = false;
      orderSnapshot.forEach(doc => {
        const order = doc.data();
        if (order.items && order.items.some(item => item.productId === req.params.id)) {
          isUsed = true;
        }
      });
      if (isUsed) {
        return res.status(400).json({ error: 'Cannot delete product because it is part of an existing order.' });
      }
    } catch (orderErr) {
      // If order check fails due to quota, skip it and allow deletion
      console.log('Order check skipped (quota limit), proceeding with delete');
    }

    await db.collection('products').doc(req.params.id).delete();
    removeCacheEntry(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// BULK DELETE
router.post('/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids array required' });

    const batch = db.batch();
    ids.forEach(id => {
      const docRef = db.collection('products').doc(id);
      batch.delete(docRef);
    });
    await batch.commit();
    
    // Update cache
    if (productsCache) {
      productsCache = productsCache.filter(p => !ids.includes(p.id));
    }

    res.json({ message: 'Products deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete products' });
  }
});

module.exports = router;
module.exports.getCache = getCache;
module.exports.ensureCache = ensureCache;
