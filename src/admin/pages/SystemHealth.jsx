import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ShieldCheck, Server, Database, Activity, Cpu, Clock, HardDrive, Download, Upload, CheckCircle, AlertTriangle, RefreshCw, Layers } from 'lucide-react';

export default function SystemHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const [restoreResult, setRestoreResult] = useState(null);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000); // Auto refresh ping every 15s
    return () => clearInterval(interval);
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/system/health');
      if (!res.ok) throw new Error('System diagnostic unreachable');
      const data = await res.json();
      setHealth(data);
    } catch (err) {
      toast.error(err.message || 'Error checking server health');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackup = () => {
    toast.success('Initiating full database catalog & configuration backup export...');
    window.open('/api/system/backup', '_blank');
  };

  const handleRestoreUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      return toast.error('Please select a valid JSON database backup dump file.');
    }

    if (!window.confirm(`Are you certain you want to evaluate and merge records from "${file.name}" into the live store database?`)) return;

    try {
      setRestoring(true);
      const fileContent = await file.text();
      let payload;
      try {
        payload = JSON.parse(fileContent);
      } catch(e) {
        throw new Error('Corrupted or unreadable JSON backup syntax.');
      }

      const res = await fetch('/api/system/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: payload.data || payload })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Restore operation failed');

      setRestoreResult(result);
      toast.success(result.message || 'Database recovery synchronization complete!');
      fetchHealth();
    } catch (err) {
      toast.error(err.message || 'Failed to restore backup dump');
    } finally {
      setRestoring(false);
    }
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>Executing system health & database diagnostics...</div>;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Server style={{ color: '#10b981' }} /> System Health & Database Backup Recovery
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Monitor real-time infrastructure performance, check ORM database latencies, and execute catalog snapshot backups.
          </p>
        </div>
        <button className="admin-btn outline" onClick={fetchHealth} title="Ping Database & Server" style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <RefreshCw size={16} /> Run Diagnostics
        </button>
      </div>

      {/* DIAGNOSTIC METRIC CARDS */}
      {health && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          
          <div className="admin-card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <Database size={26} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Database ORM Status</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {health.database?.status} <span style={{ fontSize: '0.8rem', color: '#34d399', background: '#0f172a', padding: '0.15rem 0.5rem', borderRadius: '12px', fontWeight: 600 }}>{health.database?.pingMs} ms ping</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>{health.database?.engine}</div>
            </div>
          </div>

          <div className="admin-card" style={{ padding: '1.25rem', borderLeft: '4px solid #3b82f6', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
              <Cpu size={26} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Memory & Server Load</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
                {health.server?.memoryUsedMb} MB <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 400 }}>RSS RAM</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>{health.server?.cpuCores} CPU Cores • Node {health.server?.nodeVersion}</div>
            </div>
          </div>

          <div className="admin-card" style={{ padding: '1.25rem', borderLeft: '4px solid #a855f7', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
              <Clock size={26} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Process Continuous Uptime</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
                {health.server?.uptime}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Host: {health.server?.platform}</div>
            </div>
          </div>

          <div className="admin-card" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
              <Layers size={26} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Active Catalog Density</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
                {health.catalogSummary?.products || 0} Items <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 400 }}>in DB</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>{health.catalogSummary?.orders || 0} Orders • {health.catalogSummary?.customers || 0} Shoppers</div>
            </div>
          </div>

        </div>
      )}

      {/* SECTION 2: BACKUP & RECOVERY ENGINE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* BACKUP DOWNLOAD CARD */}
        <div className="admin-card" style={{ padding: '1.75rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '280px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '1.25rem' }}>
            <Download size={32} />
          </div>
          <h2 style={{ fontSize: '1.25rem', color: '#f8fafc', margin: '0 0 0.5rem 0' }}>Download Complete Store Backup</h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 1.5rem 0', maxWidth: '380px', lineHeight: '1.5' }}>
            Exports your full inventory catalog, pricing rules, order logs, customers, blog posts, and store configurations into a portable timestamped JSON snapshot.
          </p>
          <button 
            className="admin-btn" 
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            onClick={handleDownloadBackup}
          >
            <Download size={18} /> Export Full JSON Snapshot
          </button>
          <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.75rem' }}>Recommended weekly to ensure redundant disaster recovery</span>
        </div>

        {/* RESTORE RECOVERY CARD */}
        <div className="admin-card" style={{ padding: '1.75rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '280px', border: '1px dashed #334155' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', marginBottom: '1.25rem' }}>
            <Upload size={32} />
          </div>
          <h2 style={{ fontSize: '1.25rem', color: '#f8fafc', margin: '0 0 0.5rem 0' }}>Restore Database from Backup</h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 1.5rem 0', maxWidth: '380px', lineHeight: '1.5' }}>
            Upload a previously exported `.json` database dump file to automatically evaluate, recover, and synchronize missing product lines or settings.
          </p>
          <label className="admin-btn" style={{ background: '#3b82f6', cursor: restoring ? 'wait' : 'pointer', margin: 0, padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Upload size={18} /> {restoring ? 'Synchronizing Records...' : 'Select Backup File (.json)'}
            <input type="file" accept=".json,application/json" onChange={handleRestoreUpload} style={{ display: 'none' }} disabled={restoring} />
          </label>

          {restoreResult && (
            <div style={{ marginTop: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', padding: '0.6rem 1rem', borderRadius: '6px', color: '#34d399', fontSize: '0.82rem', fontWeight: 600 }}>
              ✓ Recovered {restoreResult.restoredCount} database entities successfully
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
