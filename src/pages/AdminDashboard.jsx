import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Coffee, Plus, LogOut } from 'lucide-react';

export default function AdminDashboard() {
  // 1. All state declarations at the top
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0 });

  // 2. Combine the data fetching into one useEffect
  useEffect(() => {
    fetchProducts();
    fetchStats();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error("Could not load stats", err);
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // 3. The JSX Return (Everything must be inside the return)
  return (
    <div style={{ padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1><Coffee size={32} /> Admin Menu Management</h1>
        <button onClick={logout} style={{ color: 'red', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* --- STATS SECTION --- */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={statCardStyle}>
          <p style={{ margin: '0 0 10px 0', color: '#666' }}>Total Revenue</p>
          <h2 style={{ margin: 0 }}>${stats.totalRevenue}</h2>
        </div>
        <div style={statCardStyle}>
          <p style={{ margin: '0 0 10px 0', color: '#666' }}>Total Orders</p>
          <h2 style={{ margin: 0 }}>{stats.totalOrders}</h2>
        </div>
        <div style={statCardStyle}>
          <p style={{ margin: '0 0 10px 0', color: '#666' }}>Avg Order Value</p>
          <h2 style={{ margin: 0 }}>
            ${stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : 0}
          </h2>
        </div>
      </div>

      <button style={{ padding: '10px 15px', background: '#28a745', color: 'white', border: 'none', marginBottom: '20px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Plus size={16} /> Add New Coffee
      </button>

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
                <td>${p.price.toFixed(2)}</td>
                <td>{p.stock_quantity}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center' }}>No products found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// 4. Styles outside the component function
const statCardStyle = {
  flex: 1,
  padding: '20px',
  background: '#fff',
  borderRadius: '10px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  textAlign: 'center',
  borderTop: '4px solid #6F4E37'
};