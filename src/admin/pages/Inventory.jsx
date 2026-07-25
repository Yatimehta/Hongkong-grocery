import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { AlertTriangle, History, ArrowRightLeft, X } from 'lucide-react';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('status'); // 'status' or 'history'
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [formData, setFormData] = useState({
    quantityChanged: '', reason: ''
  });

  useEffect(() => {
    fetchData();
  }, [viewMode]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (viewMode === 'status') {
        const res = await fetch('/api/inventory');
        setProducts(await res.json());
      } else {
        const res = await fetch('/api/inventory/history');
        setHistory(await res.json());
      }
    } catch (err) {
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setFormData({ quantityChanged: '', reason: '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.quantityChanged) return toast.error('Quantity is required');

    try {
      const res = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantityChanged: Number(formData.quantityChanged),
          reason: formData.reason
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success('Inventory adjusted successfully');
      handleCloseModal();
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to adjust inventory');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Inventory Management</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`admin-btn ${viewMode === 'status' ? '' : 'outline'}`} onClick={() => setViewMode('status')} style={{ background: viewMode === 'status' ? '' : 'transparent', border: viewMode === 'status' ? '' : '1px solid #475569' }}>
            <AlertTriangle size={18} style={{ marginRight: '0.5rem' }} /> Status
          </button>
          <button className={`admin-btn ${viewMode === 'history' ? '' : 'outline'}`} onClick={() => setViewMode('history')} style={{ background: viewMode === 'history' ? '' : 'transparent', border: viewMode === 'history' ? '' : '1px solid #475569' }}>
            <History size={18} style={{ marginRight: '0.5rem' }} /> History
          </button>
        </div>
      </div>

      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
        ) : viewMode === 'status' ? (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Stock Level</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const isLowStock = p.stock <= p.lowStockThreshold;
                  const isOutOfStock = p.stock <= 0;
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 500 }}>{p.name}</td>
                      <td>{p.sku}</td>
                      <td>
                        <span style={{ 
                          color: isOutOfStock ? '#ef4444' : (isLowStock ? '#f59e0b' : '#10b981'),
                          fontWeight: 'bold'
                        }}>
                          {p.stock} {p.unit}
                        </span>
                      </td>
                      <td>
                        {isOutOfStock ? (
                          <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>Out of Stock</span>
                        ) : isLowStock ? (
                          <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>Low Stock</span>
                        ) : (
                          <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>In Stock</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="icon-btn" onClick={() => handleOpenModal(p)} title="Adjust Stock">
                          <ArrowRightLeft size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Product</th>
                  <th>Adjustment</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.id}>
                    <td>{new Date(h.date).toLocaleString()}</td>
                    <td>
                      <div>{h.product.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{h.product.sku}</div>
                    </td>
                    <td>
                      <span style={{ 
                        color: h.quantityChanged > 0 ? '#10b981' : '#ef4444',
                        fontWeight: 'bold'
                      }}>
                        {h.quantityChanged > 0 ? '+' : ''}{h.quantityChanged}
                      </span>
                    </td>
                    <td>{h.reason}</td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No inventory history found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={handleCloseModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="admin-modal-header">
              <h2>Adjust Inventory</h2>
              <button className="icon-btn" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            <div className="admin-modal-body">
              <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#1e293b', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Product</div>
                <div style={{ fontWeight: 500, fontSize: '1.1rem' }}>{selectedProduct?.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Current Stock:</span>
                  <span style={{ fontWeight: 'bold' }}>{selectedProduct?.stock} {selectedProduct?.unit}</span>
                </div>
              </div>
              
              <form id="adjustForm" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Adjustment (+ or -) *</label>
                  <input type="number" className="admin-input" placeholder="e.g. -5 or 10" value={formData.quantityChanged} onChange={e => setFormData({...formData, quantityChanged: e.target.value})} required />
                  <small style={{ color: '#94a3b8', marginTop: '0.25rem', display: 'block' }}>New stock will be: {(selectedProduct?.stock || 0) + (Number(formData.quantityChanged) || 0)}</small>
                </div>
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label>Reason</label>
                  <input type="text" className="admin-input" placeholder="e.g. Damaged goods, Restock" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
                </div>
              </form>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn" style={{ background: 'transparent', border: '1px solid #475569' }} onClick={handleCloseModal}>Cancel</button>
              <button className="admin-btn" type="submit" form="adjustForm">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
