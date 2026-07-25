import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { BarChart2, Download, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Reports() {
  const [salesData, setSalesData] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Last 30 days by default
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [salesRes, topProdRes] = await Promise.all([
        fetch(`/api/reports/sales?startDate=${startDate}&endDate=${endDate}`),
        fetch(`/api/reports/top-products?startDate=${startDate}&endDate=${endDate}`)
      ]);
      
      const sales = await salesRes.json();
      const topProd = await topProdRes.json();
      
      setSalesData(sales);
      setTopProducts(topProd);
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (type) => {
    window.open(`/api/reports/export/${type}?startDate=${startDate}&endDate=${endDate}`, '_blank');
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Reports</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#1e293b', padding: '0.5rem', borderRadius: '8px' }}>
            <Calendar size={18} color="#94a3b8" />
            <input type="date" className="admin-input" style={{ padding: '0.25rem', height: 'auto', border: 'none', background: 'transparent' }} value={startDate} onChange={e => setStartDate(e.target.value)} />
            <span style={{ color: '#94a3b8' }}>to</span>
            <input type="date" className="admin-input" style={{ padding: '0.25rem', height: 'auto', border: 'none', background: 'transparent' }} value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading reports...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          
          {/* Sales Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div className="admin-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>Total Revenue</h3>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>HK${salesData?.summary?.totalRevenue?.toFixed(2) || '0.00'}</div>
              </div>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '8px', color: '#3b82f6' }}>
                <BarChart2 size={24} />
              </div>
            </div>
            
            <div className="admin-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>Total Orders</h3>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{salesData?.summary?.totalOrders || 0}</div>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px', color: '#10b981' }}>
                <BarChart2 size={24} />
              </div>
            </div>

            <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
              <button className="admin-btn outline" style={{ width: '100%' }} onClick={() => handleExport('sales')}>
                <Download size={18} style={{ marginRight: '0.5rem' }} /> Export Sales CSV
              </button>
              <button className="admin-btn outline" style={{ width: '100%' }} onClick={() => handleExport('inventory')}>
                <Download size={18} style={{ marginRight: '0.5rem' }} /> Export Inventory CSV
              </button>
            </div>
          </div>

          {/* Top Products */}
          <div className="admin-card">
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Top Products by Units Sold</h3>
            
            <div style={{ height: '300px', marginBottom: '2rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Bar dataKey="unitsSold" name="Units Sold" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Units Sold</th>
                    <th>Revenue Generated</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p, i) => (
                    <tr key={p.id}>
                      <td>
                        <span style={{ color: '#94a3b8', marginRight: '1rem', fontWeight: 'bold' }}>#{i + 1}</span>
                        {p.name}
                      </td>
                      <td>{p.sku}</td>
                      <td>{p.unitsSold}</td>
                      <td>HK${p.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                  {topProducts.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No data available for this period.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
