import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Users, UserPlus, Shield, Key, Trash2, Edit2, Check, X, Lock, RefreshCw, CheckSquare, Square, AlertTriangle } from 'lucide-react';

export default function StaffPermissions() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const defaultPermissions = [
    { id: 'products', label: 'Products & Inventory Catalog' },
    { id: 'orders', label: 'Order Dispatch & Fulfillment' },
    { id: 'customers', label: 'Customer Directory & Addresses' },
    { id: 'marketing', label: 'Banners, Coupons & Marketing' },
    { id: 'content', label: 'Blogs, Pages & Storefront Layout' },
    { id: 'settings', label: 'Global Site Settings & Payments' },
  ];

  const [formData, setFormData] = useState({
    id: null,
    name: '',
    email: '',
    password: '',
    role: 'catalog_manager',
    permissions: ['products', 'orders']
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/staff');
      if (!res.ok) throw new Error('Failed to fetch admin accounts');
      const data = await res.json();
      setStaffList(data);
    } catch (err) {
      toast.error(err.message || 'Error loading staff accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      id: null,
      name: '',
      email: '',
      password: '',
      role: 'catalog_manager',
      permissions: ['products', 'orders']
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    let perms = ['products', 'orders'];
    try { perms = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions; } catch (e) {}
    
    setFormData({
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      password: '', // blank unless resetting
      role: user.role || 'catalog_manager',
      permissions: perms || ['products']
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const togglePermission = (permId) => {
    const next = [...formData.permissions];
    const index = next.indexOf(permId);
    if (index === -1) next.push(permId);
    else next.splice(index, 1);
    setFormData({ ...formData, permissions: next });
  };

  const handleRoleChange = (newRole) => {
    let defaultPerms = [];
    if (newRole === 'super_admin') defaultPerms = ['all'];
    else if (newRole === 'catalog_manager') defaultPerms = ['products', 'marketing', 'content'];
    else if (newRole === 'order_picker') defaultPerms = ['orders', 'customers'];
    else if (newRole === 'content_editor') defaultPerms = ['marketing', 'content'];
    
    setFormData({ ...formData, role: newRole, permissions: defaultPerms });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return toast.error('Name and Email are required');

    try {
      const url = isEditing ? `/api/staff/${formData.id}` : '/api/staff';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Operation failed');

      toast.success(isEditing ? 'Staff privileges updated!' : 'New staff account created & assigned!');
      setShowModal(false);
      fetchStaff();
    } catch (err) {
      toast.error(err.message || 'Failed to save staff user');
    }
  };

  const handleDelete = async (id, name, role) => {
    if (role === 'super_admin') return toast.error('The primary Super Admin account cannot be removed.');
    if (!window.confirm(`Are you certain you want to revoke admin dashboard access for "${name}"?`)) return;

    try {
      const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      toast.success(`Removed admin access for ${name}`);
      fetchStaff();
    } catch (err) {
      toast.error(err.message || 'Removal failed');
    }
  };

  const getRoleBadge = (role) => {
    switch(role) {
      case 'super_admin':
        return <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid #ef4444', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Shield size={13} /> Super Admin</span>;
      case 'catalog_manager':
        return <span style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid #3b82f6', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>Catalog Manager</span>;
      case 'order_picker':
        return <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid #10b981', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>Order Picker & Dispatch</span>;
      case 'content_editor':
        return <span style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', border: '1px solid #a855f7', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>Marketing / Content</span>;
      default:
        return <span style={{ background: '#334155', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem' }}>{role}</span>;
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading Staff Accounts & Permissions...</div>;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users style={{ color: '#3b82f6' }} /> Admin Roles & Staff Access Control
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Grant dashboard access to store employees, assign specialized departmental job roles, and lock sensitive settings.
          </p>
        </div>
        <button className="admin-btn" onClick={handleOpenCreate} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#3b82f6' }}>
          <UserPlus size={18} /> Add New Admin / Staff
        </button>
      </div>

      {/* STAFF ACCOUNTS TABLE */}
      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Staff Name</th>
                <th>Email Login Address</th>
                <th>Assigned Role</th>
                <th>Active Dashboard Privileges</th>
                <th>Date Assigned</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((user) => {
                let perms = [];
                try { perms = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : (user.permissions || []); } catch(e) {}

                return (
                  <tr key={user.id}>
                    <td style={{ fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#334155', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem' }}>
                        {user.name?.charAt(0).toUpperCase() || 'S'}
                      </div>
                      {user.name}
                    </td>
                    <td style={{ color: '#cbd5e1', fontFamily: 'monospace', fontSize: '0.85rem' }}>{user.email}</td>
                    <td>{getRoleBadge(user.role)}</td>
                    <td>
                      {perms.includes('all') || user.role === 'super_admin' ? (
                        <span style={{ color: '#34d399', fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Check size={16} /> Full System Authority (All Modules)
                        </span>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {perms.map(p => (
                            <span key={p} style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'capitalize' }}>
                              {p}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="icon-btn" onClick={() => handleOpenEdit(user)} title="Edit Staff Permissions" style={{ color: '#60a5fa', marginRight: '0.5rem' }}>
                        <Edit2 size={17} />
                      </button>
                      <button 
                        className="icon-btn" 
                        onClick={() => handleDelete(user.id, user.name, user.role)} 
                        title={user.role === 'super_admin' ? "Super Admin protected" : "Revoke Access"}
                        disabled={user.role === 'super_admin'}
                        style={{ color: user.role === 'super_admin' ? '#475569' : '#ef4444', cursor: user.role === 'super_admin' ? 'not-allowed' : 'pointer' }}
                      >
                        {user.role === 'super_admin' ? <Lock size={17} /> : <Trash2 size={17} />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT STAFF MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>{isEditing ? `Edit Staff Privileges: ${formData.name}` : 'Register New Store Admin'}</h2>
              <button type="button" className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Full Employee Name *</label>
                  <input type="text" className="admin-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" required autoFocus />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Login Email Address *</label>
                  <input type="email" className="admin-input" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="john@freshmarket.com" required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Role Assignment</label>
                  <select className="admin-input" value={formData.role} onChange={e => handleRoleChange(e.target.value)}>
                    <option value="catalog_manager">Catalog & Inventory Manager</option>
                    <option value="order_picker">Order Fulfillment & Delivery Picker</option>
                    <option value="content_editor">Marketing & Content Editor</option>
                    <option value="super_admin">Super Admin (Full Authority)</option>
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Login Password {isEditing ? '(Leave blank to keep)' : '*'}</label>
                  <input type="password" className="admin-input" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder={isEditing ? '••••••••' : 'Enter login password'} required={!isEditing} />
                </div>
              </div>

              {/* PERMISSIONS SELECTOR GRID */}
              <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
                <label style={{ fontWeight: 600, color: '#f8fafc', display: 'block', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                  Module Access Control Privileges:
                </label>
                {formData.role === 'super_admin' ? (
                  <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', padding: '0.85rem', borderRadius: '8px', color: '#34d399', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Shield size={20} /> Super Admins implicitly possess full read/write permissions across all 28 modules.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {defaultPermissions.map(p => {
                      const checked = formData.permissions.includes(p.id);
                      return (
                        <div 
                          key={p.id}
                          onClick={() => togglePermission(p.id)}
                          style={{ background: '#0f172a', border: '1px solid #334155', padding: '0.6rem 0.8rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', transition: 'border 0.2s' }}
                        >
                          {checked ? <CheckSquare size={18} style={{ color: '#3b82f6', flexShrink: 0 }} /> : <Square size={18} style={{ color: '#64748b', flexShrink: 0 }} />}
                          <span style={{ fontSize: '0.82rem', color: checked ? '#f8fafc' : '#94a3b8', fontWeight: checked ? 600 : 400 }}>{p.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="admin-btn outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn" style={{ background: '#3b82f6', padding: '0.6rem 2rem' }}>
                  {isEditing ? 'Save Staff Updates' : 'Grant Admin Access'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
