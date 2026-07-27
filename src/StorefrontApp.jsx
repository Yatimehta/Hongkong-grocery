import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import MobileBottomNav from './components/MobileBottomNav';

// Pages
import HomePage from './pages/HomePage';
import CategoriesPage from './pages/CategoriesPage';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import SearchPage from './pages/SearchPage';
import ContactPage from './pages/ContactPage';

// Scroll to top component
function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

// Placeholder pages for static content
function StaticPage({ title, children }) {
  return (
    <div className="container" style={{ padding: '4rem 0', minHeight: '60vh' }}>
      <h1 style={{ marginBottom: '2rem' }}>{title}</h1>
      <div className="content" style={{ lineHeight: 1.6 }}>
        {children}
      </div>
    </div>
  );
}

function StorefrontApp() {
  return (
    <div className="app-container">
      <ScrollToTop />
      <Header />
      <CartDrawer />
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/product/:productId" element={<ProductPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/contact" element={<ContactPage />} />
          
          {/* Static Pages */}
          <Route path="/delivery" element={
            <StaticPage title="Delivery Information">
              <p>We deliver across Hong Kong.</p>
              <ul>
                <li><strong>Kowloon & Hong Kong Island:</strong> Next day delivery for orders placed before 4 PM.</li>
                <li><strong>New Territories:</strong> 2-3 business days.</li>
                <li><strong>Free Delivery:</strong> On orders above $500 HKD.</li>
                <li><strong>Standard Fee:</strong> $50 HKD for orders below $500 HKD.</li>
              </ul>
              <p>Please contact us via WhatsApp if you need urgent delivery.</p>
            </StaticPage>
          } />
          
          <Route path="/faq" element={
            <StaticPage title="Frequently Asked Questions">
              <h3>Do you have a physical store?</h3>
              <p>Yes, visit us at G/F, 65-67 South Wall Road, Kowloon City.</p>
              
              <h3>Are all items online available in store?</h3>
              <p>Most items are in stock, but inventory fluctuates. We recommend contacting us to reserve items before a long trip.</p>
              
              <h3>How can I pay?</h3>
              <p>We accept Cash, PayMe, FPS, Octopus, and major credit cards in-store. For deliveries, we accept PayMe or FPS.</p>
            </StaticPage>
          } />
          
          <Route path="*" element={
            <div className="empty-state container" style={{ padding: '6rem 0' }}>
              <h2>Page Not Found</h2>
              <p>The page you are looking for doesn't exist.</p>
              <a href="/" className="btn btn-primary" style={{marginTop: '1rem'}}>Go Home</a>
            </div>
          } />
        </Routes>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}

export default StorefrontApp;
