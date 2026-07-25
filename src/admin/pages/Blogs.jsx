import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Search, FileText, Globe, Image as ImageIcon, Check, Clock } from 'lucide-react';

export default function Blogs() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    coverImage: '',
    author: 'Admin',
    category: 'Recipes & Tips',
    status: 'PUBLISHED',
    content: '',
    seoTitle: '',
    seoDescription: ''
  });

  const categories = ['Recipes & Tips', 'Farm Updates', 'Health & Nutrition', 'Promotions', 'Community News'];

  useEffect(() => {
    fetchPosts();
  }, [filterCategory, filterStatus]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/blogs?category=${filterCategory}&status=${filterStatus}&search=${encodeURIComponent(search)}`);
      if (!res.ok) throw new Error('Failed to load blog posts');
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      toast.error(err.message || 'Error fetching articles');
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    const autoSlug = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setFormData(prev => ({
      ...prev,
      title: val,
      slug: !editingId && (!prev.slug || prev.slug === prev.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')) ? autoSlug : prev.slug,
      seoTitle: !editingId ? val : prev.seoTitle
    }));
  };

  const handleOpenModal = (post = null) => {
    if (post) {
      setEditingId(post.id);
      setFormData({
        title: post.title,
        slug: post.slug,
        coverImage: post.coverImage || '',
        author: post.author || 'Admin',
        category: post.category || 'Recipes & Tips',
        status: post.status || 'PUBLISHED',
        content: post.content || '',
        seoTitle: post.seoTitle || post.title,
        seoDescription: post.seoDescription || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        slug: '',
        coverImage: '',
        author: 'Admin',
        category: 'Recipes & Tips',
        status: 'PUBLISHED',
        content: '',
        seoTitle: '',
        seoDescription: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      return toast.error('Please upload an image file');
    }
    if (file.size > 10 * 1024 * 1024) {
      return toast.error('Cover photo must be under 10MB');
    }

    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('folder', 'blogs');

    try {
      setUploading(true);
      const res = await fetch('/api/upload', { method: 'POST', body: uploadData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setFormData(prev => ({ ...prev, coverImage: data.url }));
      toast.success('Cover image uploaded!');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.slug) return toast.error('Title and URL slug are required');
    if (!formData.content) return toast.error('Article content cannot be empty');

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/blogs/${editingId}` : '/api/blogs';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save blog post');

      toast.success(editingId ? 'Article updated successfully!' : 'Article published successfully!');
      setIsModalOpen(false);
      fetchPosts();
    } catch (err) {
      toast.error(err.message || 'Failed to save article');
    }
  };

  const handleToggleStatus = async (post) => {
    const nextStatus = post.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      const res = await fetch(`/api/blogs/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (!res.ok) throw new Error();
      toast.success(`Post marked as ${nextStatus.toLowerCase()}`);
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: nextStatus } : p));
    } catch (err) {
      toast.error('Failed to change status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to completely delete this article? This action cannot be undone.')) return;

    try {
      const res = await fetch(`/api/blogs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Article deleted successfully!');
      fetchPosts();
    } catch (err) {
      toast.error('Failed to delete article');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Blog Manager</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Manage news, recipes & farming articles to engage shoppers and enhance store SEO.
          </p>
        </div>
        <button className="admin-btn" onClick={() => handleOpenModal()}>
          <Plus size={18} style={{ marginRight: '0.5rem' }} /> Create Post
        </button>
      </div>

      <div className="admin-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              type="text" 
              className="admin-input" 
              placeholder="Search articles by title or keyword..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); }}
              onKeyDown={(e) => e.key === 'Enter' && fetchPosts()}
              style={{ paddingLeft: '2.4rem', width: '100%' }}
            />
          </div>

          <select className="admin-input" style={{ width: 'auto' }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select className="admin-input" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </select>

          <button className="admin-btn outline" onClick={fetchPosts}>Filter</button>
        </div>
      </div>

      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading blog articles...</div>
        ) : posts.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p style={{ fontSize: '1.1rem', color: '#e2e8f0', fontWeight: 500 }}>No blog articles found.</p>
            <p style={{ margin: '0.5rem 0 1.5rem' }}>Start publishing fresh grocery recipes, farmer profiles, and nutritional advice above!</p>
            <button className="admin-btn outline" onClick={() => handleOpenModal()}>
              <Plus size={16} style={{ marginRight: '0.4rem' }} /> Create First Article
            </button>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Cover Photo</th>
                  <th>Title & Slug</th>
                  <th>Category</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th>Date Published</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map(p => (
                  <tr key={p.id}>
                    <td>
                      <img src={p.coverImage || 'https://via.placeholder.com/80x50?text=Article'} alt="" style={{ width: '70px', height: '44px', objectFit: 'cover', borderRadius: '4px', backgroundColor: '#1e293b' }} />
                    </td>
                    <td style={{ fontWeight: 500, color: '#f8fafc', maxWidth: '250px' }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Globe size={12} /> /blog/{p.slug}
                      </div>
                    </td>
                    <td>
                      <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', fontSize: '0.8rem', fontWeight: 600 }}>
                        {p.category}
                      </span>
                    </td>
                    <td>{p.author}</td>
                    <td>
                      <button 
                        onClick={() => handleToggleStatus(p)}
                        style={{ 
                          cursor: 'pointer', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, border: 'none',
                          backgroundColor: p.status === 'PUBLISHED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: p.status === 'PUBLISHED' ? '#10b981' : '#f59e0b',
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem'
                        }}
                      >
                        {p.status === 'PUBLISHED' ? <><Check size={14} /> Published</> : <><Clock size={14} /> Draft</>}
                      </button>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="icon-btn" onClick={() => handleOpenModal(p)} title="Edit Article"><Edit2 size={18} /></button>
                      <button className="icon-btn" onClick={() => handleDelete(p.id)} title="Delete Article" style={{ color: '#ef4444' }}><Trash2 size={18} /></button>
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
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="admin-modal-header">
              <h2>{editingId ? 'Edit Blog Article' : 'Write New Blog Article'}</h2>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="form-group">
                  <label>Article Title *</label>
                  <input type="text" className="admin-input" placeholder="e.g. 5 Delicious Summer Green Salad Recipes" value={formData.title} onChange={handleTitleChange} required autoFocus />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>URL Slug * (auto-generated or override)</label>
                    <input type="text" className="admin-input" placeholder="5-delicious-summer-green-salads" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select className="admin-input" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Author Name</label>
                    <input type="text" className="admin-input" value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Publish Status</label>
                    <select className="admin-input" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                      <option value="PUBLISHED">Published (Visible immediately)</option>
                      <option value="DRAFT">Draft (Saved for later)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Cover Photo URL or Upload *</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input type="text" className="admin-input" placeholder="/uploads/salad.jpg" value={formData.coverImage} onChange={e => setFormData({ ...formData, coverImage: e.target.value })} style={{ flex: 1 }} />
                    <label className="admin-btn outline" style={{ cursor: 'pointer', margin: 0, padding: '0.5rem 1rem' }}>
                      {uploading ? '...' : 'Upload Image'}
                      <input type="file" onChange={handleFileUpload} accept="image/*" style={{ display: 'none' }} disabled={uploading} />
                    </label>
                  </div>
                  {formData.coverImage && (
                    <div style={{ background: '#0f172a', padding: '0.5rem', borderRadius: '6px', textAlign: 'center', maxWidth: '300px' }}>
                      <img src={formData.coverImage} alt="Cover" style={{ maxHeight: '120px', borderRadius: '4px', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Article Content * (Supports Markdown / paragraphs)</label>
                  <textarea 
                    className="admin-input" 
                    rows="8" 
                    placeholder="Write your article here... You can use headings, bullet lists, and paragraphs to structure your farm story or grocery advice."
                    value={formData.content} 
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    required 
                    style={{ fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: '1.4' }}
                  />
                </div>

                <div style={{ padding: '1rem', background: '#1e293b', borderRadius: '8px', border: '1px solid #334155', marginTop: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Globe size={16} /> Search Engine Optimization (SEO)
                  </h4>
                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: '0.8rem' }}>SEO Title Tag</label>
                    <input type="text" className="admin-input" value={formData.seoTitle} onChange={e => setFormData({ ...formData, seoTitle: e.target.value })} placeholder={formData.title || 'Page Meta Title'} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.8rem' }}>Meta Description</label>
                    <input type="text" className="admin-input" value={formData.seoDescription} onChange={e => setFormData({ ...formData, seoDescription: e.target.value })} placeholder="A compelling summary for search engine results..." />
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn" disabled={uploading}>{editingId ? 'Save Article' : 'Publish Article'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
