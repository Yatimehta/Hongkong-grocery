import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import { useCart } from '../context/CartContext';
import './Header.css';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const { cartItemCount, toggleCart } = useCart();

  const handleSearch = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setMobileMenuOpen(false);
    setSearchOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/categories', label: 'Categories' },
    { to: '/faq', label: 'FAQ' },
    { to: '/delivery', label: 'Delivery' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <header className="header" id="site-header">
      <div className="header-inner container">
        {/* Logo */}
        <Link to="/" className="header-logo" id="header-logo" onClick={() => setMobileMenuOpen(false)}>
          <div className="header-logo-icon">
            <svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
              <rect width="44" height="44" rx="10" fill="#5CB349"/>
              <ellipse cx="22" cy="23" rx="15" ry="13" fill="none" stroke="#fff" strokeWidth="1.3" opacity="0.85"/>
              <text x="22" y="28" textAnchor="middle" fontFamily="'Brush Script MT','Segoe Script',cursive" fontSize="17" fill="#fff">WS</text>
            </svg>
          </div>
          <div className="header-logo-text">
            <span className="header-brand-name">Waqas Provision Store</span>
            <span className="header-brand-sub">Hong Kong Grocery</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="header-nav" id="desktop-nav">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} className="header-nav-link">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Search */}
        <div className="header-search-desktop" id="desktop-search">
          <SearchBar onSearch={handleSearch} compact />
        </div>

        {/* Header Right Actions */}
        <div className="header-actions-right">
          {/* Cart Button */}
          <button className="header-icon-btn header-cart-btn" onClick={toggleCart} aria-label="Open cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cartItemCount > 0 && <span className="header-cart-badge">{cartItemCount}</span>}
          </button>

          {/* Mobile Controls */}
          <div className="header-mobile-controls">
          <button
            className="header-icon-btn"
            onClick={() => { setSearchOpen(!searchOpen); setMobileMenuOpen(false); }}
            aria-label="Toggle search"
            id="mobile-search-toggle"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
          <button
            className={`header-hamburger ${mobileMenuOpen ? 'open' : ''}`}
            onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setSearchOpen(false); }}
            aria-label="Toggle menu"
            id="mobile-menu-toggle"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
        </div>
      </div>

      {/* Mobile Search Dropdown */}
      {searchOpen && (
        <div className="header-mobile-search animate-fade-in">
          <div className="container">
            <SearchBar onSearch={handleSearch} autoFocus />
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="header-mobile-menu animate-fade-in">
          <nav className="header-mobile-nav">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="header-mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
