import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save, Trash2, Upload, X, Star, Package, Tag, DollarSign, Image as ImageIcon, CheckCircle } from 'lucide-react';

export default function ProductEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    price: '',
    salePrice: '',
    stock: '',
    unit: 'piece',
    status: 'active',
    categoryId: '',
    brandId: '',
    images: [] // array of { url, isPrimary }
  });

  useEffect(() => {
    fetchAuxiliaryData();
    if (isEditing) {
      fetchProductDetails();
    }
  }, [id]);

  const fetchAuxiliaryData = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/brands')
      ]);
      const catsData = await catRes.json();
      const brandsData = await brandRes.json();
      setCategories(Array.isArray(catsData) ? catsData : []);
      setBrands(Array.isArray(brandsData) ? brandsData : []);
    } catch (err) {
      console.error('Error fetching auxiliary data:', err);
    }
  };

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products/${encodeURIComponent(id)}`);
      if (!res.ok) {
        throw new Error('Product not found');
      }
      const data = await res.json();
      setFormData({
        name: data.name || '',
        sku: data.sku || '',
        description: data.description || '',
        price: data.price !== undefined ? data.price : '',
        salePrice: data.salePrice !== undefined && data.salePrice !== null ? data.salePrice : '',
        stock: data.stock !== undefined ? data.stock : 0,
        unit: data.unit || 'piece',
        status: data.status || 'active',
        categoryId: data.categoryId || '',
        brandId: data.brandId || '',
        images: Array.isArray(data.images) ? data.images : []
      });
    } catch (err) {
      toast.error(err.message || 'Failed to load product details');
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error('File too large. Maximum size is 5MB.');
    }

    const uploadPayload = new FormData();
    uploadPayload.append('file', file);

    setUploading(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadPayload
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Image upload failed');

      const isFirst = formData.images.length === 0;
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, { url: result.url, isPrimary: isFirst }]
      }));
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const setPrimaryImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => ({ ...img, isPrimary: i === index }))
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => {
      const updated = prev.images.filter((_, i) => i !== index);
      // If we removed the primary image, set the first one as primary
      if (updated.length > 0 && !updated.some(img => img.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return { ...prev, images: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return toast.error('Product Name is required');
    }
    if (!formData.sku.trim()) {
      return toast.error('SKU is required');
    }
    if (formData.price === '' || isNaN(formData.price)) {
      return toast.error('Valid Price is required');
    }

    setSaving(true);
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/api/products/${encodeURIComponent(id)}` : '/api/products';

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      salePrice: formData.salePrice !== '' ? parseFloat(formData.salePrice) : null,
      stock: parseInt(formData.stock || '0', 10)
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save product');

      toast.success(`Product ${isEditing ? 'updated' : 'created'} successfully!`);
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.message || 'Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    try {
      const res = await fetch(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      toast.success('Product deleted successfully');
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.message || 'Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <Package size={48} className="animate-spin" style={{ margin: '0 auto 1rem', opacity: 0.7 }} />
        <p>Loading product details...</p>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Top Action Header */}
      <div className="admin-page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            type="button"
            className="admin-btn" 
            style={{ backgroundColor: '#2e364f', color: '#fff', padding: '0.5rem 0.8rem' }}
            onClick={() => navigate('/admin/products')}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.5rem', margin: 0 }}>{isEditing ? `Edit Product: ${formData.name || 'Untitled'}` : 'Create New Product'}</h1>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
              {isEditing ? `Product ID: ${id}` : 'Fill in the fields below to add a new product to inventory'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {isEditing && (
            <button 
              type="button"
              className="admin-btn" 
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
              onClick={handleDelete}
            >
              <Trash2 size={16} style={{ marginRight: '0.4rem' }} /> Delete
            </button>
          )}
          <button 
            type="button" 
            className="admin-btn"
            style={{ backgroundColor: '#4f46e5', color: '#fff' }}
            disabled={saving}
            onClick={handleSubmit}
          >
            <Save size={16} style={{ marginRight: '0.4rem' }} /> {saving ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          
          {/* Main Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Basic Info Card */}
            <div className="admin-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid #2e364f', paddingBottom: '0.75rem' }}>
                <Package size={20} style={{ color: '#6366f1' }} />
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>General Information</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                    Product Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Fresh Organic Apples 1kg"
                    className="admin-input"
                    style={{ width: '100%' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                      SKU Code <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      placeholder="e.g. APP-001-KG"
                      className="admin-input"
                      style={{ width: '100%' }}
                      required
                    />
                  </div>

                  <div>
                    <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                      Unit / Measurement
                    </label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      className="admin-input"
                      style={{ width: '100%' }}
                    >
                      <option value="piece">Piece (pc)</option>
                      <option value="kg">Kilogram (kg)</option>
                      <option value="gram">Gram (g)</option>
                      <option value="pack">Pack</option>
                      <option value="box">Box</option>
                      <option value="bottle">Bottle</option>
                      <option value="can">Can</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                    Product Description
                  </label>
                  <textarea
                    name="description"
                    rows={5}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Detailed information about the product..."
                    className="admin-input"
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Stock Card */}
            <div className="admin-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid #2e364f', paddingBottom: '0.75rem' }}>
                <DollarSign size={20} style={{ color: '#10b981' }} />
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Pricing & Inventory</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                    Regular Price (HK$) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="admin-input"
                    style={{ width: '100%' }}
                    required
                  />
                </div>

                <div>
                  <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                    Sale Price (HK$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="salePrice"
                    value={formData.salePrice}
                    onChange={handleInputChange}
                    placeholder="Optional discount price"
                    className="admin-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="admin-input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>

            {/* Product Gallery Card */}
            <div className="admin-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #2e364f', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ImageIcon size={20} style={{ color: '#f59e0b' }} />
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Product Media</h3>
                </div>
                <label className="admin-btn" style={{ backgroundColor: '#2e364f', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                  <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload Image'}
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploading} />
                </label>
              </div>

              {formData.images.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', border: '2px dashed #2e364f', borderRadius: '8px', color: '#94a3b8' }}>
                  <ImageIcon size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                  <p style={{ margin: 0 }}>No product images uploaded yet.</p>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Upload images (PNG, JPG, WebP up to 5MB)</span>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
                  {formData.images.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative', borderRadius: '6px', overflow: 'hidden', border: img.isPrimary ? '2px solid #4f46e5' : '1px solid #2e364f', backgroundColor: '#1e293b' }}>
                      <img src={img.url} alt={`Upload ${idx}`} style={{ width: '100%', height: '110px', objectFit: 'cover' }} />
                      
                      {/* Controls overlay */}
                      <div style={{ position: 'absolute', top: '4px', right: '4px', display: 'flex', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          style={{ backgroundColor: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', color: '#ef4444', padding: '4px', cursor: 'pointer' }}
                          title="Remove image"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <div style={{ padding: '0.4rem', textAlign: 'center', backgroundColor: '#0f172a' }}>
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: img.isPrimary ? '#6366f1' : '#64748b',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.25rem',
                            width: '100%'
                          }}
                        >
                          <Star size={12} fill={img.isPrimary ? '#6366f1' : 'none'} />
                          {img.isPrimary ? 'Primary' : 'Set Primary'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Sidebar Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Status Card */}
            <div className="admin-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #2e364f', paddingBottom: '0.5rem' }}>
                <CheckCircle size={18} style={{ color: '#10b981' }} />
                <h4 style={{ margin: 0 }}>Visibility & Status</h4>
              </div>

              <div>
                <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                  Publish Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="admin-input"
                  style={{ width: '100%' }}
                >
                  <option value="active">Active (Visible in Store)</option>
                  <option value="draft">Draft (Hidden)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Category & Brand Organization Card */}
            <div className="admin-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #2e364f', paddingBottom: '0.5rem' }}>
                <Tag size={18} style={{ color: '#ec4899' }} />
                <h4 style={{ margin: 0 }}>Organization</h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                    Category
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="admin-input"
                    style={{ width: '100%' }}
                  >
                    <option value="">Uncategorized</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                    Brand
                  </label>
                  <select
                    name="brandId"
                    value={formData.brandId}
                    onChange={handleInputChange}
                    className="admin-input"
                    style={{ width: '100%' }}
                  >
                    <option value="">No Brand</option>
                    {brands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

          </div>

        </div>
      </form>
    </div>
  );
}
