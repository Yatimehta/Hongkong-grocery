import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, FileText, Globe, Lock, ShieldAlert } from 'lucide-react';

export default function StaticPages() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    status: 'active'
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/pages');
      if (!res.ok) throw new Error('Failed to load static pages');
      const data = await res.json();
      setPages(data);
    } catch (err) {
      toast.error(err.message || 'Error fetching static pages');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (page = null) => {
    if (page) {
      setEditingPage(page);
      setFormData({
        title: page.title,
        slug: page.slug,
        content: page.content || '',
        status: page.status || 'active'
      });
    } else {
      setEditingPage(null);
      setFormData({
        title: '',
        slug: '/',
        content: '',
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.slug) return toast.error('Title and URL Slug are required');
    if (!formData.content) return toast.error('Page content cannot be blank');

    const method = editingPage ? 'PUT' : 'POST';
    const url = editingPage ? `/api/pages/${editingPage.id}` : '/api/pages';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save page');

      toast.success(editingPage ? 'Page updated successfully!' : 'Page created successfully!');
      setIsModalOpen(false);
      fetchPages();
    } catch (err) {
      toast.error(err.message || 'Failed to save page');
    }
  };

  const handleDelete = async (page) => {
    if (page.isSystem) {
      return toast.error('Core system legal & store info pages cannot be deleted. You can deactivate or edit them instead.');
    }
    if (!window.confirm(`Are you certain you want to delete the custom page "${page.title}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/pages/${page.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete page');
      toast.success('Page deleted successfully!');
      fetchPages();
    } catch (err) {
      toast.error(err.message || 'Error deleting page');
    }
  };

  const handleToggleStatus = async (page) => {
    const nextStatus = page.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/pages/${page.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (!res.ok) throw new Error();
      toast.success(`Page status updated to ${nextStatus}`);
      setPages(prev => prev.map(p => p.id === page.id ? { ...p, status: nextStatus } : p));
    } catch (err) {
      toast.error('Failed to change status');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Static & Legal Pages</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Manage content for About Us, Terms, Privacy Policy, FAQ, and Delivery Info.
          </p>
        </div>
        <button className="admin-btn" onClick={() => handleOpenModal()}>
          <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Custom Page
        </button>
      </div>

      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading pages...</div>
        ) : pages.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>No static pages found.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Page Title</th>
                  <th>URL Slug</th>
                  <th>Type</th>
                  <th>Last Updated</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={18} style={{ color: '#38bdf8' }} /> {p.title}
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', color: '#60a5fa', background: '#1e293b', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Globe size={13} /> {p.slug}
                      </span>
                    </td>
                    <td>
                      {p.isSystem ? (
                        <span style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }} title="Core Store Page (Link Slug Protected)">
                          <Lock size={13} /> System Core
                        </span>
                      ) : (
                        <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 600 }}>Custom Page</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                      {new Date(p.updatedAt).toLocaleDateString()} {new Date(p.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <span 
                        onClick={() => handleToggleStatus(p)}
                        style={{ 
                          cursor: 'pointer', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                          backgroundColor: p.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: p.status === 'active' ? '#10b981' : '#ef4444'
                        }}
                      >
                        {p.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="admin-btn outline" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem', marginRight: '0.5rem' }} onClick={() => handleOpenModal(p)}>
                        <Edit2 size={14} style={{ marginRight: '0.3rem' }} /> Edit
                      </button>
                      {!p.isSystem && (
                        <button className="icon-btn" onClick={() => handleDelete(p)} title="Delete Custom Page" style={{ color: '#ef4444' }}>
                          <Trash2 size={18} />
                        </button>
                      )}
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
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="admin-modal-header">
              <h2>{editingPage ? `Edit Page: ${editingPage.title}` : 'Add Custom Static Page'}</h2>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                {editingPage?.isSystem && (
                  <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #f59e0b', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1rem', color: '#fcd34d', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldAlert size={20} />
                    <span>This is a core system page. The URL slug cannot be modified so that footer and checkout navigation links never break.</span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Page Title *</label>
                    <input type="text" className="admin-input" placeholder="e.g. About Us" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required autoFocus />
                  </div>
                  <div className="form-group">
                    <label>URL Slug * {editingPage?.isSystem && '(Protected)'}</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      placeholder="/about" 
                      value={formData.slug} 
                      onChange={e => setFormData({ ...formData, slug: e.target.value })} 
                      required 
                      disabled={editingPage?.isSystem}
                      style={{ background: editingPage?.isSystem ? '#0f172a' : 'transparent', cursor: editingPage?.isSystem ? 'not-allowed' : 'text' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select className="admin-input" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                    <option value="active">Active (Accessible on website)</option>
                    <option value="inactive">Inactive (Hidden)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Rich Content * (Paragraphs & HTML/Markdown supported)</label>
                  <textarea 
                    className="admin-input" 
                    rows="12" 
                    placeholder="Write detailed grocery quality guarantees, store address, or return policy terms here..."
                    value={formData.content} 
                    onChange={e => setFormData({ ...formData, content: e.target.value })} 
                    required
                    style={{ fontFamily: 'sans-serif', fontSize: '0.95rem', lineHeight: '1.5' }}
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn">Save Content</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
