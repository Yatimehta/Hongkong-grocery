import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Upload, FileText, CheckCircle, ArrowRight, ShieldCheck, Database, Play, AlertCircle } from 'lucide-react';

export default function BulkImport() {
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Import, 4: Done
  const [file, setFile] = useState(null);
  const [duplicatePolicy, setDuplicatePolicy] = useState('skip');
  const [imagePolicy, setImagePolicy] = useState('download');
  const [defaultStatus, setDefaultStatus] = useState('active');

  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      toast.success(`Selected file: ${selectedFile.name}`);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      toast.success(`Dropped file: ${droppedFile.name}`);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handlePreview = async () => {
    if (!file) {
      toast.error('Please upload or drop a CSV file first');
      return;
    }

    try {
      setParsing(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/migration/parse-csv', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to parse the CSV file.');
      }

      const data = await res.json();
      setParsedData(data);
      setStep(2);
      toast.success(`Parsed ${data.totalRows} products successfully!`);
    } catch (err) {
      toast.error(err.message || 'Error parsing CSV file');
    } finally {
      setParsing(false);
    }
  };

  const handleImport = async () => {
    if (!parsedData || !parsedData.rows) return;

    try {
      setImporting(true);
      setStep(3);

      const res = await fetch('/api/migration/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: parsedData.rows,
          duplicatePolicy,
          imagePolicy,
          defaultStatus,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to import products.');
      }

      const data = await res.json();
      setImportResult(data);
      setStep(4);
      toast.success('Product import finished!');
    } catch (err) {
      toast.error(err.message || 'Error importing products');
      setStep(2); // Go back to preview on failure
    } finally {
      setImporting(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setParsedData(null);
    setImportResult(null);
    setStep(1);
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Bulk Import</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Bulk Product Import — Import from WooCommerce CSV or XLSX export files
          </p>
        </div>
        {step > 1 && (
          <button className="admin-btn outline" onClick={resetAll}>
            Start Over
          </button>
        )}
      </div>

      {/* Stepper */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Upload File', num: 1 },
          { label: 'Preview', num: 2 },
          { label: 'Import', num: 3 },
          { label: 'Done', num: 4 },
        ].map((s) => {
          const isActive = step === s.num;
          const isCompleted = step > s.num;
          return (
            <div
              key={s.num}
              style={{
                background: isActive ? '#f97316' : '#1e293b',
                color: isActive ? '#fff' : isCompleted ? '#34d399' : '#94a3b8',
                padding: '0.75rem',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: 600,
                border: isCompleted ? '1px solid #10b981' : '1px solid transparent',
                transition: 'all 0.3s ease',
              }}
            >
              <span style={{ marginRight: '0.5rem' }}>{s.num}</span>
              {s.label}
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
            style={{
              background: '#0f172a',
              border: '2px dashed #f97316',
              borderRadius: '12px',
              padding: '4rem 2rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                background: 'rgba(249, 115, 22, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}
            >
              <Upload size={32} style={{ color: '#f97316' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#f8fafc', marginBottom: '0.5rem' }}>
              {file ? file.name : 'Drop your WooCommerce export here'}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              or click to browse your files
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              {['CSV', 'XLSX', 'WooCommerce Export'].map((badge) => (
                <span
                  key={badge}
                  style={{
                    background: '#1e293b',
                    color: '#e2e8f0',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv"
              style={{ display: 'none' }}
            />
          </div>

          {/* Import Settings Panel */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <div className="admin-card" style={{ padding: '1.25rem' }}>
              <label style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                Duplicate Products
              </label>
              <select
                className="admin-input"
                value={duplicatePolicy}
                onChange={(e) => setDuplicatePolicy(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="skip">Skip duplicates</option>
                <option value="update">Update existing products</option>
              </select>
            </div>

            <div className="admin-card" style={{ padding: '1.25rem' }}>
              <label style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                Product Images
              </label>
              <select
                className="admin-input"
                value={imagePolicy}
                onChange={(e) => setImagePolicy(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="download">Download images from URLs</option>
                <option value="ignore">Ignore external images</option>
              </select>
            </div>

            <div className="admin-card" style={{ padding: '1.25rem' }}>
              <label style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                Default Status
              </label>
              <select
                className="admin-input"
                value={defaultStatus}
                onChange={(e) => setDefaultStatus(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="active">Active (published)</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div style={{ textAlign: 'left', marginTop: '1rem' }}>
            <button
              className="admin-btn"
              onClick={handlePreview}
              disabled={parsing || !file}
              style={{
                background: '#f97316',
                border: 'none',
                color: '#fff',
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
              }}
            >
              {parsing ? 'Parsing File...' : 'Preview File'} <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && parsedData && (
        <div className="admin-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#f8fafc', marginBottom: '1rem' }}>
            Import Preview ({parsedData.totalRows} products found)
          </h2>
          <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
            <table className="admin-table" style={{ width: '100%', minWidth: '600px' }}>
              <thead>
                <tr>
                  {parsedData.headers.slice(0, 5).map((h, i) => (
                    <th key={i}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedData.sampleRows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {parsedData.headers.slice(0, 5).map((h, colIndex) => (
                      <td key={colIndex} style={{ color: '#cbd5e1' }}>
                        {row[h]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              className="admin-btn"
              onClick={handleImport}
              style={{
                background: '#f97316',
                border: 'none',
                color: '#fff',
                padding: '0.75rem 2rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Database size={18} /> Run Product Import
            </button>
            <button className="admin-btn outline" onClick={() => setStep(1)}>
              Back to Upload
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
          <Database size={48} className="animate-pulse" style={{ margin: '0 auto 1.5rem', color: '#f97316' }} />
          <h2>Importing Catalog...</h2>
          <p style={{ marginTop: '0.5rem' }}>Please wait while products are synchronized to your database.</p>
        </div>
      )}

      {step === 4 && importResult && (
        <div className="admin-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <CheckCircle size={48} style={{ color: '#10b981' }} />
          </div>
          <h2 style={{ color: '#f8fafc', marginBottom: '0.5rem' }}>Catalog Sync Completed!</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
            WooCommerce products and inventory levels are now synchronized.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.5rem',
              maxWidth: '600px',
              margin: '0 auto 2rem',
            }}
          >
            <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ color: '#10b981', fontSize: '2rem', fontWeight: 800 }}>{importResult.created}</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Products Created</div>
            </div>
            <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ color: '#3b82f6', fontSize: '2rem', fontWeight: 800 }}>{importResult.updated}</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Products Updated</div>
            </div>
            <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ color: '#ef4444', fontSize: '2rem', fontWeight: 800 }}>{importResult.errorCount}</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Errors</div>
            </div>
          </div>

          {importResult.errors && importResult.errors.length > 0 && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'left',
                maxWidth: '600px',
                margin: '0 auto 2rem',
                maxHeight: '150px',
                overflowY: 'auto',
              }}
            >
              <h4 style={{ color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0 0 0.5rem 0' }}>
                <AlertCircle size={16} /> Import Warnings & Errors
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#fca5a5' }}>
                {importResult.errors.map((err, idx) => (
                  <li key={idx} style={{ marginBottom: '0.25rem' }}>
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            className="admin-btn"
            onClick={resetAll}
            style={{ background: '#f97316', border: 'none', padding: '0.75rem 2rem' }}
          >
            Start New Import
          </button>
        </div>
      )}
    </div>
  );
}
