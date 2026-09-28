import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import ProductCard from '../components/ProductCard';
import ProductGrid from '../components/ProductGrid';
import { 
  Search, Truck, ShieldCheck, MapPin, Phone, MessageSquare, 
  Sparkles, TrendingUp, ChevronRight, Award, ArrowRight, Store, CheckCircle2, Flame,
  Star, Quote
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

// Customer testimonials
const TESTIMONIALS = [
  {
    name: 'Ahmed R.',
    location: 'Kowloon City',
    initials: 'AR',
    stars: 5,
    quote: 'Best selection of authentic spices in Hong Kong. The turmeric and garam masala are top quality — just like back home. Delivery was next day!',
  },
  {
    name: 'Fatima K.',
    location: 'Tsim Sha Tsui',
    initials: 'FK',
    stars: 5,
    quote: 'I order basmati rice and lentils every week. Always fresh, always on time. The WhatsApp ordering is so convenient for busy families.',
  },
  {
    name: 'Bilal M.',
    location: 'Mong Kok',
    initials: 'BM',
    stars: 5,
    quote: 'Finally a store that stocks Pakistani snacks and frozen parathas. My kids love the selection. Great prices compared to other shops.',
  },
];

// Background color class map for scroll transitions
const ZONE_BG_MAP = {
  'zone-hero': 'bg-hero',
  'zone-categories': 'bg-categories',
  'zone-popular': 'bg-popular',
  'zone-dark-band': 'bg-trust',
  'zone-promo': 'bg-promo',
  'zone-testimonials': 'bg-testimonials',
  'zone-catalog': 'bg-catalog',
  'zone-info': 'bg-info',
};

// Reusable SVG wave divider component
function WaveDivider({ fromColor, toColor, flip = false }) {
  return (
    <div className="wave-divider" style={flip ? { transform: 'scaleY(-1)' } : undefined}>
      <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path d="M0 48H1440V0C1440 0 1200 36 960 32C720 28 480 44 240 40C120 38 0 24 0 24V48Z" fill={toColor} />
      </svg>
    </div>
  );
}

// Star rating component
function StarRating({ count = 5 }) {
  return (
    <div className="testimonial-stars">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={14} fill="#FCD34D" stroke="none" />
      ))}
    </div>
  );
}

