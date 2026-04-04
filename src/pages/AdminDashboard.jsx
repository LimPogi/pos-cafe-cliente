import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import './dashboard.css'
import { Coffee, Plus, LogOut, X } from 'lucide-react';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  // Initializing with explicit zeros to prevent "undefined" errors
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
      // Adding a fallback if res.data is empty
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
    <div style={{ padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1><Coffee size={32} /> Admin Menu Management</h1>
        <button onClick={logout} style={{ color: 'red', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={statCardStyle}>
          <p style={{ margin: '0 0 10px 0', color: '#666' }}>Total Revenue</p>
          {/* FIX: Using Number() and a fallback 0 to ensure .toFixed() doesn't crash */}
          <h2 style={{ margin: 0 }}>${Number(stats?.totalRevenue || 0).toFixed(2)}</h2>
        </div>
        <div style={statCardStyle}>
          <p style={{ margin: '0 0 10px 0', color: '#666' }}>Total Orders</p>
          <h2 style={{ margin: 0 }}>{stats?.totalOrders || 0}</h2>
        </div>
        <div style={statCardStyle}>
          <p style={{ margin: '0 0 10px 0', color: '#666' }}>Avg Order Value</p>
          <h2 style={{ margin: 0 }}>
            {/* FIX: Ensure we don't divide by zero or undefined */}
            ${stats?.totalOrders > 0 ? (Number(stats.totalRevenue) / stats.totalOrders).toFixed(2) : "0.00"}
          </h2>
        </div>
      </div>

      <button onClick={() => setShowModal(true)} style={addButtonStyle}>
        <Plus size={16} /> Add New Coffee
      </button>

      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Add New Menu Item</h3>
              <X onClick={() => setShowModal(false)} style={{ cursor: 'pointer' }} />
            </div>
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="text" placeholder="Item Name" required style={inputStyle} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
              <input type="number" step="0.01" placeholder="Price" required style={inputStyle} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
              <input type="text" placeholder="Category" style={inputStyle} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} />
              <input type="number" placeholder="Stock" required style={inputStyle} onChange={(e) => setNewProduct({...newProduct, stock_quantity: e.target.value})} />
              <button type="submit" style={saveButtonStyle}>Save to Menu</button>
            </form>
          </div>
        </div>
      )}

      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
        <thead>
          <tr style={{ background: '#f4f4f4' }}>
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
                <td>{p.name}</td>
                <td>{p.category}</td>
                {/* FIX: Fallback price to prevent .toFixed() error */}
                <td>${(Number(p.price) || 0).toFixed(2)}</td>
                <td>{p.stock_quantity}</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="4" style={{ textAlign: 'center' }}>No products found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// Keep your existing styles below
const statCardStyle = { flex: 1, padding: '20px', background: '#fff', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center', borderTop: '4px solid #6F4E37' };
const addButtonStyle = { padding: '10px 15px', background: '#28a745', color: 'white', border: 'none', marginBottom: '20px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle = { background: 'white', padding: '30px', borderRadius: '15px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' };
const inputStyle = { padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '16px' };
const saveButtonStyle = { background: '#6F4E37', color: 'white', border: 'none', padding: '12px', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' };