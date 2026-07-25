const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Helper to parse simple CSV text into array of objects
function parseCSVText(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
  if (lines.length === 0) return [];
  
  // Parse header
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    // Basic CSV line splitting honoring quotes
    const regex = /(".*?"|[^",\s]+)(?=\s*,|\s*$)/g;
    const vals = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = vals[idx] !== undefined ? vals[idx] : '';
    });
    rows.push(row);
  }
  return { headers, rows };
}

// POST parse CSV file or text for import mapping preview
router.post('/parse-csv', upload.single('file'), (req, res) => {
  try {
    let csvContent = '';
    if (req.file) {
      csvContent = req.file.buffer.toString('utf-8');
    } else if (req.body.csvText) {
      csvContent = req.body.csvText;
    } else {
      return res.status(400).json({ error: 'No CSV file or text provided' });
    }

    const { headers, rows } = parseCSVText(csvContent);
    res.json({
      headers,
      totalRows: rows.length,
      sampleRows: rows.slice(0, 5),
      rows
    });
  } catch (err) {
    console.error('CSV parse error:', err);
    res.status(500).json({ error: 'Failed to parse CSV format' });
  }
});

// POST batch import products and stock levels from mapped rows
router.post('/import', async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No mapped item rows to import' });
    }

    let created = 0;
    let updated = 0;
    let errors = [];

    // Pre-fetch all categories for fast mapping
    const categories = await prisma.category.findMany();
    const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));
    let defaultCatId = categories[0]?.id;

    // Create general category if none exist
    if (!defaultCatId) {
      const genCat = await prisma.category.create({
        data: { name: 'General Groceries', slug: 'general-groceries', status: 'active' }
      });
      defaultCatId = genCat.id;
      categoryMap.set('general groceries', genCat.id);
    }

    for (let i = 0; i < items.length; i++) {
      const row = items[i];
      try {
        if (!row.name || !row.price) {
          errors.push(`Row #${i + 1}: Missing product name or price`);
          continue;
        }

        const price = parseFloat(row.price) || 0;
        const compareAtPrice = row.compareAtPrice ? parseFloat(row.compareAtPrice) : null;
        const stock = parseInt(row.stock) || 0;
        const sku = row.sku || `GRO-${Date.now()}-${i}`;
        const unit = row.unit || 'piece';
        const description = row.description || `Fresh ${row.name} available at our grocery store.`;
        
        // Map category by name if provided
        let categoryId = defaultCatId;
        if (row.category && categoryMap.has(row.category.toLowerCase())) {
          categoryId = categoryMap.get(row.category.toLowerCase());
        } else if (row.category) {
          // Create new category on the fly
          const newCat = await prisma.category.create({
            data: { 
              name: row.category, 
              slug: row.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'), 
              status: 'active' 
            }
          });
          categoryId = newCat.id;
          categoryMap.set(row.category.toLowerCase(), categoryId);
        }

        const existing = await prisma.product.findUnique({ where: { sku: sku } });

        if (existing) {
          await prisma.product.update({
            where: { id: existing.id },
            data: {
              name: row.name,
              price,
              compareAtPrice,
              stock,
              unit,
              description,
              categoryId
            }
          });
          updated++;
        } else {
          const newProd = await prisma.product.create({
            data: {
              name: row.name,
              sku,
              price,
              compareAtPrice,
              stock,
              unit,
              description,
              status: 'active',
              categoryId
            }
          });

          // If an image URL is provided, add to product images
          if (row.image) {
            await prisma.productImage.create({
              data: { productId: newProd.id, url: row.image, isPrimary: true }
            });
          }
          created++;
        }
      } catch (rowErr) {
        errors.push(`Row #${i + 1} (${row.name || 'unknown'}): ${rowErr.message}`);
      }
    }

    res.json({
      success: true,
      created,
      updated,
      errorCount: errors.length,
      errors
    });
  } catch (err) {
    console.error('Import error:', err);
    res.status(500).json({ error: 'Bulk product import failed' });
  }
});

// POST bulk stock & price modification rules
router.post('/bulk-modify', async (req, res) => {
  try {
    const { action, value, categoryId } = req.body;
    const where = categoryId && categoryId !== 'all' ? { categoryId } : {};

    const products = await prisma.product.findMany({ where });
    let modifiedCount = 0;

    for (const prod of products) {
      let updateData = {};
      const numVal = parseFloat(value) || 0;

      if (action === 'increase_price_percent') {
        updateData.price = parseFloat((prod.price * (1 + numVal / 100)).toFixed(2));
      } else if (action === 'decrease_price_percent') {
        updateData.price = parseFloat((prod.price * Math.max(0, 1 - numVal / 100)).toFixed(2));
      } else if (action === 'add_stock') {
        updateData.stock = prod.stock + Math.round(numVal);
      } else if (action === 'set_stock') {
        updateData.stock = Math.max(0, Math.round(numVal));
      } else if (action === 'zero_out_of_stock') {
        if (prod.stock < 0) updateData.stock = 0;
        else continue;
      }

      await prisma.product.update({ where: { id: prod.id }, data: updateData });
      modifiedCount++;
    }

    res.json({ success: true, modifiedCount, message: `Successfully modified ${modifiedCount} products!` });
  } catch (err) {
    console.error('Bulk modify error:', err);
    res.status(500).json({ error: 'Bulk modification failed' });
  }
});

module.exports = router;
