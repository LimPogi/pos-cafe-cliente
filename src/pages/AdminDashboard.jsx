import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import './dashboard.css'; 
import { 
  Plus, LogOut, Loader2, Trash2, Edit3, FileText, Package, 
  TrendingUp, AlertTriangle, X, LayoutDashboard, ShoppingBag, 
  BarChart3, Settings, Search, Bell 
} from 'lucide-react';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
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
      const [prodRes, statsRes, ordersRes] = await Promise.all([
        api.get('/products'),
        api.get('/stats/detailed-summary'),
        api.get('/orders/history')
      ]);
      setProducts(prodRes.data || []);
      setStats(statsRes.data || { totalRevenue: 0, totalOrders: 0, daily: 0, weekly: 0, monthly: 0 });
      setRecentOrders(ordersRes.data || []);
    } catch (err) { 
      console.error("Fetch Error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  // --- HANDLERS ---
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

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const payload = {
      ...productForm,
      price: parseFloat(productForm.price),
      stock_quantity: parseInt(productForm.stock_quantity, 10)
    };

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setShowProductModal(false);
      fetchAllData();
    } catch (err) {
      alert("Error saving product.");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Delete this product? This cannot be undone.")) {
      try {
        await api.delete(`/products/${id}`);
        fetchAllData(); 
      } catch (err) { 
        alert("Failed to delete product."); 
      }
    }
  };

  if (loading) {
    return (
      <div className="loader-container" style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh'}}>
          <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="crm-wrapper">
      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className="crm-sidebar">
        <div className="sidebar-logo">
          <Package color="#6f4e37" size={30} />
          <h2 className="brand-text">JCA<span>Cucina</span></h2>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-item active"><LayoutDashboard size={18}/> Tableau de bord</div>
          <div className="nav-item"><ShoppingBag size={18}/> Catalogue</div>
          <div className="nav-item"><BarChart3 size={18}/> Rapports</div>
          <div className="nav-item"><Settings size={18}/> Paramètres</div>
        </nav>
        <button onClick={() => {localStorage.clear(); window.location.href="/"}} className="sidebar-logout">
          <LogOut size={18}/> Deconnexion
        </button>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="crm-main">
        <header className="crm-header">
          <div className="header-left">
            <h1 className="welcome-text">Bienvenue, Admin!</h1>
            <p className="sub-text">Vue d'ensemble de votre activité</p>
          </div>
          <div className="header-right">
            <div className="search-bar">
              <Search size={18} />
              <input type="text" placeholder="Rechercher..." />
            </div>
            <Bell size={20} className="header-icon" />
            <button onClick={() => handleOpenModal()} className="btn-primary-new">
              <Plus size={18}/> Nouveau produit
            </button>
          </div>
        </header>

        {/* --- STATS SECTION --- */}
        <div className="crm-stats-grid">
          <div className="glass-card crm-stat-card highlight">
            <span className="stat-label">Ventes d'aujourd'hui</span>
            <h2 className="stat-value">₱{Number(stats.daily || 0).toFixed(2)}</h2>
          </div>
          <div className="glass-card crm-stat-card"><span className="stat-label">Hebdomadaire</span><h2 className="stat-value">₱{Number(stats.weekly || 0).toFixed(2)}</h2></div>
          <div className="glass-card crm-stat-card"><span className="stat-label">Mensuel</span><h2 className="stat-value">₱{Number(stats.monthly || 0).toFixed(2)}</h2></div>
          <div className="glass-card crm-stat-card"><span className="stat-label">Commandes</span><h2 className="stat-value">{stats.totalOrders || 0}</h2></div>
        </div>

        <div className="dashboard-main-layout-crm">
          {/* PRODUCT INVENTORY */}
          <div className="glass-card table-section-crm">
            <h3 className="dark-text">Catalogue de Produits</h3>
            <table className="premium-table-crm">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Catégorie</th>
                  <th>Prix</th>
                  <th>Stock</th>
                  <th style={{textAlign: 'right'}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td className="bold-text text-black">{p.name}</td>
                    <td><span className={`badge ${p.category.toLowerCase()}`}>{p.category}</span></td>
                    <td>₱{Number(p.price).toFixed(2)}</td>
                    <td style={{ color: p.stock_quantity < 10 ? '#dc3545' : 'inherit', fontWeight: 'bold' }}>
                      {p.stock_quantity}
                    </td>
                    <td className="actions-cell">
                      <button className="action-btn edit" onClick={() => handleOpenModal(p)}><Edit3 size={16}/></button>
                      <button className="action-btn delete" onClick={() => handleDeleteProduct(p.id)}><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* REPORTS & ALERTS SIDEBAR */}
          <div className="crm-reports-sidebar">
            <div className="glass-card alert-card">
              <h3 className="dark-text"><AlertTriangle size={18}/> Low Stock alerts</h3>
              {products.filter(p => p.stock_quantity < 10).map(p => (
                <div key={p.id} className="alert-item red-text">Low: {p.name} ({p.stock_quantity})</div>
              ))}
            </div>
            <div className="glass-card report-card-crm">
              <h3 className="dark-text"><FileText size={18}/> Sales Reports</h3>
              <div className="report-buttons">
                <button className="report-btn-crm">Generate Daily PDF</button>
                <button className="report-btn-crm">Monthly Analytics</button>
              </div>
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
                  <td>#{order.id.toString().slice(0,8)}</td>
                  <td className="bold-text">₱{Number(order.total_price).toFixed(2)}</td>
                  <td><button className="view-btn">View Receipt</button></td>
                </tr>
              )) : <tr><td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>No orders recorded yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </main>

      {/* --- ADD/EDIT MODAL --- */}
      {showProductModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 className="dark-text">{editingProduct ? 'Modifier le produit' : 'Add New Product'}</h3>
                <X size={20} style={{ cursor: 'pointer' }} onClick={() => setShowProductModal(false)} />
            </div>
            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="text" placeholder="Product Name" required className="premium-input" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
              <input type="number" step="0.01" placeholder="Price" required className="premium-input" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} />
              <select className="premium-input" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}>
                <option value="Coffee">Coffee</option>
                <option value="Pasta">Pasta</option>
                <option value="Pastries">Pastries</option>
                <option value="Drinks">Drinks</option>
                <option value="Non-Coffee">Non-Coffee</option>
                <option value="Refresher">Refresher</option>
              </select>
              <input type="number" placeholder="Stock Quantity" required className="premium-input" value={productForm.stock_quantity} onChange={e => setProductForm({...productForm, stock_quantity: e.target.value})} />
              <button type="submit" className="save-btn">
                {editingProduct ? 'Update Product' : 'Save Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}