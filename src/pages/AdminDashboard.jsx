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
    await Promise.all([fetchProducts(), fetchStats()]);
    setLoading(false);
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data || { totalRevenue: 0, totalOrders: 0 });
    } catch (err) { console.error(err); }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    // CRITICAL: Ensure numbers are actually numbers before sending
    const priceNum = parseFloat(productForm.price);
    const stockNum = parseInt(productForm.stock_quantity, 10);

    if (isNaN(priceNum) || isNaN(stockNum)) {
      return alert("Price and Stock must be valid numbers!");
    }

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
      alert("Item added successfully! ✅");
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || "Check your database schema."));
    }
  };

  return (
    <div className="admin-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Coffee size={35} /> Admin Panel</h1>
        <button onClick={() => {localStorage.clear(); window.location.href="/"}} className="logout-btn"><LogOut size={18}/> Logout</button>
      </div>

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

      <button onClick={() => setShowProductModal(true)} className="add-btn" style={{ marginBottom: '20px' }}><Plus size={18}/> Add Menu Item</button>

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
            <h3>New Menu Item</h3>
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="text" placeholder="Name (e.g. Pesto)" required className="premium-input" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
              <input type="number" step="0.01" placeholder="Price" required className="premium-input" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} />
              <input type="text" placeholder="Category" className="premium-input" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} />
              <input type="number" placeholder="Stock" required className="premium-input" value={productForm.stock_quantity} onChange={e => setProductForm({...productForm, stock_quantity: e.target.value})} />
              <button type="submit" className="save-btn">Add to Menu</button>
              <button type="button" onClick={() => setShowProductModal(false)} className="logout-btn">Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}