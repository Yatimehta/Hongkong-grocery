import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Eye, Download, Search, X } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchData();
  }, [search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders?search=${search}`);
      const data = await res.json();
      setOrders(data.data || []);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async (orderId) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      setSelectedOrder(data);
      setIsModalOpen(true);
    } catch (err) {
      toast.error('Failed to fetch order details');
    }
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: status })
      });
      if (!res.ok) throw new Error();
      toast.success('Order status updated');
      fetchData();
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({ ...selectedOrder, orderStatus: status });
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDownloadInvoice = (id) => {
    window.open(`/api/orders/${id}/invoice`, '_blank');
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Orders</h1>
      </div>

      <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search by order number or customer..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input"
            style={{ paddingLeft: '2.5rem', width: '100%' }}
          />
        </div>
      </div>

      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <p>No orders found.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 500 }}>{o.orderNumber}</td>
                    <td>{new Date(o.date).toLocaleDateString()}</td>
                    <td>
                      <div>{o.customer?.name || 'Guest'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{o.customer?.email}</div>
                    </td>
                    <td>HK${o.total.toFixed(2)}</td>
                    <td>
                      <select 
                        className="admin-input" 
                        value={o.orderStatus} 
                        onChange={(e) => handleStatusUpdate(o.id, e.target.value)}
                        style={{ 
                          padding: '0.25rem 0.5rem', height: 'auto', width: 'auto', 
                          fontSize: '0.85rem',
                          backgroundColor: o.orderStatus === 'delivered' ? 'rgba(16, 185, 129, 0.1)' : 
                                           o.orderStatus === 'cancelled' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: o.orderStatus === 'delivered' ? '#10b981' : 
                                 o.orderStatus === 'cancelled' ? '#ef4444' : '#f59e0b',
                          borderColor: 'transparent'
                        }}
                      >
                        <option value="pending" style={{ color: '#000' }}>Pending</option>
                        <option value="processing" style={{ color: '#000' }}>Processing</option>
                        <option value="shipped" style={{ color: '#000' }}>Shipped</option>
                        <option value="delivered" style={{ color: '#000' }}>Delivered</option>
                        <option value="cancelled" style={{ color: '#000' }}>Cancelled</option>
                      </select>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="icon-btn" onClick={() => handleOpenModal(o.id)} title="View Details"><Eye size={18} /></button>
                      <button className="icon-btn" onClick={() => handleDownloadInvoice(o.id)} title="Download Invoice"><Download size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="admin-modal-overlay" onClick={handleCloseModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="admin-modal-header">
              <h2>Order #{selectedOrder.orderNumber}</h2>
              <button className="icon-btn" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            <div className="admin-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#1e293b', borderRadius: '8px' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1rem', color: '#94a3b8' }}>Customer Details</h3>
                  <p style={{ margin: '0.25rem 0' }}><strong>Name:</strong> {selectedOrder.customer?.name || 'Guest'}</p>
                  <p style={{ margin: '0.25rem 0' }}><strong>Email:</strong> {selectedOrder.customer?.email}</p>
                  <p style={{ margin: '0.25rem 0' }}><strong>Phone:</strong> {selectedOrder.customer?.phone || 'N/A'}</p>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#1e293b', borderRadius: '8px' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1rem', color: '#94a3b8' }}>Order Summary</h3>
                  <p style={{ margin: '0.25rem 0' }}><strong>Date:</strong> {new Date(selectedOrder.date).toLocaleString()}</p>
                  <p style={{ margin: '0.25rem 0' }}><strong>Payment:</strong> <span style={{ textTransform: 'capitalize' }}>{selectedOrder.paymentStatus}</span></p>
                  <p style={{ margin: '0.25rem 0' }}><strong>Total:</strong> HK${selectedOrder.total.toFixed(2)}</p>
                </div>
              </div>
              
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Items</h3>
              <table className="admin-table" style={{ fontSize: '0.9rem' }}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div>{item.product.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{item.product.sku}</div>
                      </td>
                      <td>HK${item.price.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td>HK${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn" style={{ background: 'transparent', border: '1px solid #475569' }} onClick={handleCloseModal}>Close</button>
              <button className="admin-btn" onClick={() => handleDownloadInvoice(selectedOrder.id)}>
                <Download size={16} style={{ marginRight: '0.5rem' }} /> Download Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
