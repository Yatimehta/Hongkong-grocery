import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, DollarSign, Package, Users } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    fetch('/api/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (!res.ok) {
        throw new Error('Failed to load dashboard data');
      }
      return res.json();
    })
    .then(data => {
      setData(data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setData({ error: err.message || 'Failed to load dashboard data' });
      setLoading(false);
    });
  }, []);

  if (loading || !data || !data.stats) {
    return (
      <div className="p-8" style={{ color: '#f8fafc' }}>
        <h2>Loading Dashboard...</h2>
        {data && data.error && (
          <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', color: '#f87171', marginTop: '1rem', maxWidth: '500px' }}>
            <strong>Error:</strong> {data.error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Dashboard</h1>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', color: '#3b82f6' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', color: 'var(--admin-text-secondary)', fontSize: '0.875rem' }}>Total Revenue</p>
            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>HK${data.stats.totalRevenue.toFixed(2)}</h3>
          </div>
        </div>

        <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: '#10b981' }}>
            <ShoppingCart size={24} />
          </div>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', color: 'var(--admin-text-secondary)', fontSize: '0.875rem' }}>Orders</p>
            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{data.stats.totalOrders}</h3>
          </div>
        </div>

        <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', color: '#f59e0b' }}>
            <Package size={24} />
          </div>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', color: 'var(--admin-text-secondary)', fontSize: '0.875rem' }}>Products</p>
            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{data.stats.productsCount}</h3>
          </div>
        </div>

        <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: '#10b981' }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', color: 'var(--admin-text-secondary)', fontSize: '0.875rem' }}>Customers</p>
            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{data.stats.customersCount}</h3>
          </div>
        </div>
      </div>

      {/* Area Chart */}
      <div className="admin-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Sales Analytics (Last 7 Days)</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <AreaChart data={data.revenueChart}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="var(--admin-text-secondary)" fontSize={12} />
              <YAxis stroke="var(--admin-text-secondary)" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Orders */}
        <div className="admin-card">
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Recent Orders</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {data.latestOrders.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '1rem' }}>No recent orders</td>
                  </tr>
                ) : (
                  data.latestOrders.map(order => (
                    <tr key={order.id}>
                      <td>#{order.id.slice(0, 8)}...</td>
                      <td>{order.customer ? order.customer.name : 'Guest'}</td>
                      <td>
                        <span className={`admin-badge badge-${order.orderStatus || 'pending'}`}>
                          {order.orderStatus || 'Pending'}
                        </span>
                      </td>
                      <td>HK${Number(order.total || 0).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="admin-card">
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Top Selling Products</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Units Sold</th>
                </tr>
              </thead>
              <tbody>
                {data.topProducts.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '1rem' }}>No sales data available</td>
                  </tr>
                ) : (
                  data.topProducts.map(product => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.sku}</td>
                      <td>HK${Number(product.price || 0).toFixed(2)}</td>
                      <td>{product.unitsSold}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
