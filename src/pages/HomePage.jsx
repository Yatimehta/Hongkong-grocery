import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import ProductCard from '../components/ProductCard';
import ProductGrid from '../components/ProductGrid';
import { 
  Search, Truck, ShieldCheck, MapPin, Phone, MessageSquare, 
  Sparkles, TrendingUp, ChevronRight, Award, ArrowRight, Store, CheckCircle2, Flame
} from 'lucide-react';
import FacebookIcon from '../components/icons/FacebookIcon';
import './HomePage.css';

// Curated high-res category imagery for circular icons
const CATEGORY_CIRCLES = [
  { name: 'Spices/Condiments', label: 'Spices & Masala', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=400&auto=format&fit=crop' },
  { name: 'Dal', label: 'Lentils & Dal', image: 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?q=80&w=400&auto=format&fit=crop' },
  { name: 'Rice', label: 'Basmati Rice', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=400&auto=format&fit=crop' },
  { name: 'Fresh', label: 'Fresh Produce', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=400&auto=format&fit=crop' },
  { name: 'Frozen', label: 'Frozen Foods', image: 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?q=80&w=400&auto=format&fit=crop' },
  { name: 'Beverages / Juice', label: 'Drinks & Juices', image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=400&auto=format&fit=crop' },
  { name: 'Snacks', label: 'Snacks & Sweets', image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?q=80&w=400&auto=format&fit=crop' },
  { name: 'Cooking Oil', label: 'Oils & Ghee', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=400&auto=format&fit=crop' },
];

export default function HomePage() {
  const { products, categories, loading, error, settings } = useStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const storeAddress = settings?.store_address || 'G/F, 65-67 South Wall Road, Kowloon City';
  const supportPhone = settings?.support_phone || '+852 9029 1454';
  const rawWhatsApp = settings?.whatsapp_number || '85290291454';
  const cleanWhatsApp = rawWhatsApp.replace(/\D/g, '');
  const displayWhatsApp = rawWhatsApp === '85290291454' ? '+852 9029 1454' : rawWhatsApp;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading store data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <h2>Oops! Something went wrong.</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">Try Again</button>
      </div>
    );
  }

  // Filter products with valid images
  const productsWithImages = products.filter(p => p.image && !p.image.includes('unsplash'));
  
  // Popular products (first 8 with real images)
  const popularProducts = (productsWithImages.length >= 8 ? productsWithImages : products).slice(0, 8);

  // Featured grid selection
  const featuredProducts = (productsWithImages.length >= 16 ? productsWithImages : products).slice(4, 16);

  return (
    <div className="home-page">
      
      {/* ZONE 1: Hero Section (Light Off-White Background + Split Layout) */}
      <section className="hero-split-section zone-hero">
        {/* Botanical Watermark Background Illustration */}
        <div className="botanical-watermark hero-leaf-bg">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M42.7,-62.9C54.9,-54.1,64.2,-41.7,69.5,-27.7C74.8,-13.7,76.1,1.9,72.4,16.4C68.7,30.9,60,44.3,48.2,54.1C36.4,63.9,21.5,70.1,5.6,68.4C-10.3,66.7,-27.2,57.1,-40.4,46C-53.6,34.9,-63.1,22.3,-66.2,8.2C-69.3,-5.9,-66,-21.5,-57.4,-33.5C-48.8,-45.5,-34.9,-53.9,-20.9,-61.2C-6.9,-68.5,7.2,-74.7,21.9,-73.4C36.6,-72.1,51.8,-63.3,42.7,-62.9Z" transform="translate(100 100)" />
          </svg>
        </div>

        <div className="container hero-split-container">
          {/* Left Column: Headline, Search & CTAs */}
          <div className="hero-text-col animate-fade-in-up">
            <div className="hero-top-chip">
              <Sparkles size={14} className="chip-icon" />
              <span>Authentic Indian & Pakistani Grocery</span>
            </div>

            <h1 className="hero-headline">
              Fresh Ingredients, <br />
              <span className="text-highlight">Delivered To Your Door.</span>
            </h1>

            <p className="hero-description">
              Order fresh produce, aromatic spices, premium basmati rice, lentils, and daily essentials with fast Hong Kong delivery.
            </p>

            <form className="hero-search-box" onSubmit={handleSearch}>
              <Search size={20} className="search-icon-svg" />
              <input
                type="text"
                placeholder="Search for basmati, dal, spices, snacks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="hero-search-input"
              />
              <button type="submit" className="btn btn-primary search-btn">
                Search
              </button>
            </form>

            <div className="hero-meta-features">
              <div className="meta-item">
                <Truck size={16} className="meta-icon" />
                <span>Next-Day Delivery</span>
              </div>
              <div className="meta-item">
                <ShieldCheck size={16} className="meta-icon" />
                <span>100% Quality Guaranteed</span>
              </div>
              <div className="meta-item">
                <Store size={16} className="meta-icon" />
                <span>Kowloon Store Pickup</span>
              </div>
            </div>
          </div>

          {/* Right Column: Large Lifestyle Image + Floating Sticker Badge */}
          <div className="hero-image-col animate-fade-in">
            <div className="hero-image-wrapper">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop"
                alt="Fresh Grocery Display"
                className="hero-main-photo"
              />
              {/* Circular Sticker Badge 1 */}
              <div className="hero-floating-badge sticker-badge">
                <div className="badge-inner">
                  <span className="badge-number">100%</span>
                  <span className="badge-text">Fresh Daily</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SVG Transition Divider: Hero -> Category Zone */}
      <div className="section-divider wave-divider-down">
        <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 48H1440V0C1440 0 1080 36 720 36C360 36 0 0 0 0V48Z" fill="#F0F8EE" />
        </svg>
      </div>

      {/* ZONE 2: Circular Category Navigation Row (Pale Green Tint Background + Dot Grid) */}
      <section className="section circle-categories-section zone-categories">
        <div className="dot-grid-pattern" />
        
        <div className="container">
          <div className="section-header center-header">
            <div>
              <span className="badge badge-accent mb-1">
                <Sparkles size={12} /> Explore Departments
              </span>
              <h2 className="section-title">Shop by Category</h2>
              <p className="section-subtitle">Browse by your favorite authentic grocery sections</p>
            </div>
          </div>

          <div className="circle-categories-row">
            {CATEGORY_CIRCLES.filter(cat => getProductsByCategory(cat.name).length > 0).map((cat) => (
              <Link
                key={cat.name}
                to={`/category/${encodeURIComponent(cat.name)}`}
                className="circle-category-item"
              >
                <div className="circle-image-wrap">
                  <img src={cat.image} alt={cat.label} className="circle-category-img" />
                </div>
                <span className="circle-category-name">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SVG Transition Divider: Category Zone -> Popular Products Zone */}
      <div className="section-divider slope-divider">
        <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 0L1440 48H0V0Z" fill="#FFFFFF" />
        </svg>
      </div>

      {/* ZONE 3: Popular Products / Best Sellers Section (Clean Crisp White Background) */}
      <section className="section popular-section zone-popular">
        <div className="container">
          <div className="section-header">
            <div className="header-title-wrap">
              <div className="section-tag-row">
                <span className="badge badge-accent">
                  <TrendingUp size={12} /> Best Sellers
                </span>
                {/* Sticker Badge 2 */}
                <span className="sticker-chip">
                  <Flame size={12} className="flame-icon" /> Hot Deals
                </span>
              </div>
              <h2 className="section-title">Popular Items</h2>
              <p className="section-subtitle">Customer favorites with direct fast delivery</p>
            </div>
            <Link to="/categories" className="btn btn-outline view-all-btn">
              <span>View All</span>
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="products-grid-4">
            {popularProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* SVG Transition Divider: Popular Zone -> Dark Green Band Zone */}
      <div className="section-divider wave-into-dark">
        <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 56H1440V12C1200 40 840 56 480 32C240 16 0 40 0 40V56Z" fill="#13300F" />
        </svg>
      </div>

      {/* ZONE 4: Dark Green Full-Width Band (Trust & Delivery Guarantee Section) */}
      <section className="section trust-section zone-dark-band">
        <div className="dark-band-overlay" />
        
        <div className="container">
          <div className="dark-band-header text-center">
            <span className="badge badge-gold mb-2">
              <ShieldCheck size={14} /> Service Guarantee
            </span>
            <h2 className="dark-band-title">Why Shop With Waqas Provision Store?</h2>
            <p className="dark-band-subtitle">Bringing authentic flavors & trusted grocery delivery across Hong Kong</p>
          </div>

          <div className="trust-grid">
            <div className="trust-card trust-card-dark">
              <div className="trust-icon-box dark-icon-box">
                <Truck size={28} />
              </div>
              <div className="trust-body">
                <span className="trust-badge dark-badge">Hong Kong Shipping</span>
                <h3>Fast & Reliable Delivery</h3>
                <p>Next-day delivery across Kowloon and Hong Kong Island on orders placed before 4 PM. Free delivery on orders over $500 HKD.</p>
                <div className="trust-checklist dark-checklist">
                  <div className="check-item"><CheckCircle2 size={16} /> <span>Temperature Controlled Handling</span></div>
                  <div className="check-item"><CheckCircle2 size={16} /> <span>Real-Time WhatsApp Dispatch Alerts</span></div>
                </div>
              </div>
            </div>

            <div className="trust-card trust-card-dark">
              <div className="trust-icon-box dark-icon-box gold-icon-box">
                <Store size={28} />
              </div>
              <div className="trust-body">
                <span className="trust-badge gold-badge">Store Visit & Pickup</span>
                <h3>Visit Us in Kowloon City</h3>
                <p>Prefer to pick up or shop in person? Experience the rich aromas and friendly service at our retail location.</p>
                <div className="trust-checklist dark-checklist">
                  <div className="check-item"><CheckCircle2 size={16} /> <span>Open 7 Days a Week (10 AM - 10 PM)</span></div>
                  <div className="check-item"><CheckCircle2 size={16} /> <span>Full In-Store Catalog & Fresh Stocks</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SVG Transition Divider: Dark Green Band -> Warm Promo Zone */}
      <div className="section-divider wave-out-of-dark">
        <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 0H1440V44C1080 16 720 56 360 28C180 14 0 32 0 32V0Z" fill="#13300F" />
        </svg>
      </div>

      {/* ZONE 5: 3-Column Promo Banner Grid (Warm Cream Tint Background) */}
      <section className="section promo-grid-section zone-promo">
        <div className="container">
          <div className="promo-grid-3">
            <div className="promo-banner-card banner-amber">
              <div className="banner-content">
                <span className="banner-tag">Weekly Deals</span>
                <h3>Authentic Spices & Seasonings</h3>
                <p>Cumin, Turmeric, Garam Masala & Whole Spices</p>
                <Link to="/category/Spices%2FCondiments" className="btn btn-white btn-sm mt-3">
                  Shop Spices <ArrowRight size={14} />
                </Link>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=400&auto=format&fit=crop" 
                alt="Spices" 
                className="banner-bg-img" 
              />
            </div>

            <div className="promo-banner-card banner-green">
              <div className="banner-content">
                <span className="banner-tag">Top Grade</span>
                <h3>Basmati Rice & Pulses</h3>
                <p>Long Grain Basmati, Chana, Toor & Red Kidney Beans</p>
                <Link to="/category/Rice" className="btn btn-white btn-sm mt-3">
                  Shop Grains <ArrowRight size={14} />
                </Link>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=400&auto=format&fit=crop" 
                alt="Rice & Pulses" 
                className="banner-bg-img" 
              />
            </div>

            <div className="promo-banner-card banner-terracotta">
              <div className="banner-content">
                <span className="banner-tag">New Arrivals</span>
                <h3>Snacks & Drinks</h3>
                <p>Traditional Sweets, Frozen Parathas & Juices</p>
                <Link to="/category/Snacks" className="btn btn-white btn-sm mt-3">
                  Shop Snacks <ArrowRight size={14} />
                </Link>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1621939514649-280e2ee25f60?q=80&w=400&auto=format&fit=crop" 
                alt="Snacks & Sweets" 
                className="banner-bg-img" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* ZONE 6: Featured Catalog Product Grid (Soft Slate-Green Tint) */}
      <section className="section zone-catalog">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="badge badge-accent mb-1">
                <Award size={12} /> Curated Catalog
              </span>
              <h2 className="section-title">Explore Pantry Essentials</h2>
              <p className="section-subtitle">Browse through our complete collection</p>
            </div>
          </div>
          <ProductGrid products={featuredProducts} hidePagination={true} />
        </div>
      </section>

      {/* ZONE 7: Contact & Support Info (Pure White Container with Elevated Cards) */}
      <section className="section container info-section zone-info">
        <div className="info-grid-modern">
          <div className="info-card-modern">
            <div className="info-icon-badge">
              <MapPin size={24} />
            </div>
            <h3>Visit Our Kowloon Store</h3>
            <p className="info-address">{storeAddress}</p>
            <p className="info-desc">Browse our full selection in person and get expert cooking recommendations.</p>
            <a 
              href={`https://maps.google.com/?q=${encodeURIComponent(storeAddress)}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-outline mt-auto"
            >
              <span>Get Directions</span>
              <ArrowRight size={14} />
            </a>
          </div>

          <div className="info-card-modern info-card-highlight">
            <div className="info-icon-badge highlight-badge">
              <MessageSquare size={24} />
            </div>
            <h3>Quick Support & Orders</h3>
            <p className="info-desc">Questions about an item or need assistance with your order?</p>
            
            <div className="contact-links-list">
              <div className="contact-link-item">
                <div className="contact-icon-bubble whatsapp-bubble">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <span className="contact-label">WhatsApp Us</span>
                  <a href={`https://wa.me/${cleanWhatsApp}`} target="_blank" rel="noopener noreferrer">
                    {displayWhatsApp}
                  </a>
                </div>
              </div>

              <div className="contact-link-item">
                <div className="contact-icon-bubble phone-bubble">
                  <Phone size={18} />
                </div>
                <div>
                  <span className="contact-label">Call Support</span>
                  <a href={`tel:${supportPhone.replace(/\s+/g, '')}`}>
                    {supportPhone}
                  </a>
                </div>
              </div>

              <div className="contact-link-item">
                <div className="contact-icon-bubble facebook-bubble">
                  <FacebookIcon size={18} />
                </div>
                <div>
                  <span className="contact-label">Facebook Page</span>
                  <a href="https://www.facebook.com/share/18w3391ea6/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">
                    Follow Us on Facebook
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
