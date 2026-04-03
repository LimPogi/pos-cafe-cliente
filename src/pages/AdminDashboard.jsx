import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Coffee, Plus, LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0 });

useEffect(() => {
  fetchStats();
}, []);

const fetchStats = async () => {
  try {
    const res = await api.get('/dashboard/stats');
    setStats(res.data);
  } catch (err) {
    console.error("Could not load stats");
  }
};

  return (
    <div style={{ padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1><Coffee size={32} /> Admin Menu Management</h1>
        <button onClick={logout} style={{ color: 'red', border: 'none', cursor: 'pointer' }}><LogOut /> Logout</button>
      </div>

      <button style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none', marginBottom: '20px' }}>
        <Plus size={16} /> Add New Coffee
      </button>

      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f4f4f4' }}>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>${p.price}</td>
              <td>{p.stock_quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

<div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
  <div style={statCardStyle}>
    <p>Total Revenue</p>
    <h2>${stats.totalRevenue}</h2>
  </div>
  <div style={statCardStyle}>
    <p>Total Orders</p>
    <h2>{stats.totalOrders}</h2>
  </div>
  <div style={statCardStyle}>
    <p>Average Order Value</p>
    <h2>${stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : 0}</h2>
  </div>
</div>

// Add this style object at the bottom of the file
const statCardStyle = {
  flex: 1,
  padding: '20px',
  background: '#fff',
  borderRadius: '10px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  textAlign: 'center',
  borderTop: '4px solid #6F4E37'
};