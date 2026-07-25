import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, Search, Upload, X, Star, Package } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '', sku: '', description: '', price: '', salePrice: '',
    stock: '', unit: 'piece', status: 'active', categoryId: '', brandId: '',
    images: [] // { url, isPrimary }
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
    fetchCategoriesAndBrands();
  }, [search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products?search=${search}&limit=all`);
      const data = await res.json();
      setProducts(data.data || data.products || []);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoriesAndBrands = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/brands')
      ]);
      setCategories(await catRes.json());
      setBrands(await brandRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        sku: product.sku,
        description: product.description || '',
        price: product.price || '',
        salePrice: product.salePrice || '',
        stock: product.stock || 0,
        unit: product.unit || 'piece',
        status: product.status || 'active',
        categoryId: product.categoryId || '',
        brandId: product.brandId || '',
        images: product.images || []
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', sku: '', description: '', price: '', salePrice: '',
        stock: '', unit: 'piece', status: 'active', categoryId: '', brandId: '',
        images: []
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error('File too large. Max 5MB.');
    }

    const data = new FormData();
    data.append('file', file);
    
    setUploading(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      
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
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.sku || !formData.price) {
      return toast.error('Name, SKU, and Price are required');
    }

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/products/${editingId}` : '/api/products';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(`Product ${editingId ? 'updated' : 'created'} successfully!`);
      handleCloseModal();
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? This cannot be undone.')) return;
    
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      toast.success('Product deleted');
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete product');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Products</h1>
        <button className="admin-btn" onClick={() => handleOpenModal()}>
          <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Product
        </button>
      </div>

      <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search products by name or SKU..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input"
              style={{ paddingLeft: '2.5rem', width: '100%' }}
            />
          </div>
        </div>
      </div>

      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3>No products found</h3>
            <p>Get started by creating your first product.</p>
            <button className="admin-btn" style={{ marginTop: '1rem' }} onClick={() => handleOpenModal()}>Add Product</button>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const primaryImg = p.images?.find(img => img.isPrimary)?.url || p.images?.[0]?.url;
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '4px', backgroundColor: '#2e364f', overflow: 'hidden' }}>
                            {primaryImg ? <img src={primaryImg} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500 }}>{p.name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{p.category?.name}</div>
                          </div>
                        </div>
                      </td>
                      <td>{p.sku}</td>
                      <td>HK${p.price.toFixed(2)}</td>
                      <td>{p.stock} {p.unit}</td>
                      <td>
                        <span style={{ 
                          padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem',
                          backgroundColor: p.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: p.status === 'active' ? '#10b981' : '#f59e0b'
                        }}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="icon-btn" onClick={() => handleOpenModal(p)} title="Edit"><Edit2 size={18} /></button>
                        <button className="icon-btn" onClick={() => handleDelete(p.id)} title="Delete" style={{ color: '#ef4444' }}><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={handleCloseModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="admin-modal-header">
              <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="icon-btn" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            <div className="admin-modal-body">
              <form id="productForm" onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input type="text" className="admin-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>SKU *</label>
                    <input type="text" className="admin-input" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} required />
                  </div>
                  
                  <div className="form-group">
                    <label>Regular Price (HK$) *</label>
                    <input type="number" step="0.01" className="admin-input" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Sale Price (HK$)</label>
                    <input type="number" step="0.01" className="admin-input" value={formData.salePrice} onChange={e => setFormData({...formData, salePrice: e.target.value})} />
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <select className="admin-input" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Brand</label>
                    <select className="admin-input" value={formData.brandId} onChange={e => setFormData({...formData, brandId: e.target.value})}>
                      <option value="">Select Brand</option>
                      {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Stock Quantity</label>
                    <input type="number" className="admin-input" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Unit (e.g. piece, kg, pack)</label>
                    <input type="text" className="admin-input" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
                  </div>
                  
                  <div className="form-group">
                    <label>Status</label>
                    <select className="admin-input" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label>Description</label>
                  <textarea className="admin-input" rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label>Images</label>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {formData.images.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '100px', height: '100px', border: img.isPrimary ? '2px solid #3b82f6' : '1px solid #2e364f', borderRadius: '8px', overflow: 'hidden' }}>
                        <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', opacity: 0, transition: '0.2s', ':hover': { opacity: 1 } }} className="img-overlay">
                          <button type="button" onClick={() => setPrimaryImage(idx)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px' }} title="Set as Primary">
                            <Star size={16} fill={img.isPrimary ? '#fbbf24' : 'none'} color={img.isPrimary ? '#fbbf24' : '#fff'} />
                          </button>
                          <button type="button" onClick={() => removeImage(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} title="Remove">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <label style={{ width: '100px', height: '100px', border: '1px dashed #475569', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8' }}>
                      {uploading ? <span>Uploading...</span> : (
                        <>
                          <Upload size={24} style={{ marginBottom: '0.5rem' }} />
                          <span style={{ fontSize: '0.75rem' }}>Upload</span>
                          <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleImageUpload} />
                        </>
                      )}
                    </label>
                  </div>
                  <small style={{ color: '#94a3b8' }}>Hover over an image to set it as primary or delete it. First image uploaded is primary by default.</small>
                </div>
              </form>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn" style={{ background: 'transparent', border: '1px solid #475569' }} onClick={handleCloseModal}>Cancel</button>
              <button className="admin-btn" type="submit" form="productForm">Save Product</button>
            </div>
          </div>
        </div>
      )}
      
      {/* CSS for overlay hover (since inline pseudo classes aren't easy without emotion/styled-components) */}
      <style dangerouslySetInnerHTML={{__html: `
        .img-overlay { opacity: 0; }
        .img-overlay:hover { opacity: 1; }
      `}} />
    </div>
  );
}
