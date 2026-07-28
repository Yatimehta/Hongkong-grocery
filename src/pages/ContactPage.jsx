import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { MapPin, Phone, MessageSquare, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import FacebookIcon from '../components/icons/FacebookIcon';
import './ContactPage.css';

export default function ContactPage() {
  const { settings } = useStore();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', contactInfo: '', subject: 'General Question', message: '' });

  const storeAddress = settings?.store_address || 'G/F, 65-67 South Wall Road, Kowloon City, Hong Kong';
  const supportPhone = settings?.support_phone || '+852 9029 1454';
  const rawWhatsApp = settings?.whatsapp_number || '85290291454';
  const cleanWhatsApp = rawWhatsApp.replace(/\D/g, '');
  const displayWhatsApp = rawWhatsApp === '85290291454' ? '+852 9029 1454' : rawWhatsApp;
  const contactEmail = settings?.contact_email || 'info@waqas.com.hk';
  const facebookUrl = 'https://www.facebook.com/share/18w3391ea6/?mibextid=wwXIfr';

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="contact-page container">
      {/* Header */}
      <div className="contact-header">
        <h1 className="contact-title">Contact Us</h1>
        <p className="contact-subtitle">
          Have a question about a product, delivery, or custom order? Reach out or visit our store in Kowloon City.
        </p>
      </div>

      {/* Responsive Contact Cards */}
      <div className="contact-cards-grid">
        {/* Address & Store Card */}
        <div className="contact-card">
          <div className="contact-card-icon-box">
            <MapPin size={24} />
          </div>
          <div className="contact-card-content">
            <h3>Visit Our Store</h3>
            <p className="contact-text">{storeAddress}</p>
            <div className="hours-row">
              <Clock size={14} className="hours-icon" />
              <span>Open 7 Days a Week: 10:00 AM – 10:00 PM</span>
            </div>
            <a 
              href={`https://maps.google.com/?q=${encodeURIComponent(storeAddress)}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-outline btn-full-mobile mt-3"
            >
              Get Directions
            </a>
          </div>
        </div>

        {/* WhatsApp & Quick Order */}
        <div className="contact-card contact-card-whatsapp">
          <div className="contact-card-icon-box whatsapp-box">
            <MessageSquare size={24} />
          </div>
          <div className="contact-card-content">
            <h3>WhatsApp Support</h3>
            <p className="contact-text">Instant answers for product availability, bulk inquiries & delivery status.</p>
            <a 
              href={`https://wa.me/${cleanWhatsApp}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="contact-action-btn whatsapp-action-btn"
            >
              <MessageSquare size={18} /> Chat on WhatsApp ({displayWhatsApp})
            </a>
          </div>
        </div>

        {/* Facebook Page */}
        <div className="contact-card contact-card-facebook">
          <div className="contact-card-icon-box facebook-box">
            <FacebookIcon size={24} />
          </div>
          <div className="contact-card-content">
            <h3>Facebook Page</h3>
            <p className="contact-text">Follow us for weekly special offers, new arrivals & community updates.</p>
            <a 
              href={facebookUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="contact-action-btn facebook-action-btn"
            >
              <FacebookIcon size={18} /> Visit Facebook Page
            </a>
          </div>
        </div>

        {/* Phone Call */}
        <div className="contact-card">
          <div className="contact-card-icon-box phone-box">
            <Phone size={24} />
          </div>
          <div className="contact-card-content">
            <h3>Call Us Direct</h3>
            <p className="contact-text">Speak with our in-store customer service team.</p>
            <a 
              href={`tel:${supportPhone.replace(/\s+/g, '')}`} 
              className="contact-action-btn phone-action-btn"
            >
              <Phone size={18} /> Call {supportPhone}
            </a>
          </div>
        </div>

        {/* Email */}
        <div className="contact-card">
          <div className="contact-card-icon-box email-box">
            <Mail size={24} />
          </div>
          <div className="contact-card-content">
            <h3>Send an Email</h3>
            <p className="contact-text">For general inquiries and wholesale requests.</p>
            <a 
              href={`mailto:${contactEmail}`} 
              className="contact-action-btn email-action-btn"
            >
              <Mail size={18} /> {contactEmail}
            </a>
          </div>
        </div>
      </div>

      {/* Section Divider: Form & Map */}
      <div className="contact-main-grid">
        {/* Contact Form */}
        <div className="contact-form-wrapper">
          <h2 className="form-title">Send a Message</h2>
          <p className="form-subtitle">Fill out the form below and we'll respond within 24 hours.</p>

          {formSubmitted ? (
            <div className="form-success-box">
              <CheckCircle size={36} className="success-icon" />
              <h3>Thank You!</h3>
              <p>Your message has been received. We'll get back to you shortly.</p>
              <button 
                type="button" 
                onClick={() => setFormSubmitted(false)} 
                className="btn btn-outline btn-sm mt-3"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="contact-name">Your Name</label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="contact-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-info">Phone / Email</label>
                <input
                  id="contact-info"
                  type="text"
                  required
                  placeholder="Phone number or email address"
                  value={formData.contactInfo}
                  onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                  className="contact-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-subject">Inquiry Type</label>
                <select
                  id="contact-subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="contact-select"
                >
                  <option value="General Question">General Question</option>
                  <option value="Product Stock Availability">Product Stock Availability</option>
                  <option value="Delivery & Order Status">Delivery & Order Status</option>
                  <option value="Wholesale & Bulk Orders">Wholesale & Bulk Orders</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message"
                  rows={4}
                  required
                  placeholder="Write your question or request here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="contact-textarea"
                />
              </div>

              <button type="submit" className="btn btn-primary btn-submit-contact">
                <Send size={18} /> Send Message
              </button>
            </form>
          )}
        </div>

        {/* Responsive Map Container */}
        <div className="contact-map-wrapper">
          <h2 className="form-title">Store Location</h2>
          <p className="form-subtitle">Visit us in Kowloon City for authentic grocery shopping.</p>
          <div className="map-iframe-container">
            <iframe
              title="Waqas Provision Store Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3690.6970425317654!2d114.187313!3d22.327318!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x340400d36ef55555%3A0x1!2sSouth+Wall+Rd%2C+Kowloon+City%2C+Hong+Kong!5e0!3m2!1sen!2shk!4v1620000000000!5m2!1sen!2shk"
              width="100%"
              height="320"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
