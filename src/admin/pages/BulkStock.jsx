import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Zap, HelpCircle, Package, Layers, CheckSquare } from 'lucide-react';

export default function BulkStock() {
  const [targetType, setTargetType] = useState('all'); // all, category, selected
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newStock, setNewStock] = useState('999');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to load categories');
      const data = await res.json();
      setCategories(data);
      if (data.length > 0) {
        setSelectedCategory(data[0].id);
      }
    } catch (err) {
      toast.error('Could not load categories for filtering');
    }
  };

  const handleQuickAction = async () => {
    if (!window.confirm('Are you sure you want to set stock for ALL products to 999?')) return;
    
    try {
      setSubmitting(true);
      const res = await fetch('/api/migration/bulk-modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_stock',
          value: 999,
          categoryId: 'all'
        })
      });

      if (!res.ok) throw new Error('Quick action failed.');
      const data = await res.json();
      toast.success(data.message || 'All products set to 999 stock!');
    } catch (err) {
      toast.error(err.message || 'Quick action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyUpdate = async () => {
    const stockVal = parseInt(newStock);
    if (isNaN(stockVal) || stockVal < 0) {
      toast.error('Please enter a valid stock quantity (0 or greater)');
      return;
    }

    const confirmMsg = targetType === 'category' 
      ? `Are you sure you want to update stock for all products in this category to ${stockVal}?`
      : `Are you sure you want to update stock for all products to ${stockVal}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/migration/bulk-modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_stock',
          value: stockVal,
          categoryId: targetType === 'category' ? selectedCategory : 'all'
        })
      });

      if (!res.ok) throw new Error('Bulk update failed.');
      const data = await res.json();
      toast.success(data.message || 'Bulk stock update applied successfully!');
    } catch (err) {
      toast.error(err.message || 'Bulk update failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Bulk Stock Update</h1>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b, #0f172a)',
          border: '1px solid #312e81',
          borderRadius: '12px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            background: 'rgba(249, 115, 22, 0.1)',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            color: '#f97316'
          }}>+</div>
          <div>
            <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Bulk Stock Update</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
              Set stock quantities for all products, by category, or for selected products only. After WooCommerce import, use this to instantly make all products "In Stock".
            </p>
          </div>
        </div>

        {/* Quick Action */}
        <div style={{
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h4 style={{ color: '#f8fafc', fontWeight: 600, margin: 0 }}>
              Quick Action: Set ALL products to 999 stock
            </h4>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
              Most common after WooCommerce import — one click, all done
            </p>
          </div>
          <button
            onClick={handleQuickAction}
            disabled={submitting}
            style={{
              background: '#f97316',
              border: 'none',
              color: '#fff',
              padding: '0.6rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Set All → 999 In Stock
          </button>
        </div>

        {/* Custom Bulk Update */}
        <div className="admin-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem' }}>
            Custom Bulk Update
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
            {/* All Products Option */}
            <div
              onClick={() => setTargetType('all')}
              style={{
                background: '#0f172a',
                border: targetType === 'all' ? '2px solid #f97316' : '1px solid #1e293b',
                borderRadius: '8px',
                padding: '1.5rem 1rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ color: '#f8fafc', fontSize: '1.5rem', marginBottom: '0.5rem' }}>+</div>
              <h4 style={{ color: '#f8fafc', margin: 0, fontSize: '0.95rem' }}>All Products</h4>
              <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>
                Update every product in the catalog
              </p>
            </div>

            {/* By Category Option */}
            <div
              onClick={() => setTargetType('category')}
              style={{
                background: '#0f172a',
                border: targetType === 'category' ? '2px solid #f97316' : '1px solid #1e293b',
                borderRadius: '8px',
                padding: '1.5rem 1rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ color: '#f8fafc', fontSize: '1.5rem', marginBottom: '0.5rem' }}>+</div>
              <h4 style={{ color: '#f8fafc', margin: 0, fontSize: '0.95rem' }}>By Category</h4>
              <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>
                Update only products in a specific category
              </p>
            </div>

            {/* Selected Products Option */}
            <div
              onClick={() => setTargetType('selected')}
              style={{
                background: '#0f172a',
                border: targetType === 'selected' ? '2px solid #f97316' : '1px solid #1e293b',
                borderRadius: '8px',
                padding: '1.5rem 1rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ color: '#f8fafc', fontSize: '1.5rem', marginBottom: '0.5rem' }}>+</div>
              <h4 style={{ color: '#f8fafc', margin: 0, fontSize: '0.95rem' }}>Selected Products</h4>
              <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>
                Hand-pick specific products to update
              </p>
            </div>
          </div>

          {targetType === 'category' && (
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Select Category</label>
              <select
                className="admin-input"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ width: '100%' }}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {targetType === 'selected' && (
            <div
              style={{
                background: '#0f172a',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                border: '1px solid #1e293b',
                color: '#64748b',
                fontSize: '0.9rem'
              }}
            >
              Selected products mode enabled. Select products from the primary inventory list to apply.
            </div>
          )}

          <div className="form-group" style={{ maxWidth: '400px', marginBottom: '1.5rem' }}>
            <label>New Stock Quantity</label>
            <input
              type="number"
              className="admin-input"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              placeholder="e.g. 999"
              style={{ width: '100%', fontSize: '1.25rem', fontWeight: 'bold' }}
            />
            {/* Quick Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
              {[
                { label: 'Out of Stock (0)', val: 0 },
                { label: '10', val: 10 },
                { label: '50', val: 50 },
                { label: '100', val: 100 },
                { label: '999', val: 999 }
              ].map((pill) => (
                <button
                  key={pill.label}
                  type="button"
                  onClick={() => setNewStock(String(pill.val))}
                  style={{
                    background: '#1e293b',
                    border: 'none',
                    color: '#e2e8f0',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #1e293b', paddingTop: '1.25rem' }}>
            <button
              onClick={handleApplyUpdate}
              disabled={submitting}
              style={{
                background: '#f97316',
                border: 'none',
                color: '#fff',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Apply Bulk Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
