import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Search, Edit2, Trash2, Shield, ShieldOff, Eye, X } from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // For Edit/Add
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/customers?search=${search}`);
      const data = await res.json();
      setCustomers(data.data || []);
    } catch (err) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = async (id) => {
    try {
      const res = await fetch(`/api/customers/${id}`);
      const data = await res.json();
      setSelectedCustomer(data);
      setIsModalOpen(true);
    } catch (err) {
      toast.error('Failed to fetch customer details');
    }
  };

  const handleToggleBlock = async (id, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'block' : 'unblock'} this customer?`)) return;
    
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (!res.ok) throw new Error();
      toast.success(`Customer ${currentStatus ? 'blocked' : 'unblocked'}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer? This will also delete their addresses but NOT their orders.')) return;
    
    try {
      const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Customer deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete customer');
    }
  };

  const handleOpenEdit = (customer = null) => {
    if (customer) {
      setEditingId(customer.id);
      setFormData({ name: customer.name, email: customer.email, phone: customer.phone || '' });
    } else {
      setEditingId(null);
      setFormData({ name: '', email: '', phone: '' });
    }
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/customers/${editingId}` : '/api/customers';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(`Customer ${editingId ? 'updated' : 'added'}`);
      setIsEditModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Error saving customer');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Customers</h1>
        <button className="admin-btn" onClick={() => handleOpenEdit()}>Add Customer</button>
      </div>

      <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search by name, email, or phone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input"
            style={{ paddingLeft: '2.5rem', width: '100%' }}
          />
        </div>
      </div>

      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
        ) : customers.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <p>No customers found.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Joined</th>
                  <th>Orders</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500, color: c.isActive ? 'inherit' : '#94a3b8' }}>{c.name}</td>
                    <td style={{ color: c.isActive ? 'inherit' : '#94a3b8' }}>
                      <div>{c.email}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{c.phone}</div>
                    </td>
                    <td style={{ color: c.isActive ? 'inherit' : '#94a3b8' }}>{new Date(c.joinDate).toLocaleDateString()}</td>
                    <td>{c._count.orders}</td>
                    <td>
                      {c.isActive ? (
                        <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>Active</span>
                      ) : (
                        <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>Blocked</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="icon-btn" onClick={() => handleOpenDetails(c.id)} title="View Details"><Eye size={18} /></button>
                      <button className="icon-btn" onClick={() => handleOpenEdit(c)} title="Edit"><Edit2 size={18} /></button>
                      <button className="icon-btn" onClick={() => handleToggleBlock(c.id, c.isActive)} title={c.isActive ? 'Block Customer' : 'Unblock Customer'} style={{ color: c.isActive ? '#f59e0b' : '#10b981' }}>
                        {c.isActive ? <ShieldOff size={18} /> : <Shield size={18} />}
                      </button>
                      <button className="icon-btn" onClick={() => handleDelete(c.id)} title="Delete"><Trash2 size={18} style={{ color: '#ef4444' }} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {isModalOpen && selectedCustomer && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="admin-modal-header">
              <h2>{selectedCustomer.name}'s Profile</h2>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="admin-modal-body">
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Contact Info</h3>
                  <p><strong>Email:</strong> {selectedCustomer.email}</p>
                  <p><strong>Phone:</strong> {selectedCustomer.phone || 'N/A'}</p>
                  <p><strong>Joined:</strong> {new Date(selectedCustomer.joinDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Status</h3>
                  <p>
                    {selectedCustomer.isActive ? 
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>Active User</span> : 
                      <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Blocked User</span>
                    }
                  </p>
                </div>
              </div>

              <h3 style={{ fontSize: '1rem', marginBottom: '1rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>Recent Orders</h3>
              {selectedCustomer.orders.length > 0 ? (
                <table className="admin-table" style={{ fontSize: '0.9rem' }}>
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCustomer.orders.map(o => (
                      <tr key={o.id}>
                        <td>{o.orderNumber}</td>
                        <td>{new Date(o.date).toLocaleDateString()}</td>
                        <td style={{ textTransform: 'capitalize' }}>{o.orderStatus}</td>
                        <td>HK${o.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: '#94a3b8' }}>No orders placed yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add Modal */}
      {isEditModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="admin-modal-header">
              <h2>{editingId ? 'Edit Customer' : 'Add Customer'}</h2>
              <button className="icon-btn" onClick={() => setIsEditModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="admin-modal-body">
              <form id="customerForm" onSubmit={handleSaveEdit}>
                <div className="form-group">
                  <label>Name *</label>
                  <input type="text" className="admin-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" className="admin-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="text" className="admin-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </form>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn" style={{ background: 'transparent', border: '1px solid #475569' }} onClick={() => setIsEditModalOpen(false)}>Cancel</button>
              <button className="admin-btn" type="submit" form="customerForm">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
