import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, Search, X, Move, Tag, Check, ShieldCheck, Edit3 } from 'lucide-react';

export default function HeroProducts() {
  const [heroProducts, setHeroProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [catalog, setCatalog] = useState([]);
  const [search, setSearch] = useState('');
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState(null);
  
  // For badge edit modal
  const [editingProduct, setEditingProduct] = useState(null);
  const [badgeText, setBadgeText] = useState('');

  useEffect(() => {
    fetchHeroProducts();
  }, []);

  const fetchHeroProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/curation/hero');
      if (!res.ok) throw new Error('Failed to load hero products');
      const data = await res.json();
      setHeroProducts(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalog = async (query = '') => {
    try {
      setLoadingCatalog(true);
      const res = await fetch(`/api/curation/catalog?type=hero&search=${encodeURIComponent(query)}`);
      const data = await res.json();
      setCatalog(data.products || []);
    } catch (err) {
      toast.error('Failed to search catalog');
    } finally {
      setLoadingCatalog(false);
    }
  };

  const handleOpenPicker = () => {
    setIsPickerOpen(true);
    setSearch('');
    fetchCatalog('');
  };

  const handleAddToHero = async (productId, productName) => {
    try {
      const res = await fetch(`/api/curation/hero/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isHero: true, badge: 'Hero Deal' })
      });
      if (!res.ok) throw new Error();
      toast.success(`${productName} added to Homepage Hero section!`);
      setCatalog(prev => prev.filter(p => p.id !== productId));
      fetchHeroProducts();
    } catch (err) {
      toast.error('Failed to add hero product');
    }
  };

  const handleRemoveFromHero = async (product) => {
    if (!window.confirm(`Remove "${product.name}" from Homepage Hero Products? (The product itself will remain in your catalog)`)) return;
    try {
      const res = await fetch(`/api/curation/hero/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isHero: false })
      });
      if (!res.ok) throw new Error();
      toast.success('Removed from Hero Products');
      setHeroProducts(prev => prev.filter(p => p.id !== product.id));
    } catch (err) {
      toast.error('Failed to remove hero product');
    }
  };

  const handleToggleFeatured = async (product) => {
    try {
      const res = await fetch(`/api/curation/hero/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !product.isFeatured })
      });
      if (!res.ok) throw new Error();
      toast.success(`Featured status updated for ${product.name}`);
      setHeroProducts(prev => prev.map(p => p.id === product.id ? { ...p, isFeatured: !p.isFeatured } : p));
    } catch (err) {
      toast.error('Failed to update featured status');
    }
  };

  const handleSaveBadge = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const res = await fetch(`/api/curation/hero/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badge: badgeText })
      });
      if (!res.ok) throw new Error();
      toast.success('Badge updated!');
      setEditingProduct(null);
      fetchHeroProducts();
    } catch (err) {
      toast.error('Failed to save badge');
    }
  };

  // Drag Reorder
  const handleDragStart = (e, index) => {
    setDraggedIdx(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;
    const newItems = [...heroProducts];
    const dragged = newItems[draggedIdx];
    newItems.splice(draggedIdx, 1);
    newItems.splice(index, 0, dragged);
    
    const updated = newItems.map((item, idx) => ({ ...item, heroOrder: idx + 1 }));
    setHeroProducts(updated);
    setDraggedIdx(index);
  };

  const handleDragEnd = async () => {
    setDraggedIdx(null);
    try {
      const payload = heroProducts.map((p, i) => ({ id: p.id, heroOrder: i + 1 }));
      await fetch('/api/curation/hero-reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payload })
      });
      toast.success('Hero products reordered!');
    } catch (err) {
      toast.error('Failed to save order');
      fetchHeroProducts();
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Homepage Hero Products</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Select products from your catalog to feature on the homepage. Drag rows to reorder.
          </p>
        </div>
        <button className="admin-btn" onClick={handleOpenPicker}>
          <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Hero Product
        </button>
      </div>

      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading hero products...</div>
        ) : heroProducts.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <Tag size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 500, color: '#e2e8f0' }}>No hero products yet.</p>
            <p style={{ margin: '0.5rem 0 1.5rem', color: '#94a3b8' }}>Add some above to showcase your top items directly on the storefront landing section!</p>
            <button className="admin-btn outline" onClick={handleOpenPicker}>
              <Plus size={16} style={{ marginRight: '0.4rem' }} /> Browse Catalog
            </button>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>Image</th>
                  <th>Product Name</th>
                  <th>Price</th>
                  <th>Badge</th>
                  <th>From Catalog</th>
                  <th>Featured</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {heroProducts.map((p, index) => {
                  const imgUrl = p.images?.find(i => i.isPrimary)?.url || p.images?.[0]?.url || 'https://via.placeholder.com/50';
                  return (
                    <tr 
                      key={p.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      style={{ cursor: 'grab', background: draggedIdx === index ? '#1e293b' : 'transparent' }}
                    >
                      <td><Move size={18} style={{ color: '#64748b' }} /></td>
                      <td>
                        <img src={imgUrl} alt={p.name} style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px' }} />
                      </td>
                      <td style={{ fontWeight: 500 }}>
                        <div>{p.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>SKU: {p.sku}</div>
                      </td>
                      <td>HK${p.price.toFixed(2)}</td>
                      <td>
                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '12px', background: '#3b82f620', color: '#60a5fa', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          {p.badge || 'Hero Deal'}
                          <Edit3 size={12} style={{ cursor: 'pointer' }} onClick={() => { setEditingProduct(p); setBadgeText(p.badge || 'Hero Deal'); }} />
                        </span>
                      </td>
                      <td>
                        <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
                          <ShieldCheck size={16} /> Yes ({p.category?.name || 'Catalog'})
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => handleToggleFeatured(p)}
                          className="admin-btn outline"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', borderColor: p.isFeatured ? '#10b981' : '#475569', color: p.isFeatured ? '#10b981' : '#94a3b8' }}
                        >
                          {p.isFeatured ? '✓ Yes' : 'No'}
                        </button>
                      </td>
                      <td>
                        <span style={{ 
                          padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                          backgroundColor: p.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: p.status === 'active' ? '#10b981' : '#ef4444'
                        }}>
                          {p.status === 'active' ? 'Active' : p.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="icon-btn" onClick={() => handleRemoveFromHero(p)} title="Remove from Hero section" style={{ color: '#ef4444' }}>
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Catalog Search & Select Modal */}
      {isPickerOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsPickerOpen(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="admin-modal-header">
              <h2>Select Product From Catalog</h2>
              <button className="icon-btn" onClick={() => setIsPickerOpen(false)}><X size={20} /></button>
            </div>
            <div className="admin-modal-body">
              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  placeholder="Search by product name or SKU..." 
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); fetchCatalog(e.target.value); }}
                  className="admin-input"
                  style={{ paddingLeft: '2.5rem', width: '100%' }}
                  autoFocus
                />
              </div>

              <div style={{ maxHeight: '350px', overflowY: 'auto', border: '1px solid #334155', borderRadius: '8px', background: '#0f172a' }}>
                {loadingCatalog ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Searching catalog...</div>
                ) : catalog.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    No matching unfeatured products found in catalog.
                  </div>
                ) : (
                  <table className="admin-table" style={{ margin: 0, border: 'none' }}>
                    <tbody>
                      {catalog.map(item => {
                        const img = item.images?.[0]?.url || 'https://via.placeholder.com/40';
                        return (
                          <tr key={item.id}>
                            <td style={{ width: '50px' }}>
                              <img src={img} alt="" style={{ width: '35px', height: '35px', objectFit: 'cover', borderRadius: '4px' }} />
                            </td>
                            <td style={{ fontWeight: 500 }}>
                              <div>{item.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>HK${item.price.toFixed(2)} &bull; {item.category?.name || 'Uncategorized'}</div>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button className="admin-btn outline" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }} onClick={() => handleAddToHero(item.id, item.name)}>
                                <Plus size={14} style={{ marginRight: '0.3rem' }} /> Select
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn" onClick={() => setIsPickerOpen(false)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Badge Modal */}
      {editingProduct && (
        <div className="admin-modal-overlay" onClick={() => setEditingProduct(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="admin-modal-header">
              <h2>Edit Hero Badge</h2>
              <button className="icon-btn" onClick={() => setEditingProduct(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveBadge}>
              <div className="admin-modal-body">
                <div className="form-group">
                  <label>Badge Text for "{editingProduct.name}"</label>
                  <input type="text" className="admin-input" value={badgeText} onChange={e => setBadgeText(e.target.value)} placeholder="e.g. Bestseller, 20% OFF, Seasonal" required autoFocus />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn outline" onClick={() => setEditingProduct(null)}>Cancel</button>
                <button type="submit" className="admin-btn">Save Badge</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
