import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { MapPin, Phone, MessageCircle, Mail } from 'lucide-react';
import FacebookIcon from './icons/FacebookIcon';
import './Footer.css';
import HoursTable from './HoursTable';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { settings } = useStore();

  const storeName = settings?.store_name || 'Waqas Provision Store';
  const storeAddress = settings?.store_address || 'Ngau Chi Wan Market, Clear Water Bay Rd, MTR exit B, Stall S201, 1/F, Choi Hung, Hong Kong';
  const supportPhone = settings?.support_phone || '+852 9029 1454';
  const rawWhatsApp = settings?.whatsapp_number || '85290291454';
  const cleanWhatsApp = rawWhatsApp.replace(/\D/g, '');
  const contactEmail = settings?.contact_email || 'info@waqas.com.hk';
  const facebookUrl = 'https://www.facebook.com/share/18w3391ea6/?mibextid=wwXIfr';

  const displayWhatsApp = rawWhatsApp === '85290291454' ? '+852 9029 1454' : rawWhatsApp;

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Store Info */}
          <div className="footer-section">
            <h3 className="footer-title">{storeName}</h3>
            <p className="footer-desc">
              Your trusted source for authentic Indian and Pakistani groceries in Hong Kong.
            </p>
            <div className="footer-contact">
              <p className="footer-contact-item">
                <MapPin size={18} className="footer-icon" />
                <span>{storeAddress}</span>
              </p>
              <p className="footer-contact-item">
                <Phone size={18} className="footer-icon" />
                <a href={`tel:${supportPhone.replace(/\s+/g, '')}`}>{supportPhone}</a>
              </p>
              <p className="footer-contact-item">
                <MessageCircle size={18} className="footer-icon" />
                <a href={`https://wa.me/${cleanWhatsApp}`} target="_blank" rel="noopener noreferrer">
                  WhatsApp: {displayWhatsApp}
                </a>
              </p>
              <p className="footer-contact-item">
                <FacebookIcon size={18} className="footer-icon" />
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer">
                  Facebook Page
                </a>
              </p>
              <p className="footer-contact-item">
                <Mail size={18} className="footer-icon" />
                <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
              </p>
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

          {/* Hours & Social */}
          <div className="footer-section">
            <h3 className="footer-title">Store Hours</h3>
            <div className="footer-hours">
              <HoursTable />
            </div>
            
            <div className="footer-social-wrap mt-3">
              <span className="footer-social-label">Follow Us:</span>
              <div className="footer-social-bar">
                <a 
                  href={facebookUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Facebook Page"
                  className="footer-social-icon-btn"
                >
                  <FacebookIcon size={18} />
                </a>
                <a 
                  href={`https://wa.me/${cleanWhatsApp}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="WhatsApp Support"
                  className="footer-social-icon-btn"
                >
                  <MessageCircle size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} Waqas Provision Store. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/delivery">Delivery Terms</Link>
            <Link to="/faq">Help Center</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
