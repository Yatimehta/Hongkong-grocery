import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Search, CheckCircle, XCircle, Trash2, Star, MessageSquare, AlertCircle } from 'lucide-react';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, avgRating: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [activeTab]);

  const fetchReviews = async (searchQuery = search) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reviews?status=${activeTab}&search=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error('Failed to load reviews');
      const data = await res.json();
      setReviews(data.reviews || []);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      toast.error(err.message || 'Error loading reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    fetchReviews(e.target.value);
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await fetch(`/api/reviews/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error();
      toast.success(`Review ${status.toLowerCase()}!`);
      fetchReviews();
    } catch (err) {
      toast.error('Failed to change review status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you certain you want to permanently delete this customer review?')) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Review deleted');
      fetchReviews();
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        size={14} 
        fill={i < rating ? '#f59e0b' : 'transparent'} 
        color={i < rating ? '#f59e0b' : '#64748b'} 
        style={{ marginRight: '2px' }}
      />
    ));
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Customer Reviews & Ratings</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Moderate product feedback, customer photos, and quality ratings from grocery shoppers.
          </p>
        </div>
      </div>

      {/* Summary KPI Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="admin-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #3b82f6' }}>
          <MessageSquare size={36} style={{ color: '#3b82f6' }} />
          <div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Total Reviews</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc' }}>{stats.total}</div>
          </div>
        </div>
        <div className="admin-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #f59e0b' }}>
          <AlertCircle size={36} style={{ color: '#f59e0b' }} />
          <div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Pending Approval</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f59e0b' }}>{stats.pending}</div>
          </div>
        </div>
        <div className="admin-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #10b981' }}>
          <Star size={36} style={{ color: '#f59e0b' }} fill="#f59e0b" />
          <div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Average Store Rating</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc' }}>{stats.avgRating} <span style={{ fontSize: '1rem', fontWeight: 400, color: '#94a3b8' }}>/ 5.0</span></div>
          </div>
        </div>
      </div>

      {/* Filter Tab Bar & Search */}
      <div className="admin-card" style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #1e293b', paddingBottom: '0.25rem' }}>
          {[
            { id: 'All', label: `All Reviews (${stats.total})` },
            { id: 'PENDING', label: `Pending Approval (${stats.pending})`, badgeColor: '#f59e0b' },
            { id: 'APPROVED', label: `Approved (${stats.approved})`, badgeColor: '#10b981' },
            { id: 'REJECTED', label: `Rejected (${stats.rejected})`, badgeColor: '#ef4444' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '0.5rem 1rem',
                color: activeTab === tab.id ? '#f8fafc' : '#94a3b8',
                fontWeight: activeTab === tab.id ? 600 : 400,
                borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                marginBottom: '-0.35rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input 
            type="text" 
            className="admin-input" 
            placeholder="Search customer, product or text..." 
            value={search} 
            onChange={handleSearchChange}
            style={{ paddingLeft: '2.4rem', width: '100%', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: '#94a3b8' }}>
            <MessageSquare size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 500, color: '#e2e8f0' }}>
              {activeTab === 'PENDING' 
                ? 'No pending reviews at the moment!'
                : activeTab === 'APPROVED'
                ? 'No approved reviews yet.'
                : activeTab === 'REJECTED'
                ? 'No rejected reviews.'
                : 'No product reviews found matching your search.'}
            </p>
            <p style={{ margin: '0.4rem 0', fontSize: '0.9rem' }}>
              {activeTab === 'PENDING' ? 'All customer feedback has been moderated.' : 'When shoppers leave feedback on your grocery products, it will appear here.'}
            </p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Rating</th>
                  <th style={{ width: '30%' }}>Review Snippet</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{r.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.customerEmail}</div>
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      <a href={`/products/${r.productId}`} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none' }}>
                        {r.product?.name || 'Product Deleted'}
                      </a>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>SKU: {r.product?.sku || 'N/A'}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {renderStars(r.rating)}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{r.rating} / 5</span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#cbd5e1', fontStyle: 'italic', lineHeight: '1.4' }}>
                      "{r.comment || 'No written comment provided.'}"
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <span style={{ 
                        padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                        backgroundColor: r.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.15)' : r.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: r.status === 'APPROVED' ? '#10b981' : r.status === 'REJECTED' ? '#ef4444' : '#f59e0b'
                      }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {r.status !== 'APPROVED' && (
                        <button 
                          className="admin-btn" 
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: '#10b981', border: 'none', marginRight: '0.4rem' }}
                          onClick={() => handleStatusUpdate(r.id, 'APPROVED')}
                          title="Approve Review"
                        >
                          <CheckCircle size={14} style={{ marginRight: '0.2rem' }} /> Approve
                        </button>
                      )}
                      {r.status !== 'REJECTED' && (
                        <button 
                          className="admin-btn outline" 
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderColor: '#ef4444', color: '#ef4444', marginRight: '0.4rem' }}
                          onClick={() => handleStatusUpdate(r.id, 'REJECTED')}
                          title="Reject Review"
                        >
                          <XCircle size={14} style={{ marginRight: '0.2rem' }} /> Reject
                        </button>
                      )}
                      <button className="icon-btn" onClick={() => handleDelete(r.id)} title="Delete Permanently" style={{ color: '#64748b' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
