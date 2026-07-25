import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', slug: '', description: '', image: '', parentId: '', displayOrder: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingId(category.id);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        image: category.image || '',
        parentId: category.parentId || '',
        displayOrder: category.displayOrder || 0
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', slug: '', description: '', image: '', parentId: '', displayOrder: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) return toast.error('Name and Slug are required');

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/categories/${editingId}` : '/api/categories';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(`Category ${editingId ? 'updated' : 'created'}`);
      handleCloseModal();
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      toast.success('Category deleted');
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Categories</h1>
        <button className="admin-btn" onClick={() => handleOpenModal()}>
          <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Category
        </button>
      </div>

      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
        ) : categories.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <p>No categories found.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Slug</th>
                  <th>Parent</th>
                  <th>Products</th>
                  <th>Order</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '4px', backgroundColor: '#2e364f', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {c.image ? <img src={c.image} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={16} color="#94a3b8" />}
                        </div>
                        <span style={{ fontWeight: 500 }}>{c.name}</span>
                      </div>
                    </td>
                    <td>{c.slug}</td>
                    <td>{c.parent ? c.parent.name : '-'}</td>
                    <td>{c._count.products}</td>
                    <td>{c.displayOrder}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="icon-btn" onClick={() => handleOpenModal(c)}><Edit2 size={18} /></button>
                      <button className="icon-btn" onClick={() => handleDelete(c.id)} style={{ color: '#ef4444' }}><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={handleCloseModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="admin-modal-header">
              <h2>{editingId ? 'Edit Category' : 'Add Category'}</h2>
              <button className="icon-btn" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            <div className="admin-modal-body">
              <form id="catForm" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Name *</label>
                  <input type="text" className="admin-input" value={formData.name} onChange={e => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                    setFormData({...formData, name, slug: editingId ? formData.slug : slug});
                  }} required />
                </div>
                <div className="form-group">
                  <label>Slug *</label>
                  <input type="text" className="admin-input" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Parent Category</label>
                  <select className="admin-input" value={formData.parentId} onChange={e => setFormData({...formData, parentId: e.target.value})}>
                    <option value="">None (Top Level)</option>
                    {categories.filter(c => c.id !== editingId).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Display Order</label>
                  <input type="number" className="admin-input" value={formData.displayOrder} onChange={e => setFormData({...formData, displayOrder: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea className="admin-input" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                </div>
              </form>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn" style={{ background: 'transparent', border: '1px solid #475569' }} onClick={handleCloseModal}>Cancel</button>
              <button className="admin-btn" type="submit" form="catForm">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
