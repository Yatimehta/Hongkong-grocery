import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, Package, Users, 
  Settings, Megaphone, FileText, BarChart, LogOut,
  Image as ImageIcon, Database, Sliders, Truck, CreditCard, Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { logout } = useAuth();
  
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <h2>Waqas Admin</h2>
      </div>
      <nav className="admin-sidebar-nav">
        <ul>
          <li>
            <NavLink to="/admin" end>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>
          </li>
          
          <li className="nav-section">Catalog</li>
          <li>
            <NavLink to="/admin/products"><Package size={20} /> <span>Products</span></NavLink>
          </li>
          <li>
            <NavLink to="/admin/categories"><Sliders size={20} /> <span>Categories</span></NavLink>
          </li>
          <li>
            <NavLink to="/admin/inventory"><Database size={20} /> <span>Inventory</span></NavLink>
          </li>
          <li>
            <NavLink to="/admin/reviews"><FileText size={20} /> <span>Reviews</span></NavLink>
          </li>

          <li className="nav-section">Sales</li>
          <li>
            <NavLink to="/admin/orders"><ShoppingCart size={20} /> <span>Orders</span></NavLink>
          </li>
          <li>
            <NavLink to="/admin/customers"><Users size={20} /> <span>Customers</span></NavLink>
          </li>
          <li>
            <NavLink to="/admin/coupons"><Megaphone size={20} /> <span>Coupons</span></NavLink>
          </li>
          <li>
            <NavLink to="/admin/reports"><BarChart size={20} /> <span>Reports</span></NavLink>
          </li>

          <li className="nav-section">Curation & Highlights</li>
          <li>
            <NavLink to="/admin/banners"><ImageIcon size={20} /> <span>Banner Slider</span></NavLink>
          </li>
          <li>
            <NavLink to="/admin/hero-products"><Package size={20} /> <span>Hero Products</span></NavLink>
          </li>
          <li>
            <NavLink to="/admin/featured-products"><Package size={20} /> <span>Featured Products</span></NavLink>
          </li>
          <li>
            <NavLink to="/admin/best-sellers"><Package size={20} /> <span>Best Sellers</span></NavLink>
          </li>
          <li>
            <NavLink to="/admin/featured-brands"><Sliders size={20} /> <span>Featured Brands</span></NavLink>
          </li>

          <li className="nav-section">Content & Media</li>
          <li>
            <NavLink to="/admin/blogs"><FileText size={20} /> <span>Blog Posts</span></NavLink>
          </li>
          <li>
            <NavLink to="/admin/pages"><FileText size={20} /> <span>Static Pages</span></NavLink>
          </li>
          <li>
            <NavLink to="/admin/media"><ImageIcon size={20} /> <span>Media Library</span></NavLink>
          </li>
          <li>
            <NavLink to="/admin/webp"><ImageIcon size={20} /> <span>Image → WebP</span></NavLink>
          </li>

          <li className="nav-section">Data Tools</li>
          <li>
            <NavLink to="/admin/product-migration"><Database size={20} /> <span>Product Migration</span></NavLink>
          </li>
          <li>
            <NavLink to="/admin/bulk-import"><Database size={20} /> <span>Bulk Import</span></NavLink>
          </li>
          <li>
            <NavLink to="/admin/bulk-stock"><Database size={20} /> <span>Bulk Stock Update</span></NavLink>
          </li>
          <li>
            <NavLink to="/admin/backup"><Database size={20} /> <span>Backup & Restore</span></NavLink>
          </li>

          <li className="nav-section">System Settings</li>
          <li>
            <NavLink to="/admin/settings"><Settings size={20} /> <span>Site Settings</span></NavLink>
          </li>
          <li>
            <NavLink to="/admin/site-manager"><Settings size={20} /> <span>Site Manager</span></NavLink>
          </li>
          <li>
            <NavLink to="/admin/payments"><CreditCard size={20} /> <span>Payments</span></NavLink>
          </li>
          <li>
            <NavLink to="/admin/seo"><BarChart size={20} /> <span>SEO Manager</span></NavLink>
          </li>
          <li>
            <NavLink to="/admin/email"><Mail size={20} /> <span>Email Settings</span></NavLink>
          </li>
          <li>
            <NavLink to="/admin/delivery"><Truck size={20} /> <span>Delivery Settings</span></NavLink>
          </li>
        </ul>
      </nav>
      <div className="admin-sidebar-footer">
        <button className="logout-btn" onClick={logout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
