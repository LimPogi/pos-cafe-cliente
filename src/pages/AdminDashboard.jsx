import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import './dashboard.css'; 
import { 
  Plus, LogOut, Loader2, Trash2, Edit3, FileText, Package, 
  AlertTriangle, X, LayoutDashboard, ShoppingBag, 
  BarChart3, Settings 
} from 'lucide-react';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, daily: 0, weekly: 0, monthly: 0 });
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [productForm, setProductForm] = useState({ 
    name: '', price: '', category: 'Coffee', stock_quantity: '' 
  });

  // --- DATA FETCHING ---
const fetchAllData = async () => {
  try {
    setLoading(true);
    // Fetch products first
    const prodRes = await api.get('/products');
    setProducts(prodRes.data || []);

    // Try to fetch stats, but don't crash if it's not ready
    try {
      const statsRes = await api.get('/stats/detailed-summary');
      setStats(statsRes.data || { daily: 0, weekly: 0, monthly: 0, totalOrders: 0 });
    } catch (sErr) {
      console.warn("Stats route not ready yet");
    }
  } catch (err) {
    console.error("Fetch Error:", err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchAllData();
  }, []);

  // --- MODAL HANDLERS ---
  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        price: product.price,
        category: product.category,
        stock_quantity: product.stock_quantity
      });
    } else {
      setEditingProduct(null);
      setProductForm({ name: '', price: '', category: 'Coffee', stock_quantity: '' });
    }
    setShowProductModal(true);
  };

  // --- SAVE LOGIC (FIXED) ---
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    
    // Prepare the payload correctly
    const payload = {
      ...productForm,
      price: parseFloat(productForm.price),
      stock_quantity: parseInt(productForm.stock_quantity, 10)
    };

   try {
    if (editingProduct) {
      // Add a leading slash or ensure it matches your API instance
      await api.put(`/products/${editingProduct.id}`, payload);
    } else {
      // Try adding the slash explicitly if your server is being picky
      await api.post('/products', payload); 
    }
      
      setShowProductModal(false);
      // RE-FETCH DATA: This ensures both the Admin and Cashier side see the update
      await fetchAllData(); 
      
    } catch (err) {
      console.error("Save Error:", err);
      alert("Error saving product. Please check your connection.");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Delete this product? This cannot be undone.")) {
      try {
        await api.delete(`/products/${id}`);
        await fetchAllData(); 
      } catch (err) { 
        alert("Failed to delete product."); 
      }
    }
  };

  if (loading) {
    return (
      <div className="loader-container" style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh'}}>
          <Loader2 className="animate-spin" size={40} color="#6f4e37" />
      </div>
    );
  }

  return (
    <div className="crm-wrapper">
      <aside className="crm-sidebar">
        <div className="sidebar-logo">
          <Package color="#6f4e37" size={30} />
          <h2 className="brand-text">JCA<span>Cucina</span></h2>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-item active"><LayoutDashboard size={18}/> Dashboard</div>
          <div className="nav-item"><ShoppingBag size={18}/> Catalog</div>
          <div className="nav-item"><BarChart3 size={18}/> Reports</div>
          <div className="nav-item"><Settings size={18}/> Settings</div>
        </nav>
        <button onClick={() => {localStorage.clear(); window.location.href="/"}} className="sidebar-logout">
          <LogOut size={18}/> Logout
        </button>
      </aside>

      <main className="crm-main">
        <header className="crm-header">
          <div className="header-left">
            <h1 className="welcome-text">Welcome, Admin!</h1>
            <p className="sub-text">Overview of your activity</p>
          </div>
          <div className="header-right">
            <button onClick={() => handleOpenModal()} className="btn-primary-new">
              <Plus size={18}/> New Product
            </button>
          </div>
        </header>

        <div className="crm-stats-grid">
          <div className="glass-card crm-stat-card highlight">
            <span className="stat-label">Today's Sales</span>
            <h2 className="stat-value">₱{Number(stats.daily || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
          </div>
          <div className="glass-card crm-stat-card">
            <span className="stat-label">Weekly Sales</span>
            <h2 className="stat-value">₱{Number(stats.weekly || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
          </div>
          <div className="glass-card crm-stat-card">
            <span className="stat-label">Monthly Sales</span>
            <h2 className="stat-value">₱{Number(stats.monthly || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
          </div>
          <div className="glass-card crm-stat-card">
            <span className="stat-label">Total Orders</span>
            <h2 className="stat-value">{stats.totalOrders || 0}</h2>
          </div>
        </div>

        <div className="dashboard-main-layout-crm">
          <div className="glass-card table-section-crm">
            <h3 className="dark-text">Product Catalog</h3>
            <table className="premium-table-crm">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th style={{textAlign: 'right'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? products.map(p => (
                  <tr key={p.id}>
                    <td className="bold-text dark-text">{p.name}</td>
                    <td><span className={`badge ${p.category?.toLowerCase() || 'default'}`}>{p.category}</span></td>
                    <td className="dark-text">₱{Number(p.price).toFixed(2)}</td>
                    <td style={{ color: p.stock_quantity < 10 ? '#dc3545' : '#3c2a21', fontWeight: 'bold' }}>
                      {p.stock_quantity}
                    </td>
                    <td className="actions-cell" style={{textAlign: 'right'}}>
                      <button className="action-btn edit" onClick={() => handleOpenModal(p)}><Edit3 size={16}/></button>
                      <button className="action-btn delete" onClick={() => handleDeleteProduct(p.id)}><Trash2 size={16}/></button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" style={{textAlign:'center', padding:'20px'}}>No products found. Add your first item!</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="crm-reports-sidebar">
            <div className="glass-card alert-card" style={{marginBottom: '20px'}}>
              <h3 className="dark-text"><AlertTriangle size={18} style={{marginRight: '8px'}}/> Low Stock Alerts</h3>
              {products.filter(p => p.stock_quantity < 10).map(p => (
                <div key={p.id} className="alert-item red-text">Low: {p.name} ({p.stock_quantity})</div>
              ))}
            </div>
            <div className="glass-card">
              <h3 className="dark-text"><FileText size={18} style={{marginRight: '8px'}}/> Sales Reports</h3>
              <div style={{display:'flex', flexDirection:'column', gap:'10px', marginTop:'15px'}}>
                <button className="report-btn-crm">Generate Daily PDF</button>
                <button className="report-btn-crm">Monthly Analytics</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- POPUP MODAL --- */}
      {showProductModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-card">
              <h2 className="modal-title">{editingProduct ? 'Edit Menu Item' : 'New Menu Item'}</h2>
              <form onSubmit={handleSaveProduct} className="modal-form">
                <div className="input-group">
                  <input 
                    type="text" 
                    placeholder="Name (e.g. Pesto)" 
                    required 
                    value={productForm.name} 
                    onChange={e => setProductForm({...productForm, name: e.target.value})} 
                  />
                </div>
                <div className="input-group">
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="Price" 
                    required 
                    value={productForm.price} 
                    onChange={e => setProductForm({...productForm, price: e.target.value})} 
                  />
                </div>
                <div className="input-group">
                  <select 
                    value={productForm.category} 
                    onChange={e => setProductForm({...productForm, category: e.target.value})}
                  >
                    <option value="Coffee">Coffee</option>
                    <option value="Pasta">Pasta</option>
                    <option value="Pastries">Pastries</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Non-Coffee">Non-Coffee</option>
                    <option value="Refresher">Refresher</option>
                  </select>
                </div>
                <div className="input-group">
                  <input 
                    type="number" 
                    placeholder="Stock" 
                    required 
                    value={productForm.stock_quantity} 
                    onChange={e => setProductForm({...productForm, stock_quantity: e.target.value})} 
                  />
                </div>
                <button type="submit" className="btn-modal-submit">
                  {editingProduct ? 'Update Menu' : 'Add to Menu'}
                </button>
                <button type="button" className="btn-modal-cancel" onClick={() => setShowProductModal(false)}>
                  Cancel
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}