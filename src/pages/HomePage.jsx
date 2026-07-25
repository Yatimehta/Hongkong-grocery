import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import CategoryCard from '../components/CategoryCard';
import ProductGrid from '../components/ProductGrid';
import './HomePage.css';

export default function HomePage() {
  const { products, categories, loading, error } = useStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

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

  // Pick top 6 categories by product count
  const featuredCategories = [...categories]
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Pick some latest or featured products (just grab first 8 with images if possible)
  const featuredProducts = products
    .filter(p => p.image)
    .slice(0, 8);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Your Favorite Groceries, Delivered in Hong Kong</h1>
          <p className="hero-subtitle">
            Authentic Indian and Pakistani spices, fresh produce, and daily essentials at your fingertips.
          </p>
          <form className="hero-search" onSubmit={handleSearch}>
            <div className="hero-search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search for spices, lentils, snacks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="hero-search-input"
              />
              <button type="submit" className="btn btn-primary hero-search-btn">Search</button>
            </div>
          </form>
          <div className="hero-features">
            <div className="hero-feature">
              <span className="feature-icon">🚚</span>
              <span>Fast Delivery</span>
            </div>
            <div className="hero-feature">
              <span className="feature-icon">✅</span>
              <span>Quality Authentic Products</span>
            </div>
            <div className="hero-feature">
              <span className="feature-icon">📍</span>
              <span>Kowloon City Store</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="section container">
        <div className="section-header">
          <h2 className="section-title">Shop by Category</h2>
          <Link to="/categories" className="btn btn-outline">View All</Link>
        </div>
        <div className="categories-grid">
          {featuredCategories.map(cat => (
            <CategoryCard key={cat.name} category={cat} />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="section bg-light">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Products</h2>
          </div>
          <ProductGrid products={featuredProducts} hidePagination={true} />
        </div>
      </section>

      {/* Info Section */}
      <section className="section container info-section">
        <div className="info-grid">
          <div className="info-card">
            <h3>Visit Our Store</h3>
            <p>G/F, 65-67 South Wall Road, Kowloon City</p>
            <p>Experience the aroma of fresh spices and browse our full selection in person.</p>
            <a href="https://maps.google.com/?q=65-67+South+Wall+Road,+Kowloon+City" target="_blank" rel="noopener noreferrer" className="btn btn-outline">Get Directions</a>
          </div>
          <div className="info-card info-card-primary">
            <h3>Need Help?</h3>
            <p>Have a question about a product or need help with a large order?</p>
            <p className="contact-whatsapp">
              <span className="whatsapp-icon">📱</span>
              <a href="https://wa.me/85263595566">+852 6359 5566</a>
            </p>
            <p className="contact-phone">
              <span className="phone-icon">📞</span>
              <a href="tel:+85223832860">+852 2383 2860</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
