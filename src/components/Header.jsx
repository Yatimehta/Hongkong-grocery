import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Search as SearchIcon, Menu, X } from 'lucide-react';
import logoImg from '../assets/logo.png';
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
            <img src={logoImg} alt="Waqas Provision Store Logo" className="header-logo-img" />
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
