import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ShieldCheck, Search, Zap, Terminal } from 'lucide-react';

export default function ImageConverter() {
  const [scanning, setScanning] = useState(false);
  const [legacyCount, setLegacyCount] = useState(0);
  const [totalImages, setTotalImages] = useState('—');
  const [convertedCount, setConvertedCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [spaceSaved, setSpaceSaved] = useState('0 KB');
  const [convertingBulk, setConvertingBulk] = useState(false);
  
  const [logs, setLogs] = useState([
    '[ready] Scan karo, phir Convert karo...'
  ]);

  useEffect(() => {
    // Initial scan on load
    runScan(true);
  }, []);

  const addLog = (message) => {
    setLogs((prev) => [...prev, message]);
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const runScan = async (silent = false) => {
    try {
      setScanning(true);
      if (!silent) {
        addLog('[system] Scanning database and media library folders...');
      }
      const res = await fetch('/api/converter/scan');
      if (!res.ok) throw new Error('Failed to scan media library');
      const data = await res.json();
      
      setLegacyCount(data.count || 0);
      setTotalImages(String(data.count || 0));
      
      if (!silent) {
        addLog(`[scan] Completed! Found ${data.count} legacy JPEG/PNG images.`);
      }
    } catch (err) {
      if (!silent) {
        addLog(`[error] Scan failed: ${err.message}`);
      }
      toast.error('Could not scan library for legacy images');
    } finally {
      setScanning(false);
    }
  };

  const handleBulkConvert = async () => {
    if (legacyCount === 0) {
      addLog('[info] No legacy images to convert. Scan first or upload new ones.');
      toast.error('No legacy PNG/JPEG files found in repository');
      return;
    }

    try {
      setConvertingBulk(true);
      addLog(`[conversion] Initializing WebP conversion engine for ${legacyCount} files...`);
      addLog('[conversion] Re-writing image database references in-place...');
      
      const res = await fetch('/api/converter/bulk-convert', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bulk conversion failed');

      setConvertedCount(data.convertedCount || 0);
      setSpaceSaved(formatBytes(data.totalBytesSaved));
      addLog(`[success] Successfully converted ${data.convertedCount} images to WebP!`);
      addLog(`[success] Saved ${formatBytes(data.totalBytesSaved)} of disk payload.`);
      
      toast.success(data.message || 'Bulk WebP conversion completed successfully!');
      
      // Update legacy count to 0
      setLegacyCount(0);
    } catch (err) {
      setErrorCount((prev) => prev + 1);
      addLog(`[error] Conversion error: ${err.message}`);
      toast.error(err.message || 'Error during batch conversion');
    } finally {
      setConvertingBulk(false);
    }
  };

  return (
    <div>
      <div className="admin-page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1>Image → WebP Converter</h1>
          <div style={{ marginTop: '0.5rem' }}>
            <span style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid #10b981',
              color: '#34d399',
              padding: '0.25rem 0.6rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <ShieldCheck size={14} /> WebP supported via GD
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Statistics Card */}
        <div className="admin-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📊 Statistics
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.5rem',
            marginBottom: '1.5rem',
            borderBottom: '1px solid #1e293b',
            paddingBottom: '1.5rem'
          }}>
            {/* Total Images */}
            <div>
              <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Images</div>
              <div style={{ color: '#3b82f6', fontSize: '2.5rem', fontWeight: 800, marginTop: '0.25rem' }}>{totalImages}</div>
            </div>
            
            {/* Converted */}
            <div>
              <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Converted</div>
              <div style={{ color: '#10b981', fontSize: '2.5rem', fontWeight: 800, marginTop: '0.25rem' }}>{convertedCount}</div>
            </div>

            {/* Errors */}
            <div>
              <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Errors</div>
              <div style={{ color: '#ef4444', fontSize: '2.5rem', fontWeight: 800, marginTop: '0.25rem' }}>{errorCount}</div>
            </div>

            {/* Space Saved */}
            <div>
              <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Space Saved</div>
              <div style={{ color: '#f59e0b', fontSize: '2.5rem', fontWeight: 800, marginTop: '0.25rem' }}>{spaceSaved}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => runScan(false)}
              disabled={scanning || convertingBulk}
              style={{
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                padding: '0.6rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Search size={16} /> Scan Images
            </button>
            <button
              onClick={handleBulkConvert}
              disabled={convertingBulk || scanning}
              style={{
                background: '#f97316',
                border: 'none',
                color: '#fff',
                padding: '0.6rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Zap size={16} /> Convert All to WebP
            </button>
          </div>
        </div>

        {/* Conversion Log */}
        <div className="admin-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📋 Conversion Log
          </h3>
          
          <div style={{
            background: '#090d16',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            padding: '1rem',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            color: '#38bdf8',
            minHeight: '200px',
            maxHeight: '350px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem'
          }}>
            {logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
