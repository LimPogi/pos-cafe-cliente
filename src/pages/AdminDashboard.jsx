import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import './dashboard.css'; 
import { Coffee, Plus, LogOut, X, Loader2, Edit3, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]); // Added state for orders
  const [stats, setStats] = useState({ 
    totalRevenue: 0, 
    totalOrders: 0, 
    dailySales: 0, 
    monthlySales: 0 
  });
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({ name: '', price: '', category: 'Coffee', stock_quantity: '' });

  // 1. Single Load function for everything
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Fetches products, stats, and order history all at once
      const [prodRes, statsRes, ordersRes] = await Promise.all([
        api.get('/products'),
        api.get('/stats/detailed-summary'), // Updated to your new route
        api.get('/orders/history') // You will need to add this route to backend
      ]);
      
      setProducts(prodRes.data || []);
      setStats(statsRes.data || { totalRevenue: 0, totalOrders: 0, dailySales: 0, monthlySales: 0 });
      setRecentOrders(ordersRes.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInitialData(); }, []);

  // 2. Add/Delete Handlers
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchInitialData(); // Refresh list
    } catch (err) {
      alert("Error deleting product.");
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const priceNum = parseFloat(productForm.price);
    const stockNum = parseInt(productForm.stock_quantity, 10);

    try {
      await api.post('/products', {
        ...productForm,
        price: priceNum,
        stock_quantity: stockNum
      });
      setShowProductModal(false);
      setProductForm({ name: '', price: '', category: 'Coffee', stock_quantity: '' });
      fetchInitialData();
    } catch (err) {
      alert("Error adding product.");
    }
  };

  return (
    <div className="admin-container">
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h1>JCA CUCINA DASHBOARD</h1>
        <button onClick={() => {localStorage.clear(); window.location.href="/"}} className="logout-btn"><LogOut size={18}/> Logout</button>
      </header>

      {/* --- OWNER ANALYTICS SECTION --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div className="glass-card stat-card">
          <p>Today's Sales</p>
          <h2>${stats.dailySales}</h2>
        </div>
        <div className="glass-card stat-card">
          <p>This Month</p>
          <h2>${stats.monthlySales}</h2>
        </div>
        <div className="glass-card stat-card">
          <p>Total Revenue</p>
          <h2>${stats.totalRevenue}</h2>
        </div>
        <div className="glass-card stat-card">
          <p>Total Orders</p>
          <h2>{stats.totalOrders}</h2>
        </div>
      </div>

      {/* --- MENU MANAGEMENT SECTION --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3>JCA Menu Items</h3>
        <button onClick={() => setShowProductModal(true)} className="add-btn" style={{marginBottom: 0}}><Plus size={18}/> Add New Item</button>
      </div>

      <div className="table-container glass-card">
        <table className="premium-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th> {/* Added Actions Header */}
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td><span className="category-tag">{p.category}</span></td>
                <td>${Number(p.price).toFixed(2)}</td>
                <td>{p.stock_quantity}</td>
                <td>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <Edit3 size={18} style={{ cursor: 'pointer', color: '#6f4e37' }} onClick={() => alert('Edit logic coming next!')} />
                    <Trash2 size={18} style={{ cursor: 'pointer', color: '#dc3545' }} onClick={() => handleDelete(p.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- ORDER HISTORY / RECEIPTS SECTION --- */}
      <div className="table-container glass-card" style={{ marginTop: '40px' }}>
        <h3>Recent Order Receipts</h3>
        <table className="premium-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Order ID</th>
              <th>Total Amount</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length > 0 ? recentOrders.map(order => (
              <tr key={order.id}>
                <td>{new Date(order.created_at).toLocaleString()}</td>
                <td>#{order.id.slice(0,8)}</td>
                <td>${Number(order.total_price).toFixed(2)}</td>
                <td><button className="category-tag" style={{border:'none', cursor:'pointer', background: '#eee'}}>View Receipt</button></td>
              </tr>
            )) : <tr><td colSpan="4" style={{textAlign: 'center'}}>No orders yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Add Modal remains the same */}
      {showProductModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <h3>Add New Item</h3>
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="text" placeholder="Name" required className="premium-input" onChange={e => setProductForm({...productForm, name: e.target.value})} />
              <input type="number" step="0.01" placeholder="Price" required className="premium-input" onChange={e => setProductForm({...productForm, price: e.target.value})} />
              <input type="text" placeholder="Category" className="premium-input" onChange={e => setProductForm({...productForm, category: e.target.value})} />
              <input type="number" placeholder="Stock" required className="premium-input" onChange={e => setProductForm({...productForm, stock_quantity: e.target.value})} />
              <button type="submit" className="save-btn">Save Item</button>
              <button type="button" onClick={() => setShowProductModal(false)} className="logout-btn" style={{border: 'none'}}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}