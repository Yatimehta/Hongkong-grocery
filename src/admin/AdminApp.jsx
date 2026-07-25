import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { Toaster } from 'react-hot-toast';

// Auth Provider
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Coupons from './pages/Coupons';
import Reports from './pages/Reports';
import Banners from './pages/Banners';
import HeroProducts from './pages/HeroProducts';
import FeaturedProducts from './pages/FeaturedProducts';
import BestSellers from './pages/BestSellers';
import FeaturedBrands from './pages/FeaturedBrands';
import Blogs from './pages/Blogs';
import StaticPages from './pages/StaticPages';
import Reviews from './pages/Reviews';
import MediaLibrary from './pages/MediaLibrary';
import ImageConverter from './pages/ImageConverter';
import ProductMigration from './pages/ProductMigration';
import SiteSettings from './pages/SiteSettings';
import SiteManager from './pages/SiteManager';
import Payments from './pages/Payments';
import DeliveryTax from './pages/DeliveryTax';
import SEOSettings from './pages/SEOSettings';
import EmailSettings from './pages/EmailSettings';
import StaffPermissions from './pages/StaffPermissions';
import ActivityLogs from './pages/ActivityLogs';
import SystemHealth from './pages/SystemHealth';
import BulkImport from './pages/BulkImport';
import BulkStock from './pages/BulkStock';

import './AdminLayout.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/admin/login" />;
  }
  
  return children;
};

export default function AdminApp() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          {/* Dashboard */}
          <Route index element={<Dashboard />} />
          
          {/* Products Management */}
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="reports" element={<Reports />} />
          <Route path="banners" element={<Banners />} />
          <Route path="hero-products" element={<HeroProducts />} />
          <Route path="featured-products" element={<FeaturedProducts />} />
          <Route path="best-sellers" element={<BestSellers />} />
          <Route path="featured-brands" element={<FeaturedBrands />} />
          <Route path="blogs" element={<Blogs />} />
          <Route path="pages" element={<StaticPages />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="media-library" element={<MediaLibrary />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="image-converter" element={<ImageConverter />} />
          <Route path="webp" element={<ImageConverter />} />
          <Route path="product-migration" element={<ProductMigration />} />
          <Route path="bulk-import" element={<BulkImport />} />
          <Route path="bulk-stock" element={<BulkStock />} />
          <Route path="site-settings" element={<SiteSettings />} />
          <Route path="settings" element={<SiteSettings />} />
          <Route path="site-manager" element={<SiteManager />} />
          <Route path="payments" element={<Payments />} />
          <Route path="delivery-tax" element={<DeliveryTax />} />
          <Route path="delivery-settings" element={<DeliveryTax />} />
          <Route path="delivery" element={<DeliveryTax />} />
          <Route path="seo-settings" element={<SEOSettings />} />
          <Route path="seo-manager" element={<SEOSettings />} />
          <Route path="seo" element={<SEOSettings />} />
          
          {/* Modules 25 - 28 */}
          <Route path="email-settings" element={<EmailSettings />} />
          <Route path="email" element={<EmailSettings />} />
          <Route path="emails" element={<EmailSettings />} />
          
          <Route path="user-roles" element={<StaffPermissions />} />
          <Route path="users" element={<StaffPermissions />} />
          <Route path="staff-permissions" element={<StaffPermissions />} />
          <Route path="staff" element={<StaffPermissions />} />
          
          <Route path="activity-logs" element={<ActivityLogs />} />
          <Route path="audit-logs" element={<ActivityLogs />} />
          <Route path="logs" element={<ActivityLogs />} />
          
          <Route path="system-health" element={<SystemHealth />} />
          <Route path="system-logs" element={<SystemHealth />} />
          <Route path="backup-restore" element={<SystemHealth />} />
          <Route path="backup" element={<SystemHealth />} />
          
          {/* Add more routes for the 28 modules here as we build them */}
          
          <Route path="*" element={<div className="p-8"><h2>Not Found</h2></div>} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
