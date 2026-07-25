import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, ExternalLink, Eye, EyeOff } from 'lucide-react';

export default function FeaturedBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    url: '',
    displayOrder: 1,
    status: 'active'
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/brands');
      if (!res.ok) throw new Error('Failed to fetch brand partners');
      const data = await res.json();
      setBrands(data);
    } catch (err) {
      toast.error(err.message || 'Error loading brands');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (brand = null) => {
    if (brand) {
      setEditingId(brand.id);
      setFormData({
        name: brand.name,
        logo: brand.logo || '',
        url: brand.url || '',
        displayOrder: brand.displayOrder || 1,
        status: brand.status || 'active'
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        logo: '',
        url: '',
        displayOrder: brands.length + 1,
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      return toast.error('Please upload an image file (PNG, JPG, SVG or WEBP)');
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Logo size should be under 5MB');
    }

    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('folder', 'brands');

    try {
      setUploading(true);
      const res = await fetch('/api/upload', { method: 'POST', body: uploadData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setFormData(prev => ({ ...prev, logo: data.url }));
      toast.success('Brand logo uploaded!');
    } catch (err) {
      toast.error(err.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return toast.error('Brand name is required');
    if (!formData.logo) return toast.error('Brand logo image is required');

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/brands/${editingId}` : '/api/brands';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save brand');

      toast.success(editingId ? 'Brand partner updated!' : 'Brand partner added!');
      setIsModalOpen(false);
      fetchBrands();
    } catch (err) {
      toast.error(err.message || 'Failed to save brand');
    }
  };

  const handleToggleStatus = async (brand) => {
    const nextStatus = brand.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/brands/${brand.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (!res.ok) throw new Error();
      toast.success(`Brand status updated to ${nextStatus}`);
      setBrands(prev => prev.map(b => b.id === brand.id ? { ...b, status: nextStatus } : b));
    } catch (err) {
      toast.error('Failed to update brand status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this featured brand partner? This action cannot be undone.')) return;

    try {
      const res = await fetch(`/api/brands/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Brand deleted successfully!');
      fetchBrands();
    } catch (err) {
      toast.error('Failed to delete brand');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Featured Brands & Partners</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Manage the logo carousel / brand partners shown to grocery customers.
          </p>
        </div>
        <button className="admin-btn" onClick={() => handleOpenModal()}>
          <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Brand
        </button>
      </div>

      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading featured brands...</div>
        ) : brands.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <ImageIcon size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p style={{ fontSize: '1.1rem', color: '#e2e8f0', fontWeight: 500 }}>No featured brands configured yet.</p>
            <p style={{ margin: '0.5rem 0 1.5rem' }}>Add suppliers or famous grocery brand logos above to boost store trust and credibility!</p>
            <button className="admin-btn outline" onClick={() => handleOpenModal()}>
              <Plus size={16} style={{ marginRight: '0.4rem' }} /> Add First Brand
            </button>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Logo</th>
                  <th>Brand Name</th>
                  <th>Website URL</th>
                  <th>Sort Order</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {brands.map(b => (
                  <tr key={b.id}>
                    <td>
                      <div style={{ background: '#334155', padding: '0.4rem', borderRadius: '6px', width: '64px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={b.logo} alt={b.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                      </div>
                    </td>
                    <td style={{ fontWeight: 500, color: '#f8fafc' }}>{b.name}</td>
                    <td>
                      {b.url ? (
                        <a href={b.url.startsWith('http') ? b.url : `https://${b.url}`} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}>
                          {b.url} <ExternalLink size={14} />
                        </a>
                      ) : (
                        <span style={{ color: '#64748b' }}>None</span>
                      )}
                    </td>
                    <td>{b.displayOrder}</td>
                    <td>
                      <span 
                        onClick={() => handleToggleStatus(b)}
                        style={{ 
                          cursor: 'pointer', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                          backgroundColor: b.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: b.status === 'active' ? '#10b981' : '#ef4444',
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem'
                        }}
                      >
                        {b.status === 'active' ? <><Eye size={14} /> Active</> : <><EyeOff size={14} /> Inactive</>}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="icon-btn" onClick={() => handleOpenModal(b)} title="Edit Brand"><Edit2 size={18} /></button>
                      <button className="icon-btn" onClick={() => handleDelete(b.id)} title="Delete Brand" style={{ color: '#ef4444' }}><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="admin-modal-header">
              <h2>{editingId ? 'Edit Brand Partner' : 'Add Brand Partner'}</h2>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="form-group">
                  <label>Brand Name *</label>
                  <input type="text" className="admin-input" placeholder="e.g. Organic Farms Co." value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required autoFocus />
                </div>

                <div className="form-group">
                  <label>Logo Image * (Recommended PNG or SVG with transparent background)</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input type="text" className="admin-input" placeholder="/uploads/logo.png" value={formData.logo} onChange={e => setFormData({ ...formData, logo: e.target.value })} required style={{ flex: 1 }} />
                    <label className="admin-btn outline" style={{ cursor: 'pointer', margin: 0, padding: '0.5rem 1rem' }}>
                      {uploading ? '...' : 'Upload'}
                      <input type="file" onChange={handleFileUpload} accept="image/*" style={{ display: 'none' }} disabled={uploading} />
                    </label>
                  </div>
                  {formData.logo && (
                    <div style={{ background: '#334155', padding: '0.75rem', borderRadius: '6px', textAlign: 'center', maxWidth: '200px', margin: '0.5rem auto' }}>
                      <img src={formData.logo} alt="Logo preview" style={{ maxHeight: '60px', maxWidth: '100%', objectFit: 'contain' }} />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Website URL (Optional)</label>
                  <input type="text" className="admin-input" placeholder="https://www.brand-partner.com" value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Sort Order</label>
                    <input type="number" className="admin-input" value={formData.displayOrder} onChange={e => setFormData({ ...formData, displayOrder: Number(e.target.value) })} />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select className="admin-input" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                      <option value="active">Active & Visible</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn" disabled={uploading}>{editingId ? 'Save Changes' : 'Add Brand'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
