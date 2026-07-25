import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Video, Move, Eye, EyeOff } from 'lucide-react';

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    subtext: '',
    buttonText: '',
    link: '',
    mediaType: 'IMAGE',
    image: '',
    displayOrder: 1,
    active: true,
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/banners');
      if (!res.ok) throw new Error('Failed to fetch slides');
      const data = await res.json();
      setBanners(data);
    } catch (err) {
      toast.error(err.message || 'Error loading slides');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (banner = null) => {
    if (banner) {
      setEditingId(banner.id);
      setFormData({
        title: banner.title || '',
        subtext: banner.subtext || '',
        buttonText: banner.buttonText || '',
        link: banner.link || '',
        mediaType: banner.mediaType || 'IMAGE',
        image: banner.image || '',
        displayOrder: banner.displayOrder || 1,
        active: banner.active,
        startDate: banner.startDate ? new Date(banner.startDate).toISOString().slice(0, 16) : '',
        endDate: banner.endDate ? new Date(banner.endDate).toISOString().slice(0, 16) : ''
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        subtext: '',
        buttonText: '',
        link: '',
        mediaType: 'IMAGE',
        image: '',
        displayOrder: banners.length + 1,
        active: true,
        startDate: '',
        endDate: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type and size
    if (formData.mediaType === 'IMAGE' && !file.type.startsWith('image/')) {
      return toast.error('Please upload an image file for Image banner');
    }
    if (formData.mediaType === 'VIDEO' && !file.type.startsWith('video/')) {
      return toast.error('Please upload a video file for Video banner');
    }
    if (file.size > 100 * 1024 * 1024) {
      return toast.error('File size exceeds maximum allowable limit (100MB)');
    }

    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('folder', 'banners');

    try {
      setUploading(true);
      const res = await fetch('/api/upload', { method: 'POST', body: uploadData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setFormData(prev => ({ ...prev, image: data.url }));
      toast.success('Media file uploaded successfully!');
    } catch (err) {
      toast.error(err.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) {
      return toast.error('Please upload or provide a media file URL');
    }

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/banners/${editingId}` : '/api/banners';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save slide');

      toast.success(editingId ? 'Slide updated successfully!' : 'Slide added successfully!');
      setIsModalOpen(false);
      fetchBanners();
    } catch (err) {
      toast.error(err.message || 'Failed to save slide');
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      const res = await fetch(`/api/banners/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !banner.active })
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast.success(`Slide ${!banner.active ? 'activated' : 'deactivated'}`);
      setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, active: !b.active } : b));
    } catch (err) {
      toast.error(err.message || 'Error toggling slide status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you certain you want to delete this slide? This cannot be undone.')) return;

    try {
      const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete slide');
      toast.success('Slide deleted successfully!');
      fetchBanners();
    } catch (err) {
      toast.error(err.message || 'Error deleting slide');
    }
  };

  // Drag and drop ordering
  const handleDragStart = (e, index) => {
    setDraggedIdx(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;
    const newBanners = [...banners];
    const draggedItem = newBanners[draggedIdx];
    newBanners.splice(draggedIdx, 1);
    newBanners.splice(index, 0, draggedItem);
    
    // Update displayOrder numbers
    const updated = newBanners.map((item, idx) => ({ ...item, displayOrder: idx + 1 }));
    setBanners(updated);
    setDraggedIdx(index);
  };

  const handleDragEnd = async () => {
    setDraggedIdx(null);
    try {
      const payload = banners.map((b, i) => ({ id: b.id, displayOrder: i + 1 }));
      const res = await fetch('/api/banners/reorder/all', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payload })
      });
      if (!res.ok) throw new Error();
      toast.success('Slide order saved!');
    } catch (err) {
      toast.error('Failed to save slide order');
      fetchBanners(); // revert on error
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Hero Media Slider</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Supports image & video banners. Drag rows to reorder.
          </p>
        </div>
        <button className="admin-btn" onClick={() => handleOpenModal()}>
          <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Slide
        </button>
      </div>

      <div className="admin-card">
        <div style={{ paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '1px solid #334155', color: '#cbd5e1', fontSize: '0.95rem', fontWeight: 500 }}>
          {banners.length} slides | Drag to reorder &middot; Click badge to toggle active
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading banners...</div>
        ) : banners.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <ImageIcon size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>No slides found. Click "+ Add Slide" above to build your hero slider!</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>Media</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Sort</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((b, index) => (
                  <tr 
                    key={b.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    style={{ cursor: 'grab', background: draggedIdx === index ? '#1e293b' : 'transparent' }}
                  >
                    <td>
                      <Move size={18} style={{ color: '#64748b' }} />
                    </td>
                    <td>
                      {b.mediaType === 'VIDEO' ? (
                        <video src={b.image} style={{ width: '80px', height: '45px', objectFit: 'cover', borderRadius: '4px', backgroundColor: '#0f172a' }} muted />
                      ) : (
                        <img src={b.image || 'https://via.placeholder.com/80x45?text=No+Img'} alt={b.title || 'Slide'} style={{ width: '80px', height: '45px', objectFit: 'cover', borderRadius: '4px', backgroundColor: '#0f172a' }} />
                      )}
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      {b.title ? b.title : <span style={{ color: '#64748b', fontStyle: 'italic' }}>(No title)</span>}
                      {b.subtext && <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{b.subtext}</div>}
                      {b.startDate || b.endDate ? (
                        <div style={{ fontSize: '0.75rem', color: '#e2e8f0', marginTop: '0.25rem' }}>
                          📅 {b.startDate ? new Date(b.startDate).toLocaleDateString() : 'Now'} — {b.endDate ? new Date(b.endDate).toLocaleDateString() : 'Forever'}
                        </div>
                      ) : null}
                    </td>
                    <td>
                      <span style={{ 
                        padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                        backgroundColor: b.mediaType === 'VIDEO' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                        color: b.mediaType === 'VIDEO' ? '#a78bfa' : '#60a5fa'
                      }}>
                        {b.mediaType}
                      </span>
                    </td>
                    <td>{b.displayOrder}</td>
                    <td>
                      <span 
                        onClick={() => handleToggleActive(b)}
                        title="Click to toggle active state"
                        style={{ 
                          cursor: 'pointer', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600,
                          backgroundColor: b.active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: b.active ? '#10b981' : '#ef4444',
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem', userSelect: 'none'
                        }}
                      >
                        {b.active ? <><Eye size={14} /> Active</> : <><EyeOff size={14} /> Inactive</>}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="icon-btn" onClick={() => handleOpenModal(b)} title="Edit Slide"><Edit2 size={18} /></button>
                      <button className="icon-btn" onClick={() => handleDelete(b.id)} title="Delete Slide" style={{ color: '#ef4444' }}><Trash2 size={18} /></button>
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
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <div className="admin-modal-header">
              <h2>{editingId ? 'Edit Slide' : 'Add New Slide'}</h2>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="admin-modal-body">
              <form id="bannerForm" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Media Type</label>
                  <select 
                    className="admin-input" 
                    value={formData.mediaType} 
                    onChange={e => setFormData({ ...formData, mediaType: e.target.value })}
                  >
                    <option value="IMAGE">Image Slide (JPG, PNG, WEBP)</option>
                    <option value="VIDEO">Video Slide (MP4, WEBM)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{formData.mediaType === 'VIDEO' ? 'Video File or URL *' : 'Image File or URL *'}</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input 
                      type="text" 
                      className="admin-input" 
                      placeholder={formData.mediaType === 'VIDEO' ? '/uploads/video.mp4' : '/uploads/banner.jpg'}
                      value={formData.image} 
                      onChange={e => setFormData({ ...formData, image: e.target.value })}
                      style={{ flex: 1 }}
                      required 
                    />
                    <label className="admin-btn outline" style={{ cursor: 'pointer', margin: 0, padding: '0.5rem 1rem' }}>
                      {uploading ? 'Uploading...' : 'Upload File'}
                      <input type="file" onChange={handleFileUpload} accept={formData.mediaType === 'VIDEO' ? 'video/*'.trim() : 'image/*'.trim()} style={{ display: 'none' }} disabled={uploading} />
                    </label>
                  </div>
                  {formData.image && (
                    <div style={{ marginTop: '0.5rem', background: '#0f172a', padding: '0.5rem', borderRadius: '6px', textAlign: 'center' }}>
                      {formData.mediaType === 'VIDEO' ? (
                        <video src={formData.image} controls style={{ maxHeight: '160px', width: '100%', borderRadius: '4px' }} />
                      ) : (
                        <img src={formData.image} alt="Preview" style={{ maxHeight: '160px', borderRadius: '4px', objectFit: 'contain' }} />
                      )}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Title (Optional)</label>
                  <input type="text" className="admin-input" placeholder="e.g. Fresh Organic Produce" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                </div>

                <div className="form-group">
                  <label>Subtext (Optional)</label>
                  <input type="text" className="admin-input" placeholder="e.g. 20% off on first order" value={formData.subtext} onChange={e => setFormData({ ...formData, subtext: e.target.value })} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Button Text</label>
                    <input type="text" className="admin-input" placeholder="e.g. Shop Now" value={formData.buttonText} onChange={e => setFormData({ ...formData, buttonText: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Link URL</label>
                    <input type="text" className="admin-input" placeholder="e.g. /category/fruits" value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Scheduled Start Date</label>
                    <input type="datetime-local" className="admin-input" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Scheduled End Date</label>
                    <input type="datetime-local" className="admin-input" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Sort Order Number</label>
                    <input type="number" className="admin-input" value={formData.displayOrder} onChange={e => setFormData({ ...formData, displayOrder: Number(e.target.value) })} />
                  </div>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', margin: 0, gap: '0.5rem' }}>
                      <input type="checkbox" checked={formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                      <span style={{ fontWeight: 500 }}>Active & Visible</span>
                    </label>
                  </div>
                </div>
              </form>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="admin-btn" type="submit" form="bannerForm" disabled={uploading}>
                {editingId ? 'Save Changes' : 'Create Slide'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
