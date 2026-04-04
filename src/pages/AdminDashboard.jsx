import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import './dashboard.css'; // Ensure this file exists in the same folder!
import { Coffee, Plus, LogOut, X } from 'lucide-react';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0 });
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    price: '', 
    category: 'Coffee', 
    stock_quantity: '' 
  });

  useEffect(() => {
    fetchProducts();
    fetchStats();
  }, []);

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
      fetchProducts();
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#3c2a21', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Coffee size={40} color="#6f4e37" /> Admin Menu Management
        </h1>
        <button onClick={logout} className="logout-btn">
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* --- STATS SECTION --- */}
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

      {/* --- MODAL --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
              <h3>Add New Menu Item</h3>
              <X onClick={() => setShowModal(false)} style={{ cursor: 'pointer', color: '#666' }} />
            </div>
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="text" placeholder="Item Name" required className="premium-input" onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
              <input type="number" step="0.01" placeholder="Price" required className="premium-input" onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
              <input type="text" placeholder="Category" className="premium-input" onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} />
              <input type="number" placeholder="Stock" required className="premium-input" onChange={(e) => setNewProduct({...newProduct, stock_quantity: e.target.value})} />
              <button type="submit" className="save-btn">Save to Menu</button>
            </form>
          </div>
        </div>
      )}

      {/* --- TABLE --- */}
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
                  <td style={{ color: '#6f4e37', fontWeight: 'bold' }}>${(Number(p.price) || 0).toFixed(2)}</td>
                  <td>{p.stock_quantity}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}