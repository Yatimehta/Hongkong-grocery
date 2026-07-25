import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Save, RefreshCw, CreditCard, DollarSign, ShieldCheck, Landmark, Truck, Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';

export default function Payments() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showStripeSecret, setShowStripeSecret] = useState(false);

  useEffect(() => {
    fetchPaymentSettings();
  }, []);

  const fetchPaymentSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings?group=payments');
      if (!res.ok) throw new Error('Failed to load payment configuration');
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      toast.error(err.message || 'Error loading payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: prev[key] === 'true' ? 'false' : 'true'
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/settings/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      toast.success('Payment gateway settings saved and active!');
    } catch (err) {
      toast.error(err.message || 'Error saving payment settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading Payment Gateways...</div>;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Payment Gateways & Checkout Rules</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Configure active customer payment options, offline instructions, and minimum order values for grocery deliveries.
          </p>
        </div>
        <button className="admin-btn" onClick={handleSave} disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <Save size={18} /> {saving ? 'Saving...' : 'Save Payment Rules'}
        </button>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          
          {/* METHOD 1: CASH ON DELIVERY (COD) */}
          <div className="admin-card" style={{ padding: '1.5rem', borderLeft: settings.cod_enabled === 'true' ? '4px solid #10b981' : '4px solid #64748b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.15rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
                <Truck size={22} style={{ color: '#10b981' }} /> Cash on Delivery (COD)
              </h2>
              <button 
                type="button" 
                onClick={() => handleToggle('cod_enabled')}
                style={{
                  padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.75rem', border: 'none', cursor: 'pointer',
                  background: settings.cod_enabled === 'true' ? '#10b981' : '#334155', color: '#fff',
                  transition: 'background 0.2s'
                }}
              >
                {settings.cod_enabled === 'true' ? 'ACTIVE & ENABLED' : 'DISABLED'}
              </button>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem', lineHeight: '1.4' }}>
              Allow shoppers to pay in cash or card directly to your delivery driver when their fresh groceries arrive at their doorstep.
            </p>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>Customer Checkout Instructions</label>
              <textarea 
                className="admin-input" 
                rows="3" 
                value={settings.cod_instructions || ''} 
                onChange={e => handleChange('cod_instructions', e.target.value)} 
                disabled={settings.cod_enabled !== 'true'}
                placeholder="Please have exact cash ready upon delivery..."
              />
            </div>
          </div>

          {/* METHOD 2: BANK / WIRE TRANSFER */}
          <div className="admin-card" style={{ padding: '1.5rem', borderLeft: settings.bank_transfer_enabled === 'true' ? '4px solid #3b82f6' : '4px solid #64748b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.15rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
                <Landmark size={22} style={{ color: '#3b82f6' }} /> Bank Transfer / Wire
              </h2>
              <button 
                type="button" 
                onClick={() => handleToggle('bank_transfer_enabled')}
                style={{
                  padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.75rem', border: 'none', cursor: 'pointer',
                  background: settings.bank_transfer_enabled === 'true' ? '#3b82f6' : '#334155', color: '#fff',
                  transition: 'background 0.2s'
                }}
              >
                {settings.bank_transfer_enabled === 'true' ? 'ACTIVE & ENABLED' : 'DISABLED'}
              </button>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem', lineHeight: '1.4' }}>
              Display your shop bank account details during checkout for customers who prefer direct electronic bank deposits or wholesale orders.
            </p>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>Bank Account & Transfer Instructions</label>
              <textarea 
                className="admin-input" 
                rows="3" 
                value={settings.bank_transfer_details || ''} 
                onChange={e => handleChange('bank_transfer_details', e.target.value)} 
                disabled={settings.bank_transfer_enabled !== 'true'}
                placeholder="Bank Name, IBAN / Account Number, and instructions..."
              />
            </div>
          </div>

          {/* METHOD 3: STRIPE ONLINE CREDIT CARDS */}
          <div className="admin-card" style={{ padding: '1.5rem', borderLeft: settings.stripe_enabled === 'true' ? '4px solid #a855f7' : '4px solid #64748b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.15rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
                <CreditCard size={22} style={{ color: '#a855f7' }} /> Stripe Credit Card Processing
              </h2>
              <button 
                type="button" 
                onClick={() => handleToggle('stripe_enabled')}
                style={{
                  padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.75rem', border: 'none', cursor: 'pointer',
                  background: settings.stripe_enabled === 'true' ? '#a855f7' : '#334155', color: '#fff',
                  transition: 'background 0.2s'
                }}
              >
                {settings.stripe_enabled === 'true' ? 'ACTIVE & ENABLED' : 'DISABLED'}
              </button>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem', lineHeight: '1.4' }}>
              Accept instant online payments via Visa, Mastercard, Apple Pay, and Google Pay securely through Stripe API integration.
            </p>

            <div className="form-group">
              <label style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>Stripe Publishable Key (pk_live_... or pk_test_...)</label>
              <input 
                type="text" 
                className="admin-input" 
                value={settings.stripe_public_key || ''} 
                onChange={e => handleChange('stripe_public_key', e.target.value)} 
                disabled={settings.stripe_enabled !== 'true'}
                placeholder="pk_test_51Mz..."
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>Stripe Secret Key (sk_live_... or sk_test_...)</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showStripeSecret ? 'text' : 'password'} 
                  className="admin-input" 
                  value={settings.stripe_secret_key || ''} 
                  onChange={e => handleChange('stripe_secret_key', e.target.value)} 
                  disabled={settings.stripe_enabled !== 'true'}
                  placeholder="sk_test_51Mz..."
                  style={{ paddingRight: '2.5rem', width: '100%' }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowStripeSecret(!showStripeSecret)} 
                  style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.3rem' }}
                >
                  {showStripeSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* CHECKOUT RULE: MINIMUM ORDER THRESHOLD */}
          <div className="admin-card" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
            <h2 style={{ fontSize: '1.15rem', color: '#f8fafc', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
              <DollarSign size={22} style={{ color: '#f59e0b' }} /> Minimum Order Value for Delivery
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.75rem 0 1.25rem', lineHeight: '1.4' }}>
              Set the minimum order HK$ value required before a customer can proceed to checkout. Ensures every grocery dispatch is profitable.
            </p>

            <div className="form-group">
              <label style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>Minimum Order Amount (HK$)</label>
              <input 
                type="number" 
                step="0.01" 
                className="admin-input" 
                value={settings.minimum_order_amount || '15.00'} 
                onChange={e => handleChange('minimum_order_amount', e.target.value)} 
                placeholder="15.00"
                style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f59e0b' }}
              />
            </div>

            <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.85rem', borderRadius: '8px', display: 'flex', gap: '0.75rem', alignItems: 'center', color: '#fcd34d', fontSize: '0.85rem' }}>
              <AlertCircle size={20} style={{ flexShrink: 0, color: '#f59e0b' }} />
              <span>If a shopping cart total is below <strong>HK${settings.minimum_order_amount || '15.00'}</strong>, checkout will remain locked with a friendly prompt to add more produce!</span>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}
