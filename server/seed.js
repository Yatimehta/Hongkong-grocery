const prisma = require('./prismaClient');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🌱 Starting database check & seeding process...');

  try {
    // 1. Seed Admin Super User
    const adminCount = await prisma.adminUser.count();
    if (adminCount === 0) {
      console.log('Creating initial Super Admin account...');
      await prisma.adminUser.create({
        data: {
          name: 'Shop Owner (Super Admin)',
          email: 'admin@freshmarketgrocery.com',
          passwordHash: '$2b$10$defaultPasswordHashForDemonstration',
          role: 'super_admin',
          permissions: JSON.stringify(['all'])
        }
      });
    }

    // 2. Seed Categories & Products from public/data/ if DB is empty or force flag used
    const productCount = await prisma.product.count();
    if (productCount < 50 || process.argv.includes('--force-products')) {
      console.log('Importing complete storefront catalog sample data (4,200+ items)...');
      
      if (process.argv.includes('--force-products')) {
        await prisma.orderItem.deleteMany().catch(()=>{});
        await prisma.order.deleteMany().catch(()=>{});
        await prisma.review.deleteMany().catch(()=>{});
        await prisma.inventoryAdjustment.deleteMany().catch(()=>{});
        await prisma.productImage.deleteMany().catch(()=>{});
        await prisma.product.deleteMany().catch(()=>{});
        console.log('Cleared existing test products & references for full synchronization.');
      }

      const catPath = path.join(__dirname, '../public/data/categories.json');
      const prodPath = path.join(__dirname, '../public/data/products.json');
      
      let createdCategories = {};
      if (fs.existsSync(catPath)) {
        const categories = JSON.parse(fs.readFileSync(catPath, 'utf8'));
        for (const cat of categories) {
          if (cat.name) {
            let existing = await prisma.category.findFirst({ where: { name: cat.name } });
            if (!existing) {
              const slug = cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random()*1000);
              existing = await prisma.category.create({
                data: {
                  name: cat.name,
                  slug: slug,
                  description: `Fresh quality ${cat.name} sourced for rapid Hong Kong grocery delivery.`
                }
              }).catch(() => null);
            }
            if (existing) {
              createdCategories[cat.name] = existing.id;
            }
          }
        }
      }

      if (fs.existsSync(prodPath)) {
        const products = JSON.parse(fs.readFileSync(prodPath, 'utf8'));
        const productRows = [];
        const imageRows = [];
        const usedSkus = new Set();
        const usedIds = new Set();

        for (let i = 0; i < products.length; i++) {
          const prod = products[i];
          let prodId = String(prod.id || `PROD-${i+1000}`);
          if (usedIds.has(prodId)) prodId = `${prodId}-${i}`;
          usedIds.add(prodId);

          let sku = `SKU-${prodId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 15)}-${i}`;
          if (usedSkus.has(sku)) sku = `${sku}-${Math.floor(Math.random()*10000)}`;
          usedSkus.add(sku);

          const catId = createdCategories[prod.category] || null;

          productRows.push({
            id: prodId,
            name: String(prod.name || prod.title || 'Fresh Organic Item').trim(),
            sku: sku,
            description: String(prod.description || 'Premium quality supermarket grocery item.'),
            price: Number(prod.price || 25.0),
            stock: Math.floor(Math.random() * 80) + 10,
            lowStockThreshold: 10,
            categoryId: catId,
            status: 'active'
          });

          const imgUrls = Array.isArray(prod.image_urls) && prod.image_urls.length ? prod.image_urls : ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600'];
          imgUrls.forEach((url, idx) => {
            if (typeof url === 'string' && url.trim().length > 0) {
              imageRows.push({
                productId: prodId,
                url: url.trim(),
                isPrimary: idx === 0
              });
            }
          });
        }

        console.log(`Inserting ${productRows.length} products in batches...`);
        for (let i = 0; i < productRows.length; i += 500) {
          const batch = productRows.slice(i, i + 500);
          await prisma.product.createMany({ data: batch });
        }

        console.log(`Inserting ${imageRows.length} product images in batches...`);
        for (let i = 0; i < imageRows.length; i += 500) {
          const batch = imageRows.slice(i, i + 500);
          await prisma.productImage.createMany({ data: batch });
        }
      }
      console.log('✓ Complete storefront catalog imported cleanly into database.');
    }

    // 3. Seed Sample Customers & Orders
    const customerCount = await prisma.customer.count();
    if (customerCount === 0) {
      console.log('Creating sample customer accounts & historical orders...');
      const customer1 = await prisma.customer.create({
        data: {
          name: 'Alan Wong',
          email: 'alan.wong@hkdomain.com',
          phone: '+852 9123 4567',
          totalOrders: 4,
          totalSpent: 420.50
        }
      });

      const customer2 = await prisma.customer.create({
        data: {
          name: 'Sarah Chen',
          email: 'sarah.c@hkdomain.com',
          phone: '+852 9876 5432',
          totalOrders: 1,
          totalSpent: 85.00
        }
      });

      // Sample Orders
      await prisma.order.create({
        data: {
          customerName: customer1.name,
          customerEmail: customer1.email,
          customerPhone: customer1.phone,
          shippingAddress: 'Flat 12B, Tower 2, Taikoo Shing, Hong Kong Island',
          total: 185.00,
          orderStatus: 'delivered',
          paymentStatus: 'paid',
          paymentMethod: 'PayMe / FPS',
          items: {
            create: [
              { productName: 'Organic Baby Spinach 250g', price: 45.00, quantity: 2 },
              { productName: 'Farm Fresh Australian Milk 2L', price: 95.00, quantity: 1 }
            ]
          }
        }
      });

      await prisma.order.create({
        data: {
          customerName: customer2.name,
          customerEmail: customer2.email,
          customerPhone: customer2.phone,
          shippingAddress: 'Room 504, King Lai Court, Wong Tai Sin, Kowloon',
          total: 85.00,
          orderStatus: 'processing',
          paymentStatus: 'paid',
          paymentMethod: 'Credit Card (Stripe)',
          items: {
            create: [
              { productName: 'Premium Jasmine Rice 5kg', price: 85.00, quantity: 1 }
            ]
          }
        }
      });
      console.log('✓ Sample orders & customers initialized.');
    }

    // 4. Seed initial Activity Log entry
    const logCount = await prisma.activityLog.count();
    if (logCount === 0) {
      await prisma.activityLog.create({
        data: {
          action: 'System Initialization',
          user: 'System Setup',
          target: 'Database ORM',
          details: 'Executed initial database schema push and sample catalog migration seed script'
        }
      });
    }

    console.log('✅ Database seeding complete! Admin Panel is fully operational.');
  } catch (e) {
    console.error('Seed error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = main;
