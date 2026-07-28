import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, Menu, X } from 'lucide-react';

export default function Header({ onToggleSidebar, isSidebarOpen }) {
  const { user } = useAuth();

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button 
          className="admin-hamburger-btn" 
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Menu"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="admin-header-search">
          <Search size={18} />
          <input type="text" placeholder="Search across admin..." />
        </div>
      </div>

      <div className="admin-header-actions">
        <button className="icon-btn" aria-label="Notifications">
          <Bell size={20} />
        </button>
        <div className="admin-profile">
          <div className="admin-avatar">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <span className="admin-profile-name">{user?.name || 'Admin'}</span>
        </div>
      </div>
    </header>
  );
}
