import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Upload, Trash2, Search, Grid, List, Copy, ExternalLink, Image as ImageIcon, FileText, Film, Folder, AlertTriangle, Check } from 'lucide-react';

export default function MediaLibrary() {
  const [files, setFiles] = useState([]);
  const [counts, setCounts] = useState({ all: 0, products: 0, banners: 0, blogs: 0, brands: 0, general: 0 });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [activeFolder, setActiveFolder] = useState('all');
  const [activeType, setActiveType] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const folders = [
    { id: 'all', label: 'All Media', count: counts.all },
    { id: 'products', label: 'Products', count: counts.products },
    { id: 'banners', label: 'Banners & Hero', count: counts.banners },
    { id: 'blogs', label: 'Blog Covers', count: counts.blogs },
    { id: 'brands', label: 'Brand Logos', count: counts.brands },
    { id: 'general', label: 'General / Other', count: counts.general }
  ];

  useEffect(() => {
    fetchMedia();
  }, [activeFolder, activeType]);

  const fetchMedia = async (searchQuery = search) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/media?folder=${activeFolder}&type=${activeType}&search=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error('Failed to fetch media library');
      const data = await res.json();
      setFiles(data.files || []);
      if (data.counts) setCounts(data.counts);
    } catch (err) {
      toast.error(err.message || 'Error loading media files');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    fetchMedia(e.target.value);
  };

  const handleFileUpload = async (e) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    const folderTarget = activeFolder === 'all' ? 'general' : activeFolder;
    setUploading(true);
    let successCount = 0;

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      if (file.size > 25 * 1024 * 1024) {
        toast.error(`Skipping ${file.name}: Exceeds 25MB file size limit`);
        continue;
      }
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folderTarget);

      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (res.ok) successCount++;
        else toast.error(`Failed to upload ${file.name}`);
      } catch (err) {
        toast.error(`Upload error for ${file.name}`);
      }
    }

    setUploading(false);
    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} media asset${successCount > 1 ? 's' : ''}!`);
      fetchMedia();
    }
    e.target.value = ''; // reset file input
  };

  const handleCopyUrl = (file) => {
    navigator.clipboard.writeText(window.location.origin + file.url);
    setCopiedId(file.id);
    toast.success('File URL copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (file) => {
    try {
      // Step 1: Perform usage safety check!
      const checkRes = await fetch(`/api/media/${file.id}/check-usage`);
      const usage = await checkRes.json();

      let confirmMsg = `Are you certain you want to permanently delete "${file.filename}"?`;
      if (usage.isUsed && usage.usedBy?.length > 0) {
        confirmMsg = `⚠️ WARNING: This photo is actively used by:\n\n• ${usage.usedBy.join('\n• ')}\n\nDeleting it WILL CAUSE BROKEN IMAGES on your storefront! Do you really want to force delete?`;
      }

      if (!window.confirm(confirmMsg)) return;

      // Step 2: Proceed with deletion
      const delRes = await fetch(`/api/media/${file.id}`, { method: 'DELETE' });
      if (!delRes.ok) throw new Error('Failed to delete media file');

      toast.success('Media file deleted from server and database!');
      fetchMedia();
    } catch (err) {
      toast.error(err.message || 'Error checking or deleting file');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const renderIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return <ImageIcon size={24} style={{ color: '#60a5fa' }} />;
    if (mimeType?.startsWith('video/')) return <Film size={24} style={{ color: '#f59e0b' }} />;
    return <FileText size={24} style={{ color: '#10b981' }} />;
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Media & Asset Library</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Browse, categorize, and upload product photos, banners, and blog images across your grocery store.
          </p>
        </div>
        <div>
          <label className="admin-btn" style={{ cursor: uploading ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Upload size={18} /> {uploading ? 'Uploading assets...' : 'Upload Media Files'}
            <input type="file" multiple onChange={handleFileUpload} style={{ display: 'none' }} disabled={uploading} accept="image/*,video/*,.pdf,.doc,.docx" />
          </label>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Folder Navigation Sidebar */}
        <div className="admin-card" style={{ padding: '1rem' }}>
          <h3 style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Folder size={16} /> Asset Folders
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {folders.map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFolder(f.id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: activeFolder === f.id ? '#3b82f6' : 'transparent',
                  color: activeFolder === f.id ? '#ffffff' : '#e2e8f0',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: activeFolder === f.id ? 600 : 400,
                  textAlign: 'left',
                  transition: 'background 0.2s'
                }}
              >
                <span>{f.label}</span>
                <span style={{ 
                  background: activeFolder === f.id ? 'rgba(255,255,255,0.25)' : '#1e293b', 
                  color: activeFolder === f.id ? '#fff' : '#94a3b8',
                  padding: '0.15rem 0.5rem', 
                  borderRadius: '12px', 
                  fontSize: '0.75rem', 
                  fontWeight: 600 
                }}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Library Area */}
        <div className="admin-card" style={{ padding: '1.25rem' }}>
          {/* Top Filter and View Mode Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #334155' }}>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {['All', 'Images', 'Videos', 'Documents'].map(type => (
                <button
                  key={type}
                  className={`admin-btn ${activeType === type ? '' : 'outline'}`}
                  style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem', margin: 0 }}
                  onClick={() => setActiveType(type)}
                >
                  {type}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ position: 'relative', width: '240px' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input 
                  type="text" 
                  className="admin-input" 
                  placeholder="Filter filenames..." 
                  value={search} 
                  onChange={handleSearchChange}
                  style={{ paddingLeft: '2.3rem', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', background: '#0f172a', padding: '0.2rem', borderRadius: '6px', border: '1px solid #334155' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{ background: viewMode === 'grid' ? '#334155' : 'transparent', border: 'none', color: '#f8fafc', padding: '0.3rem', borderRadius: '4px', cursor: 'pointer' }}
                  title="Grid View"
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  style={{ background: viewMode === 'list' ? '#334155' : 'transparent', border: 'none', color: '#f8fafc', padding: '0.3rem', borderRadius: '4px', cursor: 'pointer' }}
                  title="List View"
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading media files...</div>
          ) : files.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
              <ImageIcon size={54} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p style={{ fontSize: '1.1rem', color: '#e2e8f0', fontWeight: 500 }}>No media files in this folder.</p>
              <p style={{ margin: '0.4rem 0 1.5rem', fontSize: '0.9rem' }}>Drop photos above to populate your media repository.</p>
            </div>
          ) : viewMode === 'grid' ? (
            /* GRID VIEW */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '1.25rem' }}>
              {files.map(file => (
                <div key={file.id} style={{ background: '#0f172a', borderRadius: '8px', border: '1px solid #334155', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '140px', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                    {file.mimeType?.startsWith('image/') ? (
                      <img src={file.url} alt={file.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    ) : (
                      renderIcon(file.mimeType)
                    )}
                    <div style={{ position: 'absolute', top: '0.4rem', right: '0.4rem', background: 'rgba(0,0,0,0.65)', padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 600 }}>
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                  <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.2rem' }} title={file.filename}>
                        {file.filename}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Uploaded {new Date(file.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #1e293b' }}>
                      <button 
                        className="admin-btn outline" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        onClick={() => handleCopyUrl(file)}
                        title="Copy file URL"
                      >
                        {copiedId === file.id ? <Check size={13} color="#10b981" /> : <Copy size={13} />} 
                        {copiedId === file.id ? 'Copied' : 'Copy URL'}
                      </button>
                      <button 
                        className="icon-btn" 
                        onClick={() => handleDelete(file)} 
                        title="Delete File (checks usage)" 
                        style={{ color: '#ef4444' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* LIST VIEW */
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Preview</th>
                    <th>File Name</th>
                    <th>Folder</th>
                    <th>File Size</th>
                    <th>Upload Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map(file => (
                    <tr key={file.id}>
                      <td style={{ width: '64px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '4px', overflow: 'hidden', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {file.mimeType?.startsWith('image/') ? (
                            <img src={file.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            renderIcon(file.mimeType)
                          )}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: '#f8fafc' }}>
                        {file.filename}
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{file.mimeType}</div>
                      </td>
                      <td><span style={{ textTransform: 'capitalize', color: '#38bdf8', fontSize: '0.85rem' }}>{file.folder}</span></td>
                      <td style={{ fontFamily: 'monospace', color: '#cbd5e1', fontSize: '0.85rem' }}>{formatFileSize(file.size)}</td>
                      <td style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{new Date(file.createdAt).toLocaleDateString()}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="admin-btn outline" 
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', marginRight: '0.5rem' }}
                          onClick={() => handleCopyUrl(file)}
                        >
                          <Copy size={13} style={{ marginRight: '0.3rem' }} /> Copy URL
                        </button>
                        <a 
                          href={file.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="icon-btn" 
                          style={{ display: 'inline-flex', padding: '0.4rem', color: '#60a5fa', marginRight: '0.4rem', verticalAlign: 'middle' }}
                          title="Open asset in browser"
                        >
                          <ExternalLink size={17} />
                        </a>
                        <button 
                          className="icon-btn" 
                          onClick={() => handleDelete(file)} 
                          title="Delete File (checks usage first)" 
                          style={{ color: '#ef4444' }}
                        >
                          <Trash2 size={17} />
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
    </div>
  );
}
