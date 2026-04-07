import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import './dashboard.css'; 
import { Plus, LogOut, Loader2, Trash2, Edit3, AlertTriangle, Package } from 'lucide-react';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, dailySales: 0, monthlySales: 0 });
  const [loading, setLoading] = useState(true);
  
  // Modal & Form States
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({ 
    name: '', 
    price: '', 
    category: 'Coffee', 
    stock_quantity: '' 
  });

  const fetchInitialData = async () => {
    try {
      const [prodRes, statsRes, ordersRes] = await Promise.all([
        api.get('/products'),
        api.get('/stats/detailed-summary'),
        api.get('/orders/history')
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

  useEffect(() => {
    fetchInitialData();
    const interval = setInterval(fetchInitialData, 30000); // Auto-refresh for live sales
    return () => clearInterval(interval);
  }, []);

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Delete this product? This cannot be undone.")) {
      try {
        await api.delete(`/products/${id}`);
        fetchInitialData(); 
      } catch (err) { 
        alert("Failed to delete product."); 
      }
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', {
        ...productForm,
        price: parseFloat(productForm.price),
        stock_quantity: parseInt(productForm.stock_quantity, 10)
      });
      setShowProductModal(false);
      setProductForm({ name: '', price: '', category: 'Coffee', stock_quantity: '' });
      fetchInitialData();
    } catch (err) {
      alert("Error adding product.");
    }
  };

  if (loading) return <div className="loader-container"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="admin-container">
      <header className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h1 className="bold-text">JCA CUCINA DASHBOARD</h1>
        <button onClick={() => {localStorage.clear(); window.location.href="/"}} className="logout-btn">
          <LogOut size={18}/> Logout
        </button>
      </header>

      {/* --- OWNER ANALYTICS SECTION --- */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div className="glass-card stat-card highlight">
          <p>Today's Sales</p>
          <h2 className="white-text">${Number(stats.dailySales).toFixed(2)}</h2>
        </div>
        <div className="glass-card stat-card">
          <p>Monthly Sales</p>
          <h2 className="dark-text">${Number(stats.monthlySales).toFixed(2)}</h2>
        </div>
        <div className="glass-card stat-card">
          <p>Total Revenue</p>
          <h2 className="dark-text">${Number(stats.totalRevenue).toFixed(2)}</h2>
        </div>
        <div className="glass-card stat-card">
          <p>Order Count</p>
          <h2 className="dark-text">{stats.totalOrders}</h2>
        </div>
      </div>

      <div className="dashboard-main-layout" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        
        {/* --- MENU MANAGEMENT --- */}
        <div className="glass-card table-section">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 className="dark-text"><Package size={20}/> Menu Management</h3>
            <button onClick={() => setShowProductModal(true)} className="add-btn"><Plus size={18}/> Add Item</button>
          </div>
          <table className="premium-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td className="bold-text text-black">{p.name}</td>
                  <td><span className="category-tag">{p.category}</span></td>
                  <td className="bold-text">${Number(p.price).toFixed(2)}</td>
                  <td style={{ color: p.stock_quantity < 10 ? 'red' : 'black', fontWeight: 'bold' }}>
                    {p.stock_quantity}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <Trash2 
                        size={18} 
                        className="delete-icon" 
                        style={{ cursor: 'pointer', color: '#dc3545' }}
                        onClick={() => handleDeleteProduct(p.id)} 
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- INVENTORY ALERTS --- */}
        <div className="glass-card inventory-alerts">
          <h3 className="dark-text"><AlertTriangle size={20}/> Low Stock Alerts</h3>
          <div className="alert-list" style={{ marginTop: '15px' }}>
            {products.filter(p => p.stock_quantity < 10).map(p => (
              <div key={p.id} className="alert-item" style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-black">{p.name}</span>
                <span className="red-text" style={{ color: 'red', fontWeight: 'bold' }}>{p.stock_quantity} left</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- RECENT TRANSACTIONS --- */}
      <div className="glass-card history-section" style={{ marginTop: '30px' }}>
        <h3 className="dark-text">Recent Order Receipts</h3>
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
                <td className="bold-text">${Number(order.total_price).toFixed(2)}</td>
                <td><button className="category-tag" style={{border:'none', cursor:'pointer', background: '#eee'}}>View Receipt</button></td>
              </tr>
            )) : <tr><td colSpan="4" style={{textAlign: 'center'}}>No orders recorded yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* --- ADD PRODUCT MODAL --- */}
      {showProductModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 className="dark-text">Add New Product</h3>
                <Plus size={20} style={{ transform: 'rotate(45deg)', cursor: 'pointer' }} onClick={() => setShowProductModal(false)} />
            </div>
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="text" placeholder="Product Name" required className="premium-input" onChange={e => setProductForm({...productForm, name: e.target.value})} />
              <input type="number" step="0.01" placeholder="Price" required className="premium-input" onChange={e => setProductForm({...productForm, price: e.target.value})} />
              <select className="premium-input" onChange={e => setProductForm({...productForm, category: e.target.value})}>
                <option value="Coffee">Coffee</option>
                <option value="Pasta">Pasta</option>
                <option value="Pastries">Pastries</option>
                <option value="Drinks">Drinks</option>
                <option value="Non-Coffee">Non-Coffee</option>
                <option value="Refresher">Refresher</option>
              </select>
              <input type="number" placeholder="Initial Stock" required className="premium-input" onChange={e => setProductForm({...productForm, stock_quantity: e.target.value})} />
              <button type="submit" className="save-btn">Save Product</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}