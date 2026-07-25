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
    .then(res => res.json())
    .then(data => {
      setData(data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading || !data) return <div className="p-8">Loading Dashboard...</div>;

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
          <div style={{ padding: '1rem', backgroundColor: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px', color: '#8b5cf6' }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', color: 'var(--admin-text-secondary)', fontSize: '0.875rem' }}>Customers</p>
            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{data.stats.customersCount}</h3>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="admin-card" style={{ marginBottom: '2rem', height: '400px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Revenue (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.revenueChart}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e364f" vertical={false} />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1d27', border: '1px solid #2e364f', borderRadius: '8px' }}
              itemStyle={{ color: '#f8fafc' }}
            />
            <Area type="monotone" dataKey="amount" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAmount)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Order Statuses */}
        <div className="admin-card">
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Order Status</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {data.orderStatuses.map(s => (
              <li key={s.status} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--admin-border)' }}>
                <span style={{ textTransform: 'capitalize' }}>{s.status}</span>
                <span style={{ fontWeight: 'bold' }}>{s.count}</span>
              </li>
            ))}
            {data.orderStatuses.length === 0 && (
              <li style={{ textAlign: 'center', padding: '1rem', color: 'var(--admin-text-secondary)' }}>No orders yet</li>
            )}
          </ul>
        </div>

        {/* Latest Orders */}
        <div className="admin-card">
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Recent Orders</h3>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {data.latestOrders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id.slice(-6).toUpperCase()}</td>
                    <td>{order.customer?.name || 'Guest'}</td>
                    <td>HK${order.total.toFixed(2)}</td>
                  </tr>
                ))}
                {data.latestOrders.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>No orders found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="admin-card">
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Top Products</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {data.topProducts.map(p => (
              <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--admin-border)' }}>
                <div>
                  <div style={{ fontWeight: '500' }}>{p.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-secondary)' }}>{p.sku}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold' }}>{p.unitsSold} sold</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-secondary)' }}>HK${p.price?.toFixed(2)}</div>
                </div>
              </li>
            ))}
            {data.topProducts.length === 0 && (
              <li style={{ textAlign: 'center', padding: '1rem', color: 'var(--admin-text-secondary)' }}>No sales yet</li>
            )}
          </ul>
        </div>

      </div>
    </div>
  );
}
