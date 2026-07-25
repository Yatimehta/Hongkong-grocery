import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Search, Package, TrendingUp, Trash, Info } from 'lucide-react';

export default function BestSellers() {
  const [trending, setTrending] = useState([]);
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
      const [resTrending, resAll] = await Promise.all([
        fetch('/api/curation/trending'),
        fetch(`/api/curation/catalog?type=trending&search=${encodeURIComponent(searchQuery)}`)
      ]);
      
      if (!resTrending.ok || !resAll.ok) throw new Error('Failed to fetch best sellers data');
      
      const trendingData = await resTrending.json();
      const allData = await resAll.json();

      setTrending(trendingData);
      setAllProducts(allData.products || []);
      setTotalCatalogCount(allData.totalCount || 0);
    } catch (err) {
      toast.error(err.message || 'Error loading best sellers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    fetchData(e.target.value);
  };

  const handleAddTrending = async (product) => {
    try {
      const res = await fetch(`/api/curation/trending/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTrending: true, trendingOrder: trending.length + 1 })
      });
      if (!res.ok) throw new Error();
      toast.success(`${product.name} added to Best Sellers / Trending list!`);
      setTrending(prev => [...prev, { ...product, isTrending: true }]);
      setAllProducts(prev => prev.filter(p => p.id !== product.id));
    } catch (err) {
      toast.error('Failed to mark product as trending');
    }
  };

  const handleRemoveTrending = async (product) => {
    try {
      const res = await fetch(`/api/curation/trending/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTrending: false, trendingOrder: 0 })
      });
      if (!res.ok) throw new Error();
      toast.success(`Removed ${product.name} from Trending list`);
      setTrending(prev => prev.filter(p => p.id !== product.id));
      if (product.name.toLowerCase().includes(search.toLowerCase())) {
        setAllProducts(prev => [...prev, { ...product, isTrending: false }]);
      }
    } catch (err) {
      toast.error('Failed to remove from trending list');
    }
  };

  const handleClearAll = async () => {
    if (trending.length === 0) return toast.error('No trending products to clear.');
    if (!window.confirm('Are you certain you want to clear ALL Best Sellers / Trending products? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/curation/trending-clear', { method: 'POST' });
      if (!res.ok) throw new Error();
      toast.success('Cleared all trending products');
      setTrending([]);
      fetchData(search);
    } catch (err) {
      toast.error('Failed to clear trending products');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Best Sellers & Trending Products</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Manage the "Trending Deals & Best Sellers" carousel shown to customers on the home page.
          </p>
        </div>
        <button 
          className="admin-btn outline" 
          onClick={handleClearAll} 
          style={{ borderColor: '#ef4444', color: '#ef4444' }}
          disabled={trending.length === 0}
        >
          <Trash size={16} style={{ marginRight: '0.5rem' }} /> Clear All Trending
        </button>
      </div>

      <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <Info size={20} style={{ color: '#60a5fa', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div style={{ color: '#f8fafc', fontWeight: 600 }}>Curation Mode: Admin-Curated Manual Override</div>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            To give you total commercial control over margin promotions and inventory push, this section gives you direct admin curation power. Regardless of automated sales volume, products added here will immediately appear in the Best Sellers and Trending sections of your online grocery storefront.
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* LEFT COLUMN: Currently Trending */}
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '1px solid #334155' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} style={{ color: '#10b981' }} /> Currently Trending
              <span style={{ background: '#10b981', color: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem' }}>
                {trending.length}
              </span>
            </h3>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
          ) : trending.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Package size={44} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p style={{ fontWeight: 500 }}>No products in your Best Sellers list.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>Pick high-margin or popular items from the right to highlight them!</p>
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
                  {trending.map(p => {
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
                            onClick={() => handleRemoveTrending(p)}
                            title="Remove from trending list"
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
              placeholder="Search catalog products by name or SKU..." 
              value={search}
              onChange={handleSearchChange}
              style={{ paddingLeft: '2.8rem', width: '100%' }}
            />
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading catalog...</div>
          ) : allProducts.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', flex: 1 }}>
              <p>No available unselected products match your search.</p>
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
                            style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', background: '#10b981', border: 'none' }}
                            onClick={() => handleAddTrending(p)}
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
