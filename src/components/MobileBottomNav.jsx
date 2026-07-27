import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Search, PhoneCall, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './MobileBottomNav.css';

export default function MobileBottomNav() {
  const { pathname } = useLocation();
  const { cartItemCount, toggleCart } = useCart();

  const isHomeActive = pathname === '/';
  const isCategoriesActive = pathname === '/categories' || pathname.startsWith('/category/');
  const isSearchActive = pathname === '/search';
  const isContactActive = pathname === '/contact';

  return (
    <nav className="mobile-bottom-nav" id="mobile-bottom-nav">
      <Link to="/" className={`mobile-nav-item ${isHomeActive ? 'active' : ''}`} aria-label="Home">
        <Home size={20} className="mobile-nav-icon" />
        <span className="mobile-nav-label">Home</span>
      </Link>

      <Link to="/categories" className={`mobile-nav-item ${isCategoriesActive ? 'active' : ''}`} aria-label="Categories">
        <LayoutGrid size={20} className="mobile-nav-icon" />
        <span className="mobile-nav-label">Categories</span>
      </Link>

      <Link to="/search" className={`mobile-nav-item ${isSearchActive ? 'active' : ''}`} aria-label="Search">
        <Search size={20} className="mobile-nav-icon" />
        <span className="mobile-nav-label">Search</span>
      </Link>

      <Link to="/contact" className={`mobile-nav-item ${isContactActive ? 'active' : ''}`} aria-label="Contact">
        <PhoneCall size={20} className="mobile-nav-icon" />
        <span className="mobile-nav-label">Contact</span>
      </Link>

      <button type="button" onClick={toggleCart} className="mobile-nav-item mobile-nav-cart-btn" aria-label="Cart">
        <div className="mobile-nav-cart-icon-wrap">
          <ShoppingBag size={20} className="mobile-nav-icon" />
          {cartItemCount > 0 && (
            <span className="mobile-nav-badge">{cartItemCount > 99 ? '99+' : cartItemCount}</span>
          )}
        </div>
        <span className="mobile-nav-label">Cart</span>
      </button>
    </nav>
  );
}
