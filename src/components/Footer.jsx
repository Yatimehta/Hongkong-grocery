import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import HoursTable from './HoursTable';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Store Info */}
          <div className="footer-section">
            <h3 className="footer-title">Waqas Provision Store</h3>
            <p className="footer-desc">
              Your trusted source for authentic Indian and Pakistani groceries in Hong Kong.
            </p>
            <div className="footer-contact">
              <p>📍 G/F, 65-67 South Wall Road, Kowloon City</p>
              <p>📞 <a href="tel:+85223832860">+852 2383 2860</a></p>
              <p>📱 <a href="https://wa.me/85263595566">WhatsApp: +852 6359 5566</a></p>
              <p>📧 <a href="mailto:info@waqas.com.hk">info@waqas.com.hk</a></p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/categories">Shop by Category</Link></li>
              <li><Link to="/delivery">Delivery Info</Link></li>
              <li><Link to="/faq">FAQs</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          {/* Hours */}
          <div className="footer-section">
            <h3 className="footer-title">Store Hours</h3>
            <div className="footer-hours">
              <HoursTable />
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} Waqas Provision Store. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
