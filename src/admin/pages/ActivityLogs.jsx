import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ShieldAlert, Search, Trash2, RefreshCw, Clock, User, FileText, Activity, Terminal } from 'lucide-react';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(50);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [search, limit]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/logs?search=${encodeURIComponent(search)}&limit=${limit}`);
      if (!res.ok) throw new Error('Failed to retrieve activity logs');
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      toast.error(err.message || 'Error loading audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to prune and clear all historical system audit trails? This action cannot be reversed.')) return;

    try {
      setClearing(true);
      const res = await fetch('/api/logs/clear', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to clear log history');
      toast.success('Historical audit logs successfully pruned');
      fetchLogs();
    } catch (err) {
      toast.error(err.message || 'Clear operation failed');
    } finally {
      setClearing(false);
    }
  };

  const getActionStyle = (action) => {
    const lower = (action || '').toLowerCase();
    if (lower.includes('create') || lower.includes('import') || lower.includes('add')) {
      return { color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)' };
    }
    if (lower.includes('delete') || lower.includes('revoke') || lower.includes('clear') || lower.includes('remove')) {
      return { color: '#f87171', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)' };
    }
    if (lower.includes('update') || lower.includes('modify') || lower.includes('adjust')) {
      return { color: '#60a5fa', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)' };
    }
    return { color: '#a78bfa', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)' };
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity style={{ color: '#f59e0b' }} /> Admin Activity Audit & System Action Trail
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Monitor real-time staff operations, track catalog modifications, and audit administrative account actions.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="admin-btn outline" onClick={fetchLogs} title="Refresh Logs" style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button 
            className="admin-btn" 
            onClick={handleClearLogs} 
            disabled={clearing || logs.length === 0}
            style={{ background: '#ef4444', margin: 0, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Trash2 size={16} /> Prune Old Logs
          </button>
        </div>
      </div>

      {/* FILTER SEARCH BAR */}
      <div className="admin-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input 
            type="text"
            className="admin-input"
            placeholder="Filter audit trail by action name, staff member, or affected module target..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem', width: '100%', margin: 0 }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Display records:</label>
          <select className="admin-input" value={limit} onChange={e => setLimit(Number(e.target.value))} style={{ width: 'auto', margin: 0, padding: '0.4rem 1.5rem 0.4rem 0.6rem' }}>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="250">250</option>
          </select>
        </div>
      </div>

      {/* AUDIT LOGS TABLE */}
      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 1rem', display: 'block' }} />
            Loading Audit History...
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
            <Terminal size={48} style={{ margin: '0 auto 1rem', color: '#334155', opacity: 0.5 }} />
            <p style={{ fontSize: '1.1rem', color: '#94a3b8', margin: 0 }}>No audit activity recorded yet.</p>
            <p style={{ fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>Actions taken across the 28 admin modules will appear here automatically.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '180px' }}>Action Type</th>
                  <th style={{ width: '140px' }}>Admin / User</th>
                  <th style={{ width: '160px' }}>Target Module</th>
                  <th>Operation Details & Notes</th>
                  <th style={{ width: '170px', textAlign: 'right' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const style = getActionStyle(log.action);
                  return (
                    <tr key={log.id || Math.random()}>
                      <td>
                        <span style={{ padding: '0.25rem 0.65rem', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', display: 'inline-block', ...style }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <User size={15} style={{ color: '#60a5fa' }} /> {log.user || 'System'}
                        </div>
                      </td>
                      <td style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600 }}>{log.target || 'General'}</td>
                      <td style={{ color: '#cbd5e1', fontSize: '0.85rem', lineHeight: '1.4' }}>{log.details || 'No extended details provided.'}</td>
                      <td style={{ textAlign: 'right', fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Just now'}
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
  );
}
