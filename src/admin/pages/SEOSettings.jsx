import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Save, RefreshCw, Search, Globe, Share2, Code, FileText, ExternalLink, Sparkles } from 'lucide-react';

export default function SEOSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSeoSettings();
  }, []);

  const fetchSeoSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings?group=seo');
      if (!res.ok) throw new Error('Failed to load SEO rules');
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      toast.error(err.message || 'Error loading SEO configuration');
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
      const res = await fetch('/api/settings/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save SEO config');
      toast.success('Search Engine Optimization settings & tracking pixels updated!');
    } catch (err) {
      toast.error(err.message || 'Error saving SEO configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading Search Optimization Engine...</div>;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search style={{ color: '#38bdf8' }} /> SEO & Social Metadata Configuration
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Boost store search visibility on Google and Bing, preview SERP card layouts, and attach web analytics pixels.
          </p>
        </div>
        <button className="admin-btn" onClick={handleSave} disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <Save size={18} /> {saving ? 'Saving...' : 'Publish SEO Metadata'}
        </button>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          
          {/* SECTION 1: GLOBAL METADATA & GOOGLE SEARCH PREVIEW */}
          <div className="admin-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', color: '#f8fafc', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem' }}>
              <Globe size={18} style={{ color: '#3b82f6' }} /> Default Storefront SEO & Open Graph Tags
            </h2>

            <div className="form-group">
              <label>Global Website Meta Title (Title Tag)</label>
              <input 
                type="text" 
                className="admin-input" 
                value={settings.global_meta_title || ''} 
                onChange={e => handleChange('global_meta_title', e.target.value)} 
                placeholder="Fresh Market Grocery | Organic Farm Produce"
              />
              <span style={{ fontSize: '0.75rem', color: (settings.global_meta_title?.length || 0) > 60 ? '#f59e0b' : '#64748b' }}>
                {settings.global_meta_title?.length || 0}/60 characters (Recommended under 60 chars for full display on Google)
              </span>
            </div>

            <div className="form-group">
              <label>Global Website Meta Description (Description Tag)</label>
              <textarea 
                className="admin-input" 
                rows="3" 
                value={settings.global_meta_description || ''} 
                onChange={e => handleChange('global_meta_description', e.target.value)} 
                placeholder="Shop farm-fresh organic groceries delivered directly to your doorstep..."
              />
              <span style={{ fontSize: '0.75rem', color: (settings.global_meta_description?.length || 0) > 160 ? '#f59e0b' : '#64748b' }}>
                {settings.global_meta_description?.length || 0}/160 characters
              </span>
            </div>

            {/* LIVE GOOGLE SEARCH SERP PREVIEW BOX */}
            <h3 style={{ fontSize: '0.95rem', color: '#cbd5e1', margin: '1.5rem 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Search size={16} style={{ color: '#10b981' }} /> Live Google Search Results (SERP) Preview
            </h3>
            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)', border: '1px solid #e2e8f0', fontFamily: 'Arial, sans-serif' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <span style={{ fontSize: '12px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#334155', fontWeight: 600 }}>Web</span>
                <span style={{ fontSize: '14px', color: '#4b5563' }}>https://www.freshmarketgrocery.com</span>
              </div>
              <div style={{ fontSize: '18px', color: '#1a0dab', fontWeight: 500, lineHeight: '1.3', cursor: 'pointer', textDecoration: 'hover:underline' }}>
                {settings.global_meta_title || 'Fresh Market Grocery | Organic Farm Produce'}
              </div>
              <div style={{ fontSize: '13px', color: '#4d5156', lineHeight: '1.4', marginTop: '0.3rem' }}>
                {settings.global_meta_description || 'Shop fresh vegetables, fruits, dairy, and farm produce online. Enjoy same-day door delivery and exclusive savings at Fresh Market Grocery.'}
              </div>
            </div>
          </div>

          {/* SECTION 2: TRACKING PIXELS & ROBOTS.TXT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div className="admin-card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', color: '#f8fafc', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem' }}>
                <Code size={18} style={{ color: '#a855f7' }} /> Analytics Pixels & Conversion Scripts
              </h2>

              <div className="form-group">
                <label>Google Analytics Measurement ID (GA4)</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={settings.google_analytics_id || ''} 
                  onChange={e => handleChange('google_analytics_id', e.target.value)} 
                  placeholder="G-XXXXXXXXXX"
                  style={{ fontFamily: 'monospace' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Facebook / Meta Advertising Pixel ID</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={settings.facebook_pixel_id || ''} 
                  onChange={e => handleChange('facebook_pixel_id', e.target.value)} 
                  placeholder="987654321000000"
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
            </div>

            <div className="admin-card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', color: '#f8fafc', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem' }}>
                <FileText size={18} style={{ color: '#f59e0b' }} /> Robots.txt Crawler Configuration
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                Instruct Googlebot and AI crawlers which parts of your online shop are eligible for indexing.
              </p>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <textarea 
                  className="admin-input" 
                  rows="5" 
                  value={settings.robots_txt_rules || ''} 
                  onChange={e => handleChange('robots_txt_rules', e.target.value)} 
                  placeholder={`User-agent: *\nAllow: /\nDisallow: /admin/`}
                  style={{ fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.4', background: '#0f172a', color: '#a78bfa' }}
                />
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}
