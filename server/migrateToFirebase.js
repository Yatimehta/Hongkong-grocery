const prisma = require('./prismaClient');
const { db } = require('./firebaseClient');

async function runConcurrent(items, batchSize, fn) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.all(batch.map(fn));
  }
}

async function migrate() {
  console.log('Starting fast migration to Firebase Firestore...');

  // 1. Settings
  console.log('Migrating settings...');
  const settings = await prisma.setting.findMany();
  await runConcurrent(settings, 50, async (s) => {
    await db.collection('settings').doc(s.key).set({
      key: s.key,
      value: s.value
    });
  });
  console.log(`Migrated ${settings.length} settings.`);

  // 2. Categories
  console.log('Migrating categories...');
  const categories = await prisma.category.findMany();
  await runConcurrent(categories, 50, async (c) => {
    await db.collection('categories').doc(c.id).set({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString()
    });
  });
  console.log(`Migrated ${categories.length} categories.`);

  // 3. Brands
  console.log('Migrating brands...');
  const brands = await prisma.brand.findMany();
  await runConcurrent(brands, 50, async (b) => {
    await db.collection('brands').doc(b.id).set({
      ...b,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString()
    });
  });
  console.log(`Migrated ${brands.length} brands.`);

  // 4. Products (including images, category info, brand info)
  console.log('Migrating products...');
  const products = await prisma.product.findMany({
    include: {
      images: true,
      category: true,
      brand: true
    }
  });
  await runConcurrent(products, 100, async (p) => {
    await db.collection('products').doc(p.id).set({
      ...p,
      images: p.images.map(img => ({ id: img.id, url: img.url, isPrimary: img.isPrimary })),
      category: p.category ? { id: p.category.id, name: p.category.name, slug: p.category.slug } : null,
      brand: p.brand ? { id: p.brand.id, name: p.brand.name, logo: p.brand.logo } : null,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString()
    });
  });
  console.log(`Migrated ${products.length} products.`);

  // 5. Admin Users
  console.log('Migrating admin users...');
  const adminUsers = await prisma.adminUser.findMany();
  await runConcurrent(adminUsers, 50, async (u) => {
    await db.collection('adminUsers').doc(u.id).set({
      ...u,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString()
    });
  });
  console.log(`Migrated ${adminUsers.length} admin users.`);

  // 6. Banners
  console.log('Migrating banners...');
  const banners = await prisma.banner.findMany();
  await runConcurrent(banners, 50, async (b) => {
    await db.collection('banners').doc(b.id).set({
      ...b,
      startDate: b.startDate ? b.startDate.toISOString() : null,
      endDate: b.endDate ? b.endDate.toISOString() : null,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString()
    });
  });
  console.log(`Migrated ${banners.length} banners.`);

  // 7. Blog Posts
  console.log('Migrating blogs...');
  const blogs = await prisma.blogPost.findMany();
  await runConcurrent(blogs, 50, async (post) => {
    await db.collection('blogs').doc(post.id).set({
      ...post,
      publishDate: post.publishDate ? post.publishDate.toISOString() : null,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    });
  });
  console.log(`Migrated ${blogs.length} blog posts.`);

  // 8. Static Pages
  console.log('Migrating static pages...');
  const staticPages = await prisma.staticPage.findMany();
  await runConcurrent(staticPages, 50, async (sp) => {
    await db.collection('staticPages').doc(sp.id).set({
      ...sp,
      createdAt: sp.createdAt.toISOString(),
      updatedAt: sp.updatedAt.toISOString()
    });
  });
  console.log(`Migrated ${staticPages.length} static pages.`);

  // 9. Coupons
  console.log('Migrating coupons...');
  const coupons = await prisma.coupon.findMany();
  await runConcurrent(coupons, 50, async (cp) => {
    await db.collection('coupons').doc(cp.id).set({
      ...cp,
      validFrom: cp.validFrom ? cp.validFrom.toISOString() : null,
      validTo: cp.validTo ? cp.validTo.toISOString() : null,
      createdAt: cp.createdAt.toISOString(),
      updatedAt: cp.updatedAt.toISOString()
    });
  });
  console.log(`Migrated ${coupons.length} coupons.`);

  // 10. Delivery Zones
  console.log('Migrating delivery zones...');
  const zones = await prisma.deliveryZone.findMany();
  await runConcurrent(zones, 50, async (z) => {
    await db.collection('deliveryZones').doc(z.id).set({
      ...z,
      createdAt: z.createdAt.toISOString(),
      updatedAt: z.updatedAt.toISOString()
    });
  });
  console.log(`Migrated ${zones.length} delivery zones.`);

  // 11. Payment Gateways
  console.log('Migrating payment gateways...');
  const gateways = await prisma.paymentGateway.findMany();
  await runConcurrent(gateways, 50, async (g) => {
    await db.collection('paymentGateways').doc(g.id).set({
      ...g,
      updatedAt: g.updatedAt.toISOString()
    });
  });
  console.log(`Migrated ${gateways.length} payment gateways.`);

  // 12. Email Templates
  console.log('Migrating email templates...');
  const templates = await prisma.emailTemplate.findMany();
  await runConcurrent(templates, 50, async (t) => {
    await db.collection('emailTemplates').doc(t.id).set({
      ...t,
      updatedAt: t.updatedAt.toISOString()
    });
  });
  console.log(`Migrated ${templates.length} email templates.`);

  // 13. Orders (including items)
  console.log('Migrating orders...');
  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          product: true
        }
      },
      customer: true
    }
  });
  await runConcurrent(orders, 50, async (o) => {
    await db.collection('orders').doc(o.id).set({
      ...o,
      customer: o.customer ? { id: o.customer.id, name: o.customer.name, email: o.customer.email, phone: o.customer.phone } : null,
      items: o.items.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        productName: item.product?.name || 'Product'
      })),
      date: o.date.toISOString(),
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString()
    });
  });
  console.log(`Migrated ${orders.length} orders.`);

  // 14. Reviews
  console.log('Migrating reviews...');
  const reviews = await prisma.review.findMany({
    include: {
      product: true
    }
  });
  await runConcurrent(reviews, 50, async (r) => {
    await db.collection('reviews').doc(r.id).set({
      ...r,
      product: r.product ? { id: r.product.id, name: r.product.name } : null,
      date: r.date.toISOString(),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString()
    });
  });
  console.log(`Migrated ${reviews.length} reviews.`);

  // 15. Customers (including addresses)
  console.log('Migrating customers...');
  const customers = await prisma.customer.findMany({
    include: {
      addresses: true
    }
  });
  await runConcurrent(customers, 50, async (cust) => {
    await db.collection('customers').doc(cust.id).set({
      ...cust,
      addresses: cust.addresses.map(addr => ({
        id: addr.id,
        street: addr.street,
        city: addr.city,
        zip: addr.zip,
        isDefault: addr.isDefault
      })),
      joinDate: cust.joinDate.toISOString(),
      createdAt: cust.createdAt.toISOString(),
      updatedAt: cust.updatedAt.toISOString()
    });
  });
  console.log(`Migrated ${customers.length} customers.`);

  // 16. Activity Logs
  console.log('Migrating activity logs...');
  const logs = await prisma.activityLog.findMany();
  await runConcurrent(logs, 50, async (log) => {
    await db.collection('activityLogs').doc(log.id).set({
      ...log,
      timestamp: log.timestamp.toISOString()
    });
  });
  console.log(`Migrated ${logs.length} activity logs.`);

  console.log('Data migration to Firebase completed successfully!');
}

migrate()
  .then(() => {
    console.log('Migration finished successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
