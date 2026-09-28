import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Save, RefreshCw, Truck, Percent, Clock, MapPin, Gift, AlertCircle, CheckSquare, Square } from 'lucide-react';

export default function DeliveryTax() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDeliverySettings();
  }, []);

  const fetchDeliverySettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings?group=delivery_tax');
      if (!res.ok) throw new Error('Failed to fetch delivery settings');
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      toast.error(err.message || 'Error loading delivery configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/settings/delivery_tax', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save configuration');
      toast.success('Delivery rates & tax billing rules successfully updated!');
    } catch (err) {
      toast.error(err.message || 'Error saving delivery & tax rules');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading Delivery & Tax Rules...</div>;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Delivery Fees & Store Tax Rules</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Configure standard shipping rates, free delivery incentive thresholds, tax/VAT percentages, and daily delivery cutoffs.
          </p>
        </div>
        <button className="admin-btn" onClick={handleSave} disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <Save size={18} /> {saving ? 'Saving Rules...' : 'Save Delivery & Tax Configuration'}
        </button>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          
          {/* SECTION 1: DELIVERY RATES & FREE SHIPPING INCENTIVES */}
          <div className="admin-card" style={{ padding: '1.5rem', borderTop: '4px solid #10b981' }}>
            <h2 style={{ fontSize: '1.15rem', color: '#f8fafc', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem' }}>
              <Truck size={22} style={{ color: '#10b981' }} /> Delivery Fee Rules & Incentives
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>Standard Delivery Fee (HK$)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  className="admin-input" 
                  value={settings.base_delivery_fee || '60.00'} 
                  onChange={e => handleChange('base_delivery_fee', e.target.value)} 
                  style={{ fontWeight: 700, color: '#34d399', fontSize: '1.05rem' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Gift size={15} style={{ color: '#f59e0b' }} /> Free Delivery Threshold (HK$)
                </label>
                <input 
                  type="number" 
                  step="0.01" 
                  className="admin-input" 
                  value={settings.free_delivery_threshold || '1000.00'} 
                  onChange={e => handleChange('free_delivery_threshold', e.target.value)} 
                  style={{ fontWeight: 700, color: '#f59e0b', fontSize: '1.05rem' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>Express (Same-Day Rush) Surcharge (HK$)</label>
              <input 
                type="number" 
                step="0.01" 
                className="admin-input" 
                value={settings.express_delivery_fee || '9.99'} 
                onChange={e => handleChange('express_delivery_fee', e.target.value)} 
              />
            </div>

            <div style={{ background: '#0f172a', border: '1px dashed #10b981', padding: '1rem', borderRadius: '8px', marginTop: '0.5rem' }}>
              <div style={{ fontWeight: 600, color: '#34d399', fontSize: '0.9rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertCircle size={16} /> Storefront Cart Banner Experience
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: '1.4' }}>
                Shoppers with carts under <strong>HK${settings.free_delivery_threshold || '1000.00'}</strong> will see a dynamic progress bar motivating them to add more items to unlock free delivery (saving <strong>HK${settings.base_delivery_fee || '60.00'}</strong>)!
              </div>
            </div>
          </div>

          {/* SECTION 2: TAX / VAT & SERVICEABLE ZONES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div className="admin-card" style={{ padding: '1.5rem', borderTop: '4px solid #3b82f6' }}>
              <h2 style={{ fontSize: '1.15rem', color: '#f8fafc', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem' }}>
                <Percent size={22} style={{ color: '#3b82f6' }} /> Sales Tax / VAT Configuration
              </h2>

              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>Applicable Grocery Tax Rate (%)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="admin-input" 
                  value={settings.tax_percentage || '5.0'} 
                  onChange={e => handleChange('tax_percentage', e.target.value)} 
                  placeholder="e.g. 5.0"
                  style={{ fontWeight: 700, color: '#60a5fa', fontSize: '1.05rem', maxWidth: '200px' }}
                />
              </div>

              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem', background: '#0f172a', borderRadius: '8px', border: '1px solid #334155' }}
                onClick={() => handleChange('tax_included_in_price', settings.tax_included_in_price === 'true' ? 'false' : 'true')}
              >
                {settings.tax_included_in_price === 'true' ? (
                  <CheckSquare size={20} style={{ color: '#3b82f6', flexShrink: 0 }} />
                ) : (
                  <Square size={20} style={{ color: '#64748b', flexShrink: 0 }} />
                )}
                <div>
                  <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem' }}>Tax is already included in catalog prices</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>If checked, tax is shown as a breakdown in checkout without adding extra charges on top of listed price tag.</div>
                </div>
              </div>
            </div>

            {/* SECTION 3: CUTOFF TIME & ZONES */}
            <div className="admin-card" style={{ padding: '1.5rem', borderTop: '4px solid #f59e0b' }}>
              <h2 style={{ fontSize: '1.15rem', color: '#f8fafc', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem' }}>
                <Clock size={22} style={{ color: '#f59e0b' }} /> Same-Day Cutoff & Delivery Areas
              </h2>

              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>Daily Same-Day Delivery Cutoff Hour (24h format)</label>
                <select 
                  className="admin-input" 
                  value={settings.same_day_cutoff_hour || '15'}
                  onChange={e => handleChange('same_day_cutoff_hour', e.target.value)}
                  style={{ maxWidth: '250px' }}
                >
                  {[...Array(24)].map((_, i) => (
                    <option key={i} value={String(i)}>{i}:00 ({i === 0 ? 'Midnight' : i < 12 ? `${i} AM` : i === 12 ? 'Noon' : `${i-12} PM`})</option>
                  ))}
                </select>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem', margin: '0.3rem 0 0 0' }}>
                  Orders placed after this cutoff hour will automatically default to delivery for the following morning.
                </p>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.8rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={15} /> Supported Delivery Neighborhoods / Districts
                </label>
                <textarea 
                  className="admin-input" 
                  rows="2" 
                  value={settings.delivery_areas || ''} 
                  onChange={e => handleChange('delivery_areas', e.target.value)} 
                  placeholder="Central District, North Suburbs, West End..."
                />
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}
