import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, Search, Package, ShieldCheck, Trash } from 'lucide-react';

export default function FeaturedProducts() {
  const [featured, setFeatured] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [totalCatalogCount, setTotalCatalogCount] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (searchQuery = '') => {
    try {
      setLoading(true);
      const [resFeatured, resAll] = await Promise.all([
        fetch('/api/curation/featured'),
        fetch(`/api/curation/catalog?type=featured&search=${encodeURIComponent(searchQuery)}`)
      ]);
      
      if (!resFeatured.ok || !resAll.ok) throw new Error('Failed to fetch product curation data');
      
      const featuredData = await resFeatured.json();
      const allData = await resAll.json();

      setFeatured(featuredData);
      setAllProducts(allData.products || []);
      setTotalCatalogCount(allData.totalCount || 0);
    } catch (err) {
      toast.error(err.message || 'Error loading featured products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    fetchData(e.target.value);
  };

  const handleAddFeatured = async (product) => {
    try {
      const res = await fetch(`/api/curation/featured/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: true, featuredOrder: featured.length + 1 })
      });
      if (!res.ok) throw new Error();
      toast.success(`${product.name} added to Featured list!`);
      setFeatured(prev => [...prev, { ...product, isFeatured: true }]);
      setAllProducts(prev => prev.filter(p => p.id !== product.id));
    } catch (err) {
      toast.error('Failed to feature product');
    }
  };

  const handleRemoveFeatured = async (product) => {
    try {
      const res = await fetch(`/api/curation/featured/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: false, featuredOrder: 0 })
      });
      if (!res.ok) throw new Error();
      toast.success(`Removed ${product.name} from Featured list`);
      setFeatured(prev => prev.filter(p => p.id !== product.id));
      if (product.name.toLowerCase().includes(search.toLowerCase())) {
        setAllProducts(prev => [...prev, { ...product, isFeatured: false }]);
      }
    } catch (err) {
      toast.error('Failed to unfeature product');
    }
  };

  const handleClearAll = async () => {
    if (featured.length === 0) return toast.error('No featured products to clear.');
    if (!window.confirm('Are you certain you want to clear ALL featured products? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/curation/featured-clear', { method: 'POST' });
      if (!res.ok) throw new Error();
      toast.success('Cleared all featured products');
      setFeatured([]);
      fetchData(search);
    } catch (err) {
      toast.error('Failed to clear featured products');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Featured Products</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Highlight selected grocery products across category headers and storefront widgets.
          </p>
        </div>
        <button 
          className="admin-btn outline" 
          onClick={handleClearAll} 
          style={{ borderColor: '#ef4444', color: '#ef4444' }}
          disabled={featured.length === 0}
        >
          <Trash size={16} style={{ marginRight: '0.5rem' }} /> Clear All Featured
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* LEFT COLUMN: Currently Featured */}
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '1px solid #334155' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Currently Featured 
              <span style={{ background: '#3b82f6', color: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem' }}>
                {featured.length}
              </span>
            </h3>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
          ) : featured.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Package size={44} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p style={{ fontWeight: 500 }}>No products currently featured.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>Select products from the catalog on the right to add them!</p>
            </div>
          ) : (
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>SKU</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {featured.map(p => {
                    const img = p.images?.[0]?.url || 'https://via.placeholder.com/40';
                    return (
                      <tr key={p.id}>
                        <td style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img src={img} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                          <div>
                            <div style={{ fontWeight: 500, color: '#f8fafc' }}>{p.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.category?.name || 'Catalog'}</div>
                          </div>
                        </td>
                        <td>HK${p.price.toFixed(2)}</td>
                        <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{p.sku}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            className="admin-btn outline" 
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', borderColor: '#ef4444', color: '#ef4444' }}
                            onClick={() => handleRemoveFeatured(p)}
                            title="Remove from featured list"
                          >
                            Remove
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

        {/* RIGHT COLUMN: All Products */}
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '1px solid #334155' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              All Products
              <span style={{ background: '#475569', color: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem' }}>
                {totalCatalogCount} total
              </span>
            </h3>
          </div>

          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              className="admin-input" 
              placeholder="Search unfeatured products by name or SKU..." 
              value={search}
              onChange={handleSearchChange}
              style={{ paddingLeft: '2.8rem', width: '100%' }}
            />
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading catalog...</div>
          ) : allProducts.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', flex: 1 }}>
              <p>No available unfeatured products match your search.</p>
            </div>
          ) : (
            <div style={{ maxHeight: '540px', overflowY: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allProducts.map(p => {
                    const img = p.images?.[0]?.url || 'https://via.placeholder.com/40';
                    return (
                      <tr key={p.id}>
                        <td style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img src={img} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                          <div>
                            <div style={{ fontWeight: 500, color: '#f8fafc' }}>{p.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>SKU: {p.sku}</div>
                          </div>
                        </td>
                        <td>HK${p.price.toFixed(2)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            className="admin-btn" 
                            style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
                            onClick={() => handleAddFeatured(p)}
                          >
                            <Plus size={14} style={{ marginRight: '0.3rem' }} /> Add
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
      </div>
    </div>
  );
}
