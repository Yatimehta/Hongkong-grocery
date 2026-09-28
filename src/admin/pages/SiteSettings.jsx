import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Save, RefreshCw } from 'lucide-react';

export default function SiteSettings() {
  const [general, setGeneral] = useState({});
  const [deliveryTax, setDeliveryTax] = useState({});
  const [social, setSocial] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);

      // Fetch general group
      const resGen = await fetch('/api/settings?group=general');
      const dataGen = await resGen.json();
      setGeneral(dataGen || {});

      // Fetch delivery_tax group
      const resDeliv = await fetch('/api/settings?group=delivery_tax');
      const dataDeliv = await resDeliv.json();
      setDeliveryTax(dataDeliv || {});

      // Fetch social group (or general for social links)
      const resSocial = await fetch('/api/settings?group=social');
      const dataSocial = await resSocial.json();
      setSocial(dataSocial || {});

    } catch (err) {
      toast.error('Error loading store settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      // Save general settings
      const resGen = await fetch('/api/settings/general', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(general)
      });
      if (!resGen.ok) throw new Error('Failed to save General settings');

      // Save delivery & tax settings
      const resDeliv = await fetch('/api/settings/delivery_tax', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deliveryTax)
      });
      if (!resDeliv.ok) throw new Error('Failed to save Shipping & Tax settings');

      // Save social settings
      const resSocial = await fetch('/api/settings/social', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(social)
      });
      if (!resSocial.ok) throw new Error('Failed to save Social settings');

      toast.success('Site settings updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
        <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 1rem', display: 'block' }} />
        Loading Site Settings...
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1>Site Settings</h1>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.5rem', alignItems: 'start' }}>

          {/* Left Column: General Settings */}
          <div className="admin-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>
              General Settings
            </h3>

            <div className="form-group">
              <label>Site Name</label>
              <input
                type="text"
                className="admin-input"
                value={general.store_name || ''}
                onChange={e => setGeneral({ ...general, store_name: e.target.value })}
                placeholder="e.g. Namaste Indian Asian Grocery Store Finland"
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-group">
              <label>Tagline</label>
              <input
                type="text"
                className="admin-input"
                value={general.store_slogan || ''}
                onChange={e => setGeneral({ ...general, store_slogan: e.target.value })}
                placeholder="Tagline or slogan description"
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="admin-input"
                value={general.contact_email || ''}
                onChange={e => setGeneral({ ...general, contact_email: e.target.value })}
                placeholder="hello@thedesi.co.uk"
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                className="admin-input"
                value={general.support_phone || ''}
                onChange={e => setGeneral({ ...general, support_phone: e.target.value })}
                placeholder="e.g. +852 9029 1454"
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-group">
              <label>WhatsApp Number</label>
              <input
                type="text"
                className="admin-input"
                value={general.whatsapp_number || ''}
                onChange={e => setGeneral({ ...general, whatsapp_number: e.target.value })}
                placeholder="e.g. 85290291454"
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                className="admin-input"
                rows="3"
                value={general.store_address || ''}
                onChange={e => setGeneral({ ...general, store_address: e.target.value })}
                placeholder="Store Physical Address"
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-group">
              <label>Site URL</label>
              <input
                type="text"
                className="admin-input"
                value={general.store_url || ''}
                onChange={e => setGeneral({ ...general, store_url: e.target.value })}
                placeholder="https://example.com"
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Admin Orders URL</label>
              <input
                type="text"
                className="admin-input"
                value={general.admin_orders_url || ''}
                onChange={e => setGeneral({ ...general, admin_orders_url: e.target.value })}
                placeholder="/admin/orders.php"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Right Column: Shipping & Tax & Social Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Shipping & Tax Card */}
            <div className="admin-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>
                Shipping & Tax
              </h3>

              <div className="form-group">
                <label>Free Shipping Above ($)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={deliveryTax.free_delivery_threshold || ''}
                  onChange={e => setDeliveryTax({ ...deliveryTax, free_delivery_threshold: e.target.value })}
                  placeholder="1000"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group">
                <label>Shipping Charge ($)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={deliveryTax.base_delivery_fee || ''}
                  onChange={e => setDeliveryTax({ ...deliveryTax, base_delivery_fee: e.target.value })}
                  placeholder="60"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Tax Percentage (%)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={deliveryTax.tax_percentage || ''}
                  onChange={e => setDeliveryTax({ ...deliveryTax, tax_percentage: e.target.value })}
                  placeholder="0"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Social Links Card */}
            <div className="admin-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>
                Social Links
              </h3>

              <div className="form-group">
                <label>Facebook</label>
                <input
                  type="text"
                  className="admin-input"
                  value={social.facebook_url || ''}
                  onChange={e => setSocial({ ...social, facebook_url: e.target.value })}
                  placeholder="Facebook page link"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group">
                <label>Instagram</label>
                <input
                  type="text"
                  className="admin-input"
                  value={social.instagram_url || ''}
                  onChange={e => setSocial({ ...social, instagram_url: e.target.value })}
                  placeholder="Instagram profile link"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Twitter / X</label>
                <input
                  type="text"
                  className="admin-input"
                  value={social.twitter_url || ''}
                  onChange={e => setSocial({ ...social, twitter_url: e.target.value })}
                  placeholder="Twitter / X profile link"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
              <button type="submit" className="admin-btn" disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
                <Save size={18} /> {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}
