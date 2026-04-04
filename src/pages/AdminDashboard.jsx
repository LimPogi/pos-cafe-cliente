import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import './dashboard.css'; 
import { Coffee, Plus, LogOut, X, Loader2, Users } from 'lucide-react';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0 });
  const [loading, setLoading] = useState(true);
  
  // MODAL STATES
  const [showProductModal, setShowProductModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);

  // FORM STATES (Fixed: Now using a proper React State)
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    category: 'Coffee',
    stock_quantity: ''
  });

  const [staff, setStaff] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    fetchInitialData();
  }, []);
  
  const fetchInitialData = async () => {
    setLoading(true);
    // Promise.all is great for performance!
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
      // Added safety check to ensure stats never stays null
      setStats(res.data || { totalRevenue: 0, totalOrders: 0 });
    } catch (err) {
      console.error("Could not load stats", err);
    }
  };

  // HANDLERS
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      // We convert strings to numbers right before sending to Supabase
      const payload = {
        ...productForm,
        price: parseFloat(productForm.price),
        stock_quantity: parseInt(productForm.stock_quantity)
      };

      await api.post('/products', payload);
      
      setShowProductModal(false);
      setProductForm({ name: '', price: '', category: 'Coffee', stock_quantity: '' });
      fetchInitialData(); // Refresh list and stats
      alert("Product added successfully! ☕");
    } catch (err) {
      console.error(err);
      alert("Error adding product. Check if price/stock are numbers.");
    }
  };

  const handleCreateCashier = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { ...staff, role: 'cashier' });
      alert("New Cashier Account Created! ☕");
      setShowStaffModal(false);
      setStaff({ name: '', email: '', password: '' });
    } catch (err) {
      alert("Could not create account. Check if email already exists.");
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
          <Coffee size={40} color="var(--coffee-medium)" /> Admin Dashboard
        </h1>
        <button onClick={logout} className="logout-btn">
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* STATS SECTION */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        <div className="glass-card stat-card">
          <p>Total Revenue</p>
          <h2 style={{ color: 'var(--coffee-dark)' }}>
            ${Number(stats?.totalRevenue || 0).toFixed(2)}
          </h2>
        </div>
        <div className="glass-card stat-card">
          <p>Total Orders</p>
          <h2 style={{ color: 'var(--coffee-dark)' }}>
            {stats?.totalOrders || 0}
          </h2>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <button onClick={() => setShowProductModal(true)} className="add-btn">
          <Plus size={18} /> Add New Coffee
        </button>
        <button onClick={() => setShowStaffModal(true)} className="add-btn" style={{ background: '#6c757d' }}>
          <Users size={18} /> Register Cashier
        </button>
      </div>

      {/* STAFF REGISTRATION MODAL */}
      {showStaffModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
              <h3 style={{ margin: 0 }}>Register New Staff</h3>
              <X onClick={() => setShowStaffModal(false)} style={{ cursor: 'pointer', color: '#666' }} />
            </div>
            <form onSubmit={handleCreateCashier} style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
              <input type="text" placeholder="Full Name" required className="premium-input" value={staff.name} onChange={(e) => setStaff({...staff, name: e.target.value})} />
              <input type="email" placeholder="Email Address" required className="premium-input" value={staff.email} onChange={(e) => setStaff({...staff, email: e.target.value})} />
              <input type="password" placeholder="Password" required className="premium-input" value={staff.password} onChange={(e) => setStaff({...staff, password: e.target.value})} />
              <button type="submit" className="save-btn" style={{ marginTop: '10px' }}>Create Account</button>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCT MODAL */}
      {showProductModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
              <h3 style={{ margin: 0 }}>Add New Menu Item</h3>
              <X onClick={() => setShowProductModal(false)} style={{ cursor: 'pointer', color: '#666' }} />
            </div>
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
              <input 
                type="text" 
                placeholder="Product Name" 
                required 
                className="premium-input" 
                value={productForm.name} 
                onChange={(e) => setProductForm({...productForm, name: e.target.value})} 
              />
              <input 
                type="number" 
                step="0.01" 
                placeholder="Price ($)" 
                required 
                className="premium-input" 
                value={productForm.price} 
                onChange={(e) => setProductForm({...productForm, price: e.target.value})} 
              />
              <input 
                type="text" 
                placeholder="Category (e.g. Coffee)" 
                className="premium-input" 
                value={productForm.category} 
                onChange={(e) => setProductForm({...productForm, category: e.target.value})} 
              />
              <input 
                type="number" 
                placeholder="Initial Stock" 
                required 
                className="premium-input" 
                value={productForm.stock_quantity} 
                onChange={(e) => setProductForm({...productForm, stock_quantity: e.target.value})} 
              />
              <button type="submit" className="save-btn" style={{ marginTop: '10px' }}>Save to Menu</button>
            </form>
          </div>
        </div>
      )}

      {/* MAIN TABLE SECTION */}
      {loading ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
          <Loader2 className="animate-spin" size={40} color="var(--coffee-medium)" style={{ margin: '0 auto 15px' }} />
          <p style={{ color: '#888' }}>Loading inventory...</p>
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
              {products.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No products found. Add your first coffee!</td></tr>
              ) : (
                products.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: '600' }}>{p.name}</td>
                    <td><span className="category-tag">{p.category}</span></td>
                    <td style={{ color: 'var(--coffee-medium)', fontWeight: 'bold' }}>
                      ${Number(p.price || 0).toFixed(2)}
                    </td>
                    <td>{p.stock_quantity || 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}