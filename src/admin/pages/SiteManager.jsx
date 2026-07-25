import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Save, Plus, Trash2, Edit2, ArrowUp, ArrowDown, Layout, Navigation, Eye, EyeOff, Check, X, Shield, Star, Award, Mail } from 'lucide-react';

export default function SiteManager() {
  const [navItems, setNavItems] = useState([]);
  const [layoutToggles, setLayoutToggles] = useState({
    show_hero_banner: 'true',
    show_featured_brands: 'true',
    show_best_sellers_section: 'true',
    show_newsletter_box: 'true'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newNav, setNewNav] = useState({ title: '', link: '', order: 1 });
  const [isAddingNav, setIsAddingNav] = useState(false);

  useEffect(() => {
    fetchSiteManagerConfig();
  }, []);

  const fetchSiteManagerConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings?group=site_manager');
      if (!res.ok) throw new Error('Failed to fetch site structure configuration');
      const data = await res.json();
      
      if (data.nav_items) {
        try { setNavItems(JSON.parse(data.nav_items)); } catch (e) { setNavItems([]); }
      }
      
      setLayoutToggles({
        show_hero_banner: data.show_hero_banner || 'true',
        show_featured_brands: data.show_featured_brands || 'true',
        show_best_sellers_section: data.show_best_sellers_section || 'true',
        show_newsletter_box: data.show_newsletter_box || 'true'
      });
    } catch (err) {
      toast.error(err.message || 'Error loading site manager config');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setLayoutToggles(prev => ({
      ...prev,
      [key]: prev[key] === 'true' ? 'false' : 'true'
    }));
  };

  const handleAddNav = (e) => {
    e.preventDefault();
    if (!newNav.title || !newNav.link) return toast.error('Navigation label and link are required');
    
    const nextOrder = navItems.length > 0 ? Math.max(...navItems.map(i => i.order)) + 1 : 1;
    setNavItems([...navItems, { ...newNav, order: nextOrder }]);
    setNewNav({ title: '', link: '', order: nextOrder + 1 });
    setIsAddingNav(false);
    toast.success('Menu link added to list! Click save to apply to storefront.');
  };

  const handleRemoveNav = (index) => {
    const next = [...navItems];
    next.splice(index, 1);
    setNavItems(next);
  };

  const handleMoveNav = (index, direction) => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === navItems.length - 1)) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const next = [...navItems];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    
    // Re-assign sort orders
    const updated = next.map((item, idx) => ({ ...item, order: idx + 1 }));
    setNavItems(updated);
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      const payload = {
        nav_items: JSON.stringify(navItems),
        ...layoutToggles
      };
      
      const res = await fetch('/api/settings/site_manager', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save configuration');
      toast.success('Storefront site navigation and layout changes published!');
    } catch (err) {
      toast.error(err.message || 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading site structure configuration...</div>;

  const sectionCards = [
    { key: 'show_hero_banner', title: 'Hero Banner Carousel', desc: 'Main full-width promotional banner slide on top of homepage', icon: <Layout size={24} color="#3b82f6" /> },
    { key: 'show_featured_brands', title: 'Partner & Brand Logo Bar', desc: 'Carousel displaying famous organic farm partners and certified brand suppliers', icon: <Award size={24} color="#10b981" /> },
    { key: 'show_best_sellers_section', title: 'Best Sellers Product Showcase', desc: 'Dynamic grocery grid showcasing top sold or curated items', icon: <Star size={24} color="#f59e0b" /> },
    { key: 'show_newsletter_box', title: 'Weekly Deals Newsletter Box', desc: 'Email subscription signup box at the bottom of homepage for weekly grocery deals', icon: <Mail size={24} color="#a855f7" /> },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Storefront Site Manager & Layouts</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Configure store header navigation menus and customize active homepage structural sections in real-time.
          </p>
        </div>
        <button className="admin-btn" onClick={handleSaveAll} disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <Save size={18} /> {saving ? 'Publishing Changes...' : 'Publish Layout to Store'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Section 1: Header Navigation Links */}
        <div className="admin-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.1rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Navigation size={18} style={{ color: '#38bdf8' }} /> Main Header Navigation Links
            </h2>
            <button className="admin-btn outline" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem', margin: 0 }} onClick={() => setIsAddingNav(!isAddingNav)}>
              <Plus size={15} style={{ marginRight: '0.2rem', verticalAlign: 'middle' }} /> {isAddingNav ? 'Close' : 'Add Link'}
            </button>
          </div>

          {isAddingNav && (
            <form onSubmit={handleAddNav} style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #334155', marginBottom: '1.25rem' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#38bdf8' }}>New Navigation Item</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Link Label *</label>
                  <input type="text" className="admin-input" placeholder="e.g. Organic Produce" value={newNav.title} onChange={e => setNewNav({ ...newNav, title: e.target.value })} required autoFocus />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Target Hyperlink *</label>
                  <input type="text" className="admin-input" placeholder="/category/produce" value={newNav.link} onChange={e => setNewNav({ ...newNav, link: e.target.value })} required />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="admin-btn outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={() => setIsAddingNav(false)}>Cancel</button>
                <button type="submit" className="admin-btn" style={{ padding: '0.4rem 1.25rem', fontSize: '0.85rem' }}>Add to Menu</button>
              </div>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {navItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No navigation links configured. Add items above!</div>
            ) : (
              navItems.map((item, index) => (
                <div key={index} style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ background: '#334155', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                      {index + 1 || item.order}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.95rem' }}>{item.title}</div>
                      <div style={{ fontFamily: 'monospace', color: '#60a5fa', fontSize: '0.8rem' }}>{item.link}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <button type="button" className="icon-btn" onClick={() => handleMoveNav(index, 'up')} disabled={index === 0} title="Move Up"><ArrowUp size={16} /></button>
                    <button type="button" className="icon-btn" onClick={() => handleMoveNav(index, 'down')} disabled={index === navItems.length - 1} title="Move Down"><ArrowDown size={16} /></button>
                    <button type="button" className="icon-btn" onClick={() => handleRemoveNav(index)} title="Delete Link" style={{ color: '#ef4444', marginLeft: '0.4rem' }}><Trash2 size={16} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section 2: Homepage Section Display Toggles */}
        <div className="admin-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', color: '#f8fafc', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem' }}>
            <Layout size={18} style={{ color: '#f59e0b' }} /> Homepage Structural Sections
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem', lineHeight: '1.4' }}>
            Toggle sections on or off to immediately reorganize what shoppers see when visiting your home front.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sectionCards.map(s => {
              const active = layoutToggles[s.key] === 'true';
              return (
                <div 
                  key={s.key} 
                  style={{ 
                    background: active ? 'rgba(30, 41, 59, 0.7)' : '#0f172a',
                    border: active ? '1px solid #334155' : '1px dashed #334155',
                    padding: '1rem 1.25rem',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '44px', height: '44px', background: '#0f172a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #1e293b' }}>
                      {s.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: active ? '#f8fafc' : '#64748b', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {s.title}
                        <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '12px', background: active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: active ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                          {active ? 'VISIBLE' : 'HIDDEN'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem', maxWidth: '280px' }}>
                        {s.desc}
                      </div>
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={() => handleToggle(s.key)}
                    className="admin-btn"
                    style={{ 
                      padding: '0.45rem 1rem', 
                      fontSize: '0.8rem', 
                      background: active ? 'rgba(239, 68, 68, 0.15)' : '#10b981', 
                      color: active ? '#ef4444' : '#fff', 
                      border: active ? '1px solid #ef4444' : 'none',
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {active ? <><EyeOff size={15} /> Hide Section</> : <><Eye size={15} /> Enable Section</>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
