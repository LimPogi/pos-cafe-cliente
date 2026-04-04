import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import './dashboard.css'; 
import { Coffee, Plus, LogOut, X, Loader2, Users } from 'lucide-react';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0 });
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({ name: '', price: '', category: 'Coffee', stock_quantity: '' });

  useEffect(() => { fetchInitialData(); }, []);
  
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchProducts(), fetchStats()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    const res = await api.get('/products');
    setProducts(res.data || []);
  };

  const fetchStats = async () => {
    const res = await api.get('/dashboard/stats');
    setStats(res.data || { totalRevenue: 0, totalOrders: 0 });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    // Convert strings to proper Numbers for the DB
    const priceNum = parseFloat(productForm.price);
    const stockNum = parseInt(productForm.stock_quantity, 10);

    if (isNaN(priceNum) || isNaN(stockNum)) return alert("Please enter valid numbers");

    try {
      await api.post('/products', {
        name: productForm.name,
        price: priceNum,
        category: productForm.category || 'General',
        stock_quantity: stockNum
      });
      
      setShowProductModal(false);
      setProductForm({ name: '', price: '', category: 'Coffee', stock_quantity: '' });
      fetchInitialData();
      alert("Success: Menu item added! ✅");
    } catch (err) {
      console.error(err);
      alert("Error adding product. Ensure Supabase has INSERT policies enabled.");
    }
  };

  return (
    <div className="admin-container">
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h1>Admin Dashboard</h1>
        <button onClick={() => {localStorage.clear(); window.location.href="/"}} className="logout-btn"><LogOut size={18}/> Logout</button>
      </header>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div className="glass-card stat-card">
          <p>Total Revenue</p>
          <h2>${Number(stats?.totalRevenue || 0).toFixed(2)}</h2>
        </div>
        <div className="glass-card stat-card">
          <p>Total Orders</p>
          <h2>{stats?.totalOrders || 0}</h2>
        </div>
      </div>

      <button onClick={() => setShowProductModal(true)} className="add-btn"><Plus size={18}/> Add Menu Item</button>

      {loading ? <Loader2 className="animate-spin" /> : (
        <div className="table-container glass-card">
          <table className="premium-table">
            <thead>
              <tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th></tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td><span className="category-tag">{p.category}</span></td>
                  <td>${Number(p.price).toFixed(2)}</td>
                  <td>{p.stock_quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showProductModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <h3>Add New Item</h3>
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="text" placeholder="Name" required className="premium-input" onChange={e => setProductForm({...productForm, name: e.target.value})} />
              <input type="number" step="0.01" placeholder="Price" required className="premium-input" onChange={e => setProductForm({...productForm, price: e.target.value})} />
              <input type="text" placeholder="Category" className="premium-input" onChange={e => setProductForm({...productForm, category: e.target.value})} />
              <input type="number" placeholder="Stock" required className="premium-input" onChange={e => setProductForm({...productForm, stock_quantity: e.target.value})} />
              <button type="submit" className="save-btn">Save</button>
              <button type="button" onClick={() => setShowProductModal(false)} className="logout-btn">Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}