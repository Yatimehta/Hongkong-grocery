import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertTriangle, RefreshCw, Layers, ArrowRight, Zap } from 'lucide-react';

export default function ProductMigration() {
  // CSV parse & import states
  const [csvText, setCsvText] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [loadingParse, setLoadingParse] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Column mapping states
  const [columnMapping, setColumnMapping] = useState({
    name: 'Name',
    sku: 'SKU',
    price: 'Price',
    stock: 'Stock',
    category: 'Category',
    unit: 'Unit',
    image: 'Image'
  });

  // Bulk stock & price modification states
  const [categories, setCategories] = useState([]);
  const [bulkAction, setBulkAction] = useState('increase_price_percent');
  const [bulkValue, setBulkValue] = useState(5);
  const [targetCategory, setTargetCategory] = useState('all');
  const [modifying, setModifying] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) setCategories(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoadingParse(true);
      const res = await fetch('/api/migration/parse-csv', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse CSV');
      setupParsedData(data);
      toast.success(`Parsed ${data.totalRows} rows from ${file.name}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingParse(false);
    }
  };

  const handleTextParse = async () => {
    if (!csvText.trim()) return toast.error('Please enter CSV formatted text');
    try {
      setLoadingParse(true);
      const res = await fetch('/api/migration/parse-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse text');
      setupParsedData(data);
      toast.success(`Parsed ${data.totalRows} product rows from text input`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingParse(false);
    }
  };

  const setupParsedData = (data) => {
    setParsedData(data);
    setImportResult(null);
    // Auto-map column names if matching headers exist
    const headers = data.headers.map(h => h.toLowerCase());
    const newMap = { ...columnMapping };
    data.headers.forEach(h => {
      const lower = h.toLowerCase();
      if (lower.includes('name') || lower.includes('title')) newMap.name = h;
      if (lower.includes('sku') || lower.includes('code') || lower.includes('barcode')) newMap.sku = h;
      if (lower.includes('price') || lower.includes('cost') || lower.includes('rate')) newMap.price = h;
      if (lower.includes('stock') || lower.includes('qty') || lower.includes('quantity')) newMap.stock = h;
      if (lower.includes('category') || lower.includes('dept') || lower.includes('department')) newMap.category = h;
      if (lower.includes('unit') || lower.includes('weight') || lower.includes('pack')) newMap.unit = h;
      if (lower.includes('image') || lower.includes('photo') || lower.includes('url')) newMap.image = h;
    });
    setColumnMapping(newMap);
  };

  const handleImport = async () => {
    if (!parsedData || parsedData.rows.length === 0) return toast.error('No parsed rows ready for import');
    if (!window.confirm(`Ready to import or update ${parsedData.rows.length} product records? Matching SKUs will be automatically updated with new prices and inventory levels.`)) return;

    try {
      setImporting(true);
      // Map rows according to columnMapping
      const mappedItems = parsedData.rows.map(r => ({
        name: r[columnMapping.name] || '',
        sku: r[columnMapping.sku] || '',
        price: r[columnMapping.price] || 0,
        stock: r[columnMapping.stock] || 0,
        category: r[columnMapping.category] || '',
        unit: r[columnMapping.unit] || 'piece',
        image: r[columnMapping.image] || ''
      }));

      const res = await fetch('/api/migration/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: mappedItems })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');

      setImportResult(data);
      toast.success(`Import finished! Created ${data.created}, Updated ${data.updated} products.`);
    } catch (err) {
      toast.error(err.message || 'Import error');
    } finally {
      setImporting(false);
    }
  };

  const handleBulkModify = async () => {
    const confirmMsg = `Are you certain you want to apply "${bulkAction.replace(/_/g, ' ')}" to all matching grocery products? This immediately changes live store pricing or stock levels!`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setModifying(true);
      const res = await fetch('/api/migration/bulk-modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: bulkAction, value: bulkValue, categoryId: targetCategory })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bulk modification failed');
      toast.success(data.message || 'Bulk adjustment applied successfully!');
    } catch (err) {
      toast.error(err.message || 'Modification failed');
    } finally {
      setModifying(false);
    }
  };

  const sampleCSV = `Name,SKU,Price,Stock,Category,Unit,Image\nOrganic Fuji Apples,FRUIT-001,4.99,150,Fruits & Vegetables,1kg bag,/uploads/apples.jpg\nFarm Fresh Brown Eggs,DAIRY-102,5.49,85,Dairy & Eggs,Dozen (12 pcs),/uploads/eggs.jpg\nArtisan Sourdough Loaf,BAKE-205,3.99,40,Bakery,1 loaf,/uploads/bread.jpg`;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileSpreadsheet style={{ color: '#10b981' }} /> Product Data Migration & Bulk Import
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Import inventory catalogs from CSV/Excel sheets, map custom column fields, and run storewide batch stock adjustments.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* SECTION 1: CSV IMPORT ENGINE */}
        <div className="admin-card" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
          <h2 style={{ fontSize: '1.15rem', color: '#f8fafc', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Upload style={{ color: '#38bdf8' }} size={20} /> Step 1: Upload or Paste Grocery Product Catalog (CSV)
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
            Upload a `.csv` file exported from Excel, Square, Shopify, or another point-of-sale system, or copy/paste CSV text directly below.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ background: '#0f172a', border: '2px dashed #334155', borderRadius: '10px', padding: '2rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <FileSpreadsheet size={40} style={{ color: '#10b981', marginBottom: '0.75rem' }} />
              <p style={{ fontWeight: 600, color: '#e2e8f0', margin: '0 0 0.25rem 0' }}>Upload CSV File</p>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 1rem 0' }}>Supported columns: Name, SKU, Price, Stock, Category, Unit</p>
              <label className="admin-btn" style={{ cursor: loadingParse ? 'wait' : 'pointer', margin: 0 }}>
                {loadingParse ? 'Reading File...' : 'Select CSV File'}
                <input type="file" accept=".csv,text/csv" onChange={handleFileUpload} style={{ display: 'none' }} disabled={loadingParse} />
              </label>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>Or Paste CSV Text Directly:</label>
                <button className="admin-btn outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', margin: 0 }} onClick={() => setCsvText(sampleCSV)}>
                  Load Sample Data
                </button>
              </div>
              <textarea 
                className="admin-input" 
                rows="6" 
                placeholder="Paste comma-separated items here..." 
                value={csvText} 
                onChange={e => setCsvText(e.target.value)}
                style={{ fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.4', marginBottom: '0.75rem', width: '100%' }}
              />
              <button className="admin-btn" style={{ width: '100%', background: '#3b82f6' }} onClick={handleTextParse} disabled={loadingParse || !csvText.trim()}>
                Parse Pasted CSV Content
              </button>
            </div>
          </div>

          {/* PARSED PREVIEW & COLUMN MAPPING */}
          {parsedData && (
            <div style={{ marginTop: '2rem', borderTop: '2px solid #1e293b', paddingTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', color: '#f8fafc', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={18} style={{ color: '#f59e0b' }} /> Step 2: Map CSV Headers to Grocery Store Schema
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
                We found <strong>{parsedData.totalRows} products</strong> across <strong>{parsedData.headers.length} columns</strong>. Ensure the columns below match your intended store fields:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', background: '#0f172a', padding: '1.25rem', borderRadius: '8px', border: '1px solid #334155', marginBottom: '1.5rem' }}>
                {Object.keys(columnMapping).map(field => (
                  <div key={field} className="form-group" style={{ margin: 0 }}>
                    <label style={{ textTransform: 'capitalize', fontSize: '0.8rem', color: '#38bdf8' }}>
                      {field === 'image' ? 'Image URL' : field} {field === 'name' || field === 'price' ? '*' : ''}
                    </label>
                    <select 
                      className="admin-input" 
                      value={columnMapping[field]} 
                      onChange={e => setColumnMapping({ ...columnMapping, [field]: e.target.value })}
                      style={{ fontSize: '0.85rem', padding: '0.4rem' }}
                    >
                      <option value="">-- Leave Blank --</option>
                      {parsedData.headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Sample Rows Preview Table */}
              <h4 style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>Sample Data Preview (First 5 Rows):</h4>
              <div className="admin-table-container" style={{ marginBottom: '1.5rem' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      {Object.keys(columnMapping).map(f => (
                        <th key={f} style={{ textTransform: 'capitalize' }}>{f} ({columnMapping[f] || 'Unmapped'})</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.sampleRows.map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600, color: '#f8fafc' }}>{row[columnMapping.name] || '-'}</td>
                        <td style={{ fontFamily: 'monospace', color: '#60a5fa' }}>{row[columnMapping.sku] || '-'}</td>
                        <td style={{ color: '#10b981', fontWeight: 600 }}>${row[columnMapping.price] || '0.00'}</td>
                        <td>{row[columnMapping.stock] || '0'}</td>
                        <td><span style={{ background: '#1e293b', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>{row[columnMapping.category] || 'General'}</span></td>
                        <td>{row[columnMapping.unit] || 'piece'}</td>
                        <td style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row[columnMapping.image] || 'None'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* IMPORT EXECUTION & FEEDBACK */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', padding: '1rem', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#f8fafc' }}>Ready to synchronize with live catalog?</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Existing SKUs will be updated with new prices & inventory levels. Missing SKUs will be inserted as new products.</div>
                </div>
                <button 
                  className="admin-btn" 
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: 700 }}
                  onClick={handleImport}
                  disabled={importing}
                >
                  {importing ? 'Importing Products & Stock...' : `Execute Batch Import (${parsedData.totalRows} Items)`}
                </button>
              </div>

              {/* Import Results Box */}
              {importResult && (
                <div style={{ marginTop: '1.25rem', background: '#0f172a', border: '1px solid #10b981', padding: '1.25rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: importResult.errors?.length > 0 ? '1rem' : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 700, fontSize: '1.1rem' }}>
                      <CheckCircle size={24} /> Import Completed
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.95rem' }}>
                      <span>New Items Created: <strong style={{ color: '#34d399' }}>{importResult.created}</strong></span>
                      <span>Existing Items Updated: <strong style={{ color: '#60a5fa' }}>{importResult.updated}</strong></span>
                      <span>Row Errors: <strong style={{ color: importResult.errorCount > 0 ? '#ef4444' : '#94a3b8' }}>{importResult.errorCount}</strong></span>
                    </div>
                  </div>

                  {importResult.errors?.length > 0 && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.75rem', borderRadius: '6px', maxHeight: '150px', overflowY: 'auto', fontSize: '0.85rem', color: '#fca5a5' }}>
                      <strong style={{ display: 'block', marginBottom: '0.3rem', color: '#ef4444' }}>Skipped / Error Rows:</strong>
                      {importResult.errors.map((err, idx) => (
                        <div key={idx} style={{ marginBottom: '0.2rem' }}>• {err}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION 2: BULK STOCK & PRICE ADJUSTMENT ENGINE */}
        <div className="admin-card" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
          <h2 style={{ fontSize: '1.15rem', color: '#f8fafc', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap style={{ color: '#f59e0b' }} size={20} /> Storewide Bulk Stock & Price Adjustment Rules
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
            Quickly adjust prices to account for supplier inflation or reset seasonal inventory levels in one click without editing items individually.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'flex-end', background: '#0f172a', padding: '1.25rem', borderRadius: '8px', border: '1px solid #334155' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>Target Category</label>
              <select className="admin-input" value={targetCategory} onChange={e => setTargetCategory(e.target.value)}>
                <option value="all">Every Product in Store (All Categories)</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>Modification Rule</label>
              <select className="admin-input" value={bulkAction} onChange={e => setBulkAction(e.target.value)}>
                <option value="increase_price_percent">Increase Price by (%)</option>
                <option value="decrease_price_percent">Decrease Price by (%)</option>
                <option value="add_stock">Add Stock Units (Increment)</option>
                <option value="set_stock">Set Exact Stock Units To</option>
                <option value="zero_out_of_stock">Zero out Negative Stock Levels</option>
              </select>
            </div>

            {bulkAction !== 'zero_out_of_stock' && (
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>Value Amount</label>
                <input 
                  type="number" 
                  step="any" 
                  className="admin-input" 
                  value={bulkValue} 
                  onChange={e => setBulkValue(e.target.value)} 
                  placeholder="e.g. 5"
                />
              </div>
            )}

            <button 
              className="admin-btn" 
              style={{ background: '#3b82f6', height: '42px', padding: '0 1.5rem', fontWeight: 700 }}
              onClick={handleBulkModify}
              disabled={modifying}
            >
              {modifying ? 'Updating Database...' : 'Apply Adjustment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
