import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, Package, Users, 
  Settings, Megaphone, FileText, BarChart, LogOut,
  Image as ImageIcon, Database, Sliders, Truck, CreditCard, Mail, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { logout } = useAuth();
  
  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Dark Backdrop */}
      {isOpen && <div className="admin-sidebar-backdrop" onClick={onClose} />}

      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <h2>Waqas Admin</h2>
          <button className="admin-sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
            <X size={20} />
          </button>
        </div>
        <nav className="admin-sidebar-nav">
          <ul>
            <li>
              <NavLink to="/admin" end onClick={handleLinkClick}>
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </NavLink>
            </li>
            
            <li className="nav-section">Catalog</li>
            <li>
              <NavLink to="/admin/products" onClick={handleLinkClick}><Package size={20} /> <span>Products</span></NavLink>
            </li>
            <li>
              <NavLink to="/admin/categories" onClick={handleLinkClick}><Sliders size={20} /> <span>Categories</span></NavLink>
            </li>
            <li>
              <NavLink to="/admin/inventory" onClick={handleLinkClick}><Database size={20} /> <span>Inventory</span></NavLink>
            </li>
            <li>
              <NavLink to="/admin/reviews" onClick={handleLinkClick}><FileText size={20} /> <span>Reviews</span></NavLink>
            </li>

            <li className="nav-section">Sales</li>
            <li>
              <NavLink to="/admin/orders" onClick={handleLinkClick}><ShoppingCart size={20} /> <span>Orders</span></NavLink>
            </li>
            <li>
              <NavLink to="/admin/customers" onClick={handleLinkClick}><Users size={20} /> <span>Customers</span></NavLink>
            </li>
            <li>
              <NavLink to="/admin/coupons" onClick={handleLinkClick}><Megaphone size={20} /> <span>Coupons</span></NavLink>
            </li>
            <li>
              <NavLink to="/admin/reports" onClick={handleLinkClick}><BarChart size={20} /> <span>Reports</span></NavLink>
            </li>

            <li className="nav-section">Curation & Highlights</li>
            <li>
              <NavLink to="/admin/banners" onClick={handleLinkClick}><ImageIcon size={20} /> <span>Banner Slider</span></NavLink>
            </li>
            <li>
              <NavLink to="/admin/hero-products" onClick={handleLinkClick}><Package size={20} /> <span>Hero Products</span></NavLink>
            </li>
            <li>
              <NavLink to="/admin/featured-products" onClick={handleLinkClick}><Package size={20} /> <span>Featured Products</span></NavLink>
            </li>
            <li>
              <NavLink to="/admin/best-sellers" onClick={handleLinkClick}><Package size={20} /> <span>Best Sellers</span></NavLink>
            </li>
            <li>
              <NavLink to="/admin/featured-brands" onClick={handleLinkClick}><Sliders size={20} /> <span>Featured Brands</span></NavLink>
            </li>

            <li className="nav-section">Content & Media</li>
            <li>
              <NavLink to="/admin/blogs" onClick={handleLinkClick}><FileText size={20} /> <span>Blog Posts</span></NavLink>
            </li>
            <li>
              <NavLink to="/admin/pages" onClick={handleLinkClick}><FileText size={20} /> <span>Static Pages</span></NavLink>
            </li>
            <li>
              <NavLink to="/admin/media" onClick={handleLinkClick}><ImageIcon size={20} /> <span>Media Library</span></NavLink>
            </li>
            <li>
              <NavLink to="/admin/webp" onClick={handleLinkClick}><ImageIcon size={20} /> <span>Image → WebP</span></NavLink>
            </li>

            <li className="nav-section">Data Tools</li>
            <li>
              <NavLink to="/admin/product-migration" onClick={handleLinkClick}><Database size={20} /> <span>Product Migration</span></NavLink>
            </li>
            <li>
              <NavLink to="/admin/bulk-import" onClick={handleLinkClick}><Database size={20} /> <span>Bulk Import</span></NavLink>
            </li>
            <li>
              <NavLink to="/admin/bulk-stock" onClick={handleLinkClick}><Database size={20} /> <span>Bulk Stock Update</span></NavLink>
            </li>
            <li>
              <NavLink to="/admin/backup" onClick={handleLinkClick}><Database size={20} /> <span>Backup & Restore</span></NavLink>
            </li>

            <li className="nav-section">System Settings</li>
            <li>
              <NavLink to="/admin/settings" onClick={handleLinkClick}><Settings size={20} /> <span>Site Settings</span></NavLink>
            </li>
            <li>
              <NavLink to="/admin/site-manager" onClick={handleLinkClick}><Settings size={20} /> <span>Site Manager</span></NavLink>
            </li>
            <li>
              <NavLink to="/admin/payments" onClick={handleLinkClick}><CreditCard size={20} /> <span>Payments</span></NavLink>
            </li>
            <li>
              <NavLink to="/admin/seo" onClick={handleLinkClick}><BarChart size={20} /> <span>SEO Manager</span></NavLink>
            </li>
            <li>
              <NavLink to="/admin/email" onClick={handleLinkClick}><Mail size={20} /> <span>Email Settings</span></NavLink>
            </li>
            <li>
              <NavLink to="/admin/delivery" onClick={handleLinkClick}><Truck size={20} /> <span>Delivery Settings</span></NavLink>
            </li>
          </ul>
        </nav>
        <div className="admin-sidebar-footer">
          <button className="logout-btn" onClick={() => { handleLinkClick(); logout(); }}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
