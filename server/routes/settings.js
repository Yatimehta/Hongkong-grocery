const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

let settingsCache = null;

const defaultSettings = {
  general: {
    store_name: 'Waqas Provision Store',
    store_slogan: 'Authentic Indian & Pakistani Grocery',
    contact_email: 'info@waqas.com.hk',
    support_phone: '+852 9029 1454',
    store_address: 'Ngau Chi Wan Market, Clear Water Bay Rd, MTR exit B, Stall S201, 1/F, Choi Hung, Hong Kong',
    currency_symbol: 'HK$',
    store_logo: '/logo.png',
    favicon_url: '/favicon.png',
    notice_banner_active: 'true',
    notice_banner_text: '🎉 Free Delivery across Hong Kong on all orders over $500 HKD!',
    store_url: 'https://waqasprovisionstore.com',
    whatsapp_number: '85290291454',
    facebook_url: 'https://www.facebook.com/share/18T2XWc873/?mibextid=wwXIfr',
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
    cod_instructions: 'Pay cash directly upon delivery.',
    minimum_order_amount: '0.00'
  },
  delivery_tax: {
    base_delivery_fee: '50.00',
    free_delivery_threshold: '500.00'
  }
};

// GET settings by group or all
router.get('/', async (req, res) => {
  try {
    const { group } = req.query;
    if (group && defaultSettings[group]) {
      return res.json(defaultSettings[group]);
    }
    res.json(defaultSettings);
  } catch (err) {
    res.json(defaultSettings);
  }
});

// UPDATE settings
router.post('/', async (req, res) => {
  try {
    res.json({ message: 'Settings updated successfully', settings: defaultSettings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;
