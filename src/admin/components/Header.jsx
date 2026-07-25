import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search } from 'lucide-react';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="admin-header">
      <div className="admin-header-search">
        <Search size={18} />
        <input type="text" placeholder="Search across admin..." />
      </div>
      <div className="admin-header-actions">
        <button className="icon-btn">
          <Bell size={20} />
        </button>
        <div className="admin-profile">
          <div className="admin-avatar">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <span>{user?.name || 'Admin'}</span>
        </div>
      </div>
    </header>
  );
}