export default function HomePage() {
  const { products, categories, loading, error, settings, getProductsByCategory, categoryIndex } = useStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const homeRef = useRef(null);

  const storeAddress = settings?.store_address || 'Ngau Chi Wan Market, Clear Water Bay Rd, MTR exit B, Stall S201, 1/F, Choi Hung, Hong Kong';
  const supportPhone = settings?.support_phone || '+852 9029 1454';
  const rawWhatsApp = settings?.whatsapp_number || '85290291454';
  const cleanWhatsApp = rawWhatsApp.replace(/\D/g, '');
  const displayWhatsApp = rawWhatsApp === '85290291454' ? '+852 9029 1454' : rawWhatsApp;

  // ─── Scroll-based background color transitions ───
  useEffect(() => {
    const homeEl = homeRef.current;
    if (!homeEl) return;

    const sections = homeEl.querySelectorAll('.scroll-section');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }

          if (entry.isIntersecting && entry.intersectionRatio > 0.25) {
            Object.values(ZONE_BG_MAP).forEach(cls => homeEl.classList.remove(cls));
            const zoneClass = Array.from(entry.target.classList).find(c => ZONE_BG_MAP[c]);
            if (zoneClass) {
              homeEl.classList.add(ZONE_BG_MAP[zoneClass]);
            }
          }
        });
      },
      {
        root: null,
        threshold: [0.1, 0.25, 0.5],
        rootMargin: '-10% 0px -10% 0px',
      }
    );

    sections.forEach(section => observer.observe(section));

    return () => {
      sections.forEach(section => observer.unobserve(section));
    };
  }, [loading]);

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

  const productsWithImages = products.filter(p => p.image && !p.image.includes('unsplash'));
  const popularProducts = (productsWithImages.length >= 8 ? productsWithImages : products).slice(0, 8);
  const featuredProducts = (productsWithImages.length >= 16 ? productsWithImages : products).slice(4, 16);

  return (
    <div className="home-page bg-hero" ref={homeRef}>
      
      {/* ════════════════════════════════════════════════════════════════
          ZONE 1: Hero — Bold Typography Moment
          ════════════════════════════════════════════════════════════════ */}
      <section className="hero-split-section zone-hero scroll-section is-visible">
        <div className="botanical-watermark hero-leaf-bg">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M42.7,-62.9C54.9,-54.1,64.2,-41.7,69.5,-27.7C74.8,-13.7,76.1,1.9,72.4,16.4C68.7,30.9,60,44.3,48.2,54.1C36.4,63.9,21.5,70.1,5.6,68.4C-10.3,66.7,-27.2,57.1,-40.4,46C-53.6,34.9,-63.1,22.3,-66.2,8.2C-69.3,-5.9,-66,-21.5,-57.4,-33.5C-48.8,-45.5,-34.9,-53.9,-20.9,-61.2C-6.9,-68.5,7.2,-74.7,21.9,-73.4C36.6,-72.1,51.8,-63.3,42.7,-62.9Z" transform="translate(100 100)" />
          </svg>
        </div>

        <div className="container hero-split-container">
          <div className="hero-text-col animate-fade-in-up">
            <span className="eyebrow-pill eyebrow-emerald">
              <Sparkles size={12} /> Fresh Today
            </span>

            <h1 className="hero-headline">
              Fresh Ingredients, <br />
              <span className="text-highlight">Delivered To Your Door.</span>
            </h1>

            <p className="hero-description">
              Order fresh produce, aromatic spices, premium basmati rice, lentils, and daily essentials with fast Hong Kong delivery.
            </p>

            <form className="hero-search-box" onSubmit={handleSearch}>
              <Search size={18} className="search-icon-svg" />
              <input
                type="text"
                placeholder="Search groceries, rice, spices..."
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

          <div className="hero-image-col animate-fade-in">
            <div className="hero-image-wrapper">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop"
                alt="Fresh Grocery Display"
                className="hero-main-photo"
              />
              <div className="hero-floating-badge sticker-badge">
                <div className="badge-inner">
                  <span className="badge-number">4000+</span>
                  <span className="badge-text">Products</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Wave: Hero → Categories ──── */}
      <WaveDivider fromColor="#FAF7F2" toColor="#F5F1EB" />

      {/* ════════════════════════════════════════════════════════════════
          ZONE 2: Shop by Category
          ════════════════════════════════════════════════════════════════ */}
      <section className="section circle-categories-section zone-categories scroll-section">
        <div className="dot-grid-pattern" />
        
        <div className="container">
          <div className="section-header center-header">
            <div>
              <span className="eyebrow-pill eyebrow-gold">
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

      {/* ──── Wave: Categories → Popular ──── */}
      <WaveDivider fromColor="#F5F1EB" toColor="#FFFFFF" />

      {/* ════════════════════════════════════════════════════════════════
          ZONE 3: Popular Products
          ════════════════════════════════════════════════════════════════ */}
      <section className="section popular-section zone-popular scroll-section">
        <div className="container">
          <div className="section-header">
            <div className="header-title-wrap">
              <div className="section-tag-row">
                <span className="eyebrow-pill eyebrow-terracotta">
                  <TrendingUp size={12} /> Best Sellers
                </span>
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

      {/* ──── Wave: Popular → Dark Trust Band ──── */}
      <WaveDivider fromColor="#FFFFFF" toColor="#142816" />

      {/* ════════════════════════════════════════════════════════════════
          ZONE 4: Trust & Guarantee — Deep Forest Green
          ════════════════════════════════════════════════════════════════ */}
      <section className="section trust-section zone-dark-band scroll-section">
        <div className="dark-band-overlay" />
        
        <div className="container">
          <div className="dark-band-header text-center">
            <span className="eyebrow-pill eyebrow-white">
              <ShieldCheck size={12} /> Trusted Since 2015
            </span>
            <h2 className="dark-band-title">Why Shop With<br />Waqas Provision Store?</h2>
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
                <p>Next-day delivery across Kowloon and Hong Kong Island on orders placed before 4 PM. Free delivery on orders above $1,000 ($60 delivery charge for orders below $1,000).</p>
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
                <h3>Visit Us at Ngau Chi Wan Market</h3>
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

      {/* ──── Wave: Dark → Promo ──── */}
      <WaveDivider fromColor="#142816" toColor="#FFF9F0" />

      {/* ════════════════════════════════════════════════════════════════
          ZONE 5: Bold DTC Promo Cards
          ════════════════════════════════════════════════════════════════ */}
      <section className="section promo-grid-section zone-promo scroll-section">
        <div className="container">
          <div className="section-header center-header">
            <div>
              <span className="eyebrow-pill eyebrow-terracotta">
                <Award size={12} /> Special Offers
              </span>
              <h2 className="section-title">What's Fresh This Week</h2>
              <p className="section-subtitle">Explore our curated deals & new arrivals</p>
            </div>
          </div>

          <div className="promo-grid-3">
            <div className="promo-banner-card banner-amber">
              <div className="banner-content">
                <span className="banner-tag">Weekly Deals</span>
                <h3>Authentic Spices & Seasonings</h3>
                <p>Cumin, Turmeric, Garam Masala & Whole Spices — sourced direct.</p>
                <Link to="/category/Spices%2FCondiments" className="promo-card-btn">
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
                <p>Long Grain Basmati, Chana, Toor & Red Kidney Beans — premium quality.</p>
                <Link to="/category/Rice" className="promo-card-btn">
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
                <p>Traditional Sweets, Frozen Parathas & Juices — fresh stock weekly.</p>
                <Link to="/category/Snacks" className="promo-card-btn">
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

      {/* ──── Wave: Promo → Testimonials ──── */}
      <WaveDivider fromColor="#FFF9F0" toColor="#2E6B34" />

      {/* ════════════════════════════════════════════════════════════════
          ZONE 5B: "What Customers Say" — Emerald background
          ════════════════════════════════════════════════════════════════ */}
      <section className="section zone-testimonials scroll-section">
        <div className="testimonials-overlay" />

        <div className="container">
          <div className="testimonials-header">
            <span className="eyebrow-pill eyebrow-white">
              <Star size={12} /> What Customers Say
            </span>
            <h2 className="testimonials-title">Loved by Hong Kong Families</h2>
            <p className="testimonials-subtitle">Real reviews from our community of home cooks</p>
          </div>

          <div className="testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <div className="testimonial-card" key={i}>
                <div className="testimonial-top">
                  <div className="testimonial-avatar">{t.initials}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-location">{t.location}</div>
                  </div>
                </div>
                <StarRating count={t.stars} />
                <p className="testimonial-quote">{t.quote}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── Wave: Testimonials → Catalog ──── */}
      <WaveDivider fromColor="#2E6B34" toColor="#F4F2ED" />

      {/* ════════════════════════════════════════════════════════════════
          ZONE 6: Featured Catalog
          ════════════════════════════════════════════════════════════════ */}
      <section className="section zone-catalog scroll-section">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="eyebrow-pill eyebrow-emerald">
                <Award size={12} /> Curated Catalog
              </span>
              <h2 className="section-title">Explore Pantry Essentials</h2>
              <p className="section-subtitle">Browse through our complete collection</p>
            </div>
          </div>
          <ProductGrid products={featuredProducts} hidePagination={true} />
        </div>
      </section>

      {/* ──── Wave: Catalog → Info ──── */}
      <WaveDivider fromColor="#F4F2ED" toColor="#FFFFFF" />

      {/* ════════════════════════════════════════════════════════════════
          ZONE 7: Contact & Support
          ════════════════════════════════════════════════════════════════ */}
      <section className="section container info-section zone-info scroll-section">
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
