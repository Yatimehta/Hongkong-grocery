import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Search as SearchIcon, Menu, X } from 'lucide-react';
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
              <rect width="44" height="44" rx="12" fill="#5CB349"/>
              <ellipse cx="22" cy="23" rx="15" ry="13" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.9"/>
              <text x="22" y="28" textAnchor="middle" fontFamily="'Inter','Segoe UI',sans-serif" fontWeight="800" fontSize="15" fill="#fff">WS</text>
            </svg>
          </div>
          <div className="header-logo-text">
            <span className="header-brand-name">Waqas Provision Store</span>
            <span className="header-brand-sub">Authentic Indian & Pakistani Grocery</span>
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
            <ShoppingBag size={22} />
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
              <SearchIcon size={22} />
            </button>
            <button
              className={`header-hamburger ${mobileMenuOpen ? 'open' : ''}`}
              onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setSearchOpen(false); }}
              aria-label="Toggle menu"
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
