import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Tag } from 'lucide-react';

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    code: '', discountType: 'percent', discountValue: '',
    minOrderValue: '', maxDiscount: '', validFrom: '', validUntil: '',
    usageLimit: '', isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/coupons');
      const data = await res.json();
      setCoupons(data);
    } catch (err) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (coupon = null) => {
    if (coupon) {
      setEditingId(coupon.id);
      setFormData({
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderValue: coupon.minOrderValue || '',
        maxDiscount: coupon.maxDiscount || '',
        validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().slice(0, 16) : '',
        validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().slice(0, 16) : '',
        usageLimit: coupon.usageLimit || '',
        isActive: coupon.isActive
      });
    } else {
      setEditingId(null);
      setFormData({
        code: '', discountType: 'percent', discountValue: '',
        minOrderValue: '', maxDiscount: '', validFrom: '', validUntil: '',
        usageLimit: '', isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue) return toast.error('Code and discount value are required');

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/coupons/${editingId}` : '/api/coupons';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(`Coupon ${editingId ? 'updated' : 'created'}`);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Coupon deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete coupon');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Coupons & Promotions</h1>
        <button className="admin-btn" onClick={() => handleOpenModal()}>
          <Plus size={18} style={{ marginRight: '0.5rem' }} /> Create Coupon
        </button>
      </div>

      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
        ) : coupons.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <Tag size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>No coupons found.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Valid Until</th>
                  <th>Usage</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => {
                  const isExpired = c.validUntil && new Date(c.validUntil) < new Date();
                  const isExhausted = c.usageLimit && c.usedCount >= c.usageLimit;
                  const isActive = c.isActive && !isExpired && !isExhausted;
                  
                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 'bold' }}>{c.code}</td>
                      <td>
                        {c.discountType === 'percent' ? `${c.discountValue}% off` : `HK$${c.discountValue.toFixed(2)} off`}
                        {c.minOrderValue ? <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Min HK${c.minOrderValue}</div> : null}
                      </td>
                      <td style={{ color: isExpired ? '#ef4444' : 'inherit' }}>
                        {c.validUntil ? new Date(c.validUntil).toLocaleString() : 'Never expires'}
                      </td>
                      <td>
                        {c.usedCount} {c.usageLimit ? `/ ${c.usageLimit}` : 'used'}
                      </td>
                      <td>
                        <span style={{ 
                          padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem',
                          backgroundColor: isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: isActive ? '#10b981' : '#ef4444'
                        }}>
                          {isActive ? 'Active' : isExpired ? 'Expired' : isExhausted ? 'Limit Reached' : 'Disabled'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="icon-btn" onClick={() => handleOpenModal(c)}><Edit2 size={18} /></button>
                        <button className="icon-btn" onClick={() => handleDelete(c.id)} style={{ color: '#ef4444' }}><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="admin-modal-header">
              <h2>{editingId ? 'Edit Coupon' : 'Create Coupon'}</h2>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="admin-modal-body">
              <form id="couponForm" onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Coupon Code *</label>
                    <input type="text" className="admin-input" style={{ textTransform: 'uppercase' }} value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} required />
                  </div>
                  <div className="form-group" style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <label>Type *</label>
                      <select className="admin-input" value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})}>
                        <option value="percent">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (HK$)</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>Value *</label>
                      <input type="number" step="0.01" className="admin-input" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: e.target.value})} required />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Minimum Order Value (HK$)</label>
                    <input type="number" step="0.01" className="admin-input" value={formData.minOrderValue} onChange={e => setFormData({...formData, minOrderValue: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Maximum Discount (HK$) <small>(for % type)</small></label>
                    <input type="number" step="0.01" className="admin-input" value={formData.maxDiscount} onChange={e => setFormData({...formData, maxDiscount: e.target.value})} disabled={formData.discountType === 'fixed'} />
                  </div>

                  <div className="form-group">
                    <label>Valid From</label>
                    <input type="datetime-local" className="admin-input" value={formData.validFrom} onChange={e => setFormData({...formData, validFrom: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Valid Until</label>
                    <input type="datetime-local" className="admin-input" value={formData.validUntil} onChange={e => setFormData({...formData, validUntil: e.target.value})} />
                  </div>

                  <div className="form-group">
                    <label>Total Usage Limit</label>
                    <input type="number" className="admin-input" placeholder="Leave empty for unlimited" value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <div style={{ display: 'flex', alignItems: 'center', height: '40px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', margin: 0 }}>
                        <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} style={{ marginRight: '0.5rem', width: 'auto' }} />
                        Active
                      </label>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn" style={{ background: 'transparent', border: '1px solid #475569' }} onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="admin-btn" type="submit" form="couponForm">Save Coupon</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
