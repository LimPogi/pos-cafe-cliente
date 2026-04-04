import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import './dashboard.css'; 
import { Coffee, Plus, LogOut, X, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    price: '', 
    category: 'Coffee', 
    stock_quantity: '' 
  });

  // Initial load
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    // Runs both fetches at the same time for better performance
    await Promise.all([fetchProducts(), fetchStats()]);
    setLoading(false);
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data || []);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data || { totalRevenue: 0, totalOrders: 0 });
    } catch (err) {
      console.error("Could not load stats", err);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', newProduct);
      setShowModal(false);
      setNewProduct({ name: '', price: '', category: 'Coffee', stock_quantity: '' });
      // Refresh data after adding
      fetchInitialData();
    } catch (err) {
      alert("Error adding product. Check your backend!");
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="admin-container">
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: 'var(--coffee-dark)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
          <Coffee size={40} color="var(--coffee-medium)" /> Admin Menu Management
        </h1>
        <button onClick={logout} className="logout-btn">
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* STATS SECTION */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        <div className="glass-card stat-card">
          <p>Total Revenue</p>
          <h2>${Number(stats?.totalRevenue || 0).toFixed(2)}</h2>
        </div>
        <div className="glass-card stat-card">
          <p>Total Orders</p>
          <h2>{stats?.totalOrders || 0}</h2>
        </div>
        <div className="glass-card stat-card">
          <p>Avg Order Value</p>
          <h2>
            ${stats?.totalOrders > 0 ? (Number(stats.totalRevenue) / stats.totalOrders).toFixed(2) : "0.00"}
          </h2>
        </div>
      </div>

      <button onClick={() => setShowModal(true)} className="add-btn">
        <Plus size={18} /> Add New Coffee
      </button>

      {/* MODAL SECTION */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
              <h3 style={{ margin: 0 }}>Add New Menu Item</h3>
              <X onClick={() => setShowModal(false)} style={{ cursor: 'pointer', color: '#666' }} />
            </div>
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#888' }}>PRODUCT NAME</label>
              <input type="text" placeholder="e.g. Spanish Latte" required className="premium-input" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
              
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#888' }}>PRICE ($)</label>
              <input type="number" step="0.01" placeholder="0.00" required className="premium-input" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
              
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#888' }}>CATEGORY</label>
              <input type="text" placeholder="Coffee, Pastry, etc." className="premium-input" value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} />
              
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#888' }}>INITIAL STOCK</label>
              <input type="number" placeholder="100" required className="premium-input" value={newProduct.stock_quantity} onChange={(e) => setNewProduct({...newProduct, stock_quantity: e.target.value})} />
              
              <button type="submit" className="save-btn" style={{ marginTop: '10px' }}>Save to Menu</button>
            </form>
          </div>
        </div>
      )}

      {/* MAIN CONTENT / TABLE */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <Loader2 className="animate-spin" size={40} color="var(--coffee-medium)" style={{ margin: '0 auto 15px' }} />
          <p style={{ color: '#888', fontWeight: '500' }}>Brewing your dashboard data...</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: '600' }}>{p.name}</td>
                    <td><span className="category-tag">{p.category}</span></td>
                    <td style={{ color: 'var(--coffee-medium)', fontWeight: 'bold' }}>${(Number(p.price) || 0).toFixed(2)}</td>
                    <td>{p.stock_quantity}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    No products found. Click "Add New Coffee" to start.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}