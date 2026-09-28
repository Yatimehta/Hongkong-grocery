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
    notice_banner_text: '🚚 Free Delivery on orders above $1,000! ($60 delivery fee for orders below $1,000)',
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
    base_delivery_fee: '60.00',
    free_delivery_threshold: '1000.00'
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

// GET settings by param group
router.get('/:group', async (req, res) => {
  try {
    const { group } = req.params;
    if (group && defaultSettings[group]) {
      return res.json(defaultSettings[group]);
    }
    res.status(404).json({ error: 'Settings group not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// UPDATE settings by param group
router.post('/:group', async (req, res) => {
  try {
    const { group } = req.params;
    if (defaultSettings[group]) {
      defaultSettings[group] = { ...defaultSettings[group], ...req.body };
    } else {
      defaultSettings[group] = req.body;
    }
    res.json({ message: 'Settings updated successfully', settings: defaultSettings[group] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

router.put('/:group', async (req, res) => {
  try {
    const { group } = req.params;
    if (defaultSettings[group]) {
      defaultSettings[group] = { ...defaultSettings[group], ...req.body };
    } else {
      defaultSettings[group] = req.body;
    }
    res.json({ message: 'Settings updated successfully', settings: defaultSettings[group] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// UPDATE settings
router.post('/', async (req, res) => {
  try {
    if (req.body && typeof req.body === 'object') {
      Object.keys(req.body).forEach(k => {
        if (defaultSettings[k]) {
          defaultSettings[k] = { ...defaultSettings[k], ...req.body[k] };
        }
      });
    }
    res.json({ message: 'Settings updated successfully', settings: defaultSettings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;
