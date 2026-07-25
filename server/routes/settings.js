const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

const defaultSettings = {
  general: {
    store_name: 'Fresh Market Grocery',
    store_slogan: 'Your neighborhood farm-to-table grocery store',
    contact_email: 'support@freshmarketgrocery.com',
    support_phone: '+1 (555) 234-5678',
    store_address: '123 Market Plaza, Suite 4B, Central District',
    currency_symbol: '$',
    store_logo: 'https://via.placeholder.com/200x60?text=Fresh+Market+Logo',
    favicon_url: '/favicon.ico',
    notice_banner_active: 'true',
    notice_banner_text: '🎉 Free Same-Day Delivery on all organic orders over $50!',
    store_url: 'https://example.com',
    admin_orders_url: '/admin/orders.php',
    facebook_url: '',
    instagram_url: '',
    twitter_url: ''
  },
  site_manager: {
    nav_items: JSON.stringify([
      { title: 'Fresh Produce', link: '/category/produce', order: 1 },
      { title: 'Dairy & Eggs', link: '/category/dairy', order: 2 },
      { title: 'Bakery & Grains', link: '/category/bakery', order: 3 },
      { title: 'Weekly Deals', link: '/deals', order: 4 },
      { title: 'Recipes Blog', link: '/blog', order: 5 }
    ]),
    show_hero_banner: 'true',
    show_featured_brands: 'true',
    show_best_sellers_section: 'true',
    show_newsletter_box: 'true'
  },
  payments: {
    cod_enabled: 'true',
    cod_instructions: 'Pay cash directly to our delivery driver upon delivery and receipt of intact groceries.',
    bank_transfer_enabled: 'true',
    bank_transfer_details: 'Bank: Apex City Bank\nAccount Name: Fresh Market Inc\nAccount Number: 987-654-3210\nRouting: 021000021\nPlease include your Order # in transfer notes.',
    stripe_enabled: 'false',
    stripe_public_key: '',
    stripe_secret_key: '',
    minimum_order_amount: '15.00'
  },
  delivery_tax: {
    base_delivery_fee: '4.99',
    free_delivery_threshold: '50.00',
    express_delivery_fee: '9.99',
    tax_percentage: '5.0',
    tax_included_in_price: 'true',
    same_day_cutoff_hour: '15', // 3 PM
    delivery_areas: 'Central District, North Suburbs, West End, Harbor Bay'
  },
  seo: {
    global_meta_title: 'Fresh Market Grocery | Organic Farm Produce & Everyday Essentials Delivered',
    global_meta_description: 'Shop fresh vegetables, fruits, dairy, and farm produce online. Enjoy same-day door delivery and exclusive savings at Fresh Market Grocery.',
    google_analytics_id: 'G-XXXXXXXXXX',
    facebook_pixel_id: 'FP-987654321',
    robots_txt_rules: 'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /checkout/'
  },
  email: {
    sender_name: 'Fresh Market Notifications',
    sender_email: 'orders@freshmarketgrocery.com',
    smtp_host: 'smtp.mailgun.org',
    smtp_port: '587',
    smtp_username: '',
    smtp_password: '',
    send_order_confirmation: 'true',
    send_shipping_update: 'true',
    order_email_subject: 'Your Fresh Market Grocery Order Confirmation (#{{order_id}})'
  },
  social: {
    facebook_url: '',
    instagram_url: '',
    twitter_url: ''
  }
};

// Helper function to seed defaults if missing
async function seedGroupDefaults(group) {
  const defaults = defaultSettings[group];
  if (!defaults) return;

  for (const [key, value] of Object.entries(defaults)) {
    const existing = await prisma.setting.findUnique({
      where: { key }
    });
    if (!existing) {
      await prisma.setting.create({
        data: { key, value: String(value) }
      });
    }
  }
}

// GET settings by group
router.get('/', async (req, res) => {
  try {
    const { group } = req.query;
    
    if (group && defaultSettings[group]) {
      await seedGroupDefaults(group);
      const keys = Object.keys(defaultSettings[group]);
      const settings = await prisma.setting.findMany({
        where: { key: { in: keys } }
      });
      const result = {};
      settings.forEach(s => { result[s.key] = s.value; });
      return res.json(result);
    } else {
      // Seed all groups
      for (const g of Object.keys(defaultSettings)) {
        await seedGroupDefaults(g);
      }
      const allSettings = await prisma.setting.findMany();
      const result = {};
      allSettings.forEach(s => {
        // Find which group this key belongs to
        let foundGroup = 'general';
        for (const [g, keysObj] of Object.entries(defaultSettings)) {
          if (keysObj.hasOwnProperty(s.key)) {
            foundGroup = g;
            break;
          }
        }
        if (!result[foundGroup]) result[foundGroup] = {};
        result[foundGroup][s.key] = s.value;
      });
      return res.json(result);
    }
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT update settings for a group
router.put('/:group', async (req, res) => {
  try {
    const { group } = req.params;
    const updates = req.body;

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ error: 'Invalid updates format' });
    }

    let updatedCount = 0;
    for (const [key, value] of Object.entries(updates)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      });
      updatedCount++;
    }

    res.json({ success: true, updatedCount, message: `Successfully saved ${group} settings!` });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ error: 'Failed to update store settings' });
  }
});

module.exports = router;
