import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import api from '../utils/api';
import { 
  ShoppingCart, 
  Trash2, 
  Loader2, 
  LogOut, 
  Search, 
  RefreshCw, 
  Package 
} from 'lucide-react'; // Added RefreshCw and Package
import './dashboard.css';

export default function Cashier() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const categories = ["All", "Coffee", "Pasta", "Pastries", "Drinks", "Non-Coffee", "Refresher"];

  // --- SYNC LOGIC ---
  const fetchProducts = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const res = await api.get('/products');
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) { 
      console.error("Sync Error:", err); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { 
    // 1. Initial Fetch
    fetchProducts(); 

    // 2. AUTO-SYNC: Refresh menu when cashier switches back to this tab
    const handleFocus = () => fetchProducts(false); // refresh without showing full loader
    window.addEventListener('focus', handleFocus);

    // 3. BACKGROUND POLL: Refresh every 30 seconds
    const interval = setInterval(() => fetchProducts(false), 30000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [fetchProducts]);

  // --- CART LOGIC ---
  const addToCart = (product) => {
    if (product.stock_quantity <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) {
          alert("Cannot exceed available stock!");
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const calculateTotal = () => cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0).toFixed(2);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setProcessing(true);
    try {
      const total = calculateTotal();
      await api.post('/orders', { 
        total_price: parseFloat(total),
        items: cart.map(item => ({
          id: item.id, 
          price: item.price,
          quantity: item.quantity
        }))
      });

      alert("Order Successful! 🧾");
      setCart([]);
      fetchProducts(false); // Refresh stock immediately after purchase
    } catch (err) {
      console.error(err);
      alert("Checkout failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="cashier-layout" style={{ display: 'flex', height: '100vh', backgroundColor: '#f9f7f5' }}>
      
      {/* --- MENU SECTION --- */}
      <div style={{ flex: 3, padding: '30px', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h1 className="dark-text">JCA Cucina Menu</h1>
            <p className="sub-text">Cashier Terminal</p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={() => fetchProducts()} className="action-btn edit" title="Manual Sync">
               <RefreshCw size={18} className={loading ? "animate-spin" : ""}/>
            </button>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '10px', top: '12px', color: '#888' }}/>
              <input 
                type="text" 
                placeholder="Search products..." 
                className="premium-input" 
                style={{ paddingLeft: '35px', marginBottom: 0 }} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
            <button onClick={() => {localStorage.clear(); window.location.href="/"}} className="sidebar-logout" style={{marginTop: 0, padding: '10px 15px'}}>
              <LogOut size={18}/>
            </button>
          </div>
        </header>

        {/* --- CATEGORY TABS --- */}
        <div className="category-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '25px', overflowX: 'auto', paddingBottom: '10px' }}>
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`nav-item ${activeCategory === cat ? 'active' : ''}`} 
              style={{ border: '1px solid #eee', whiteSpace: 'nowrap' }}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading && products.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <Loader2 className="animate-spin" size={40} color="#6f4e37" />
          </div>
        ) : (
          <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {products
              .filter(p => activeCategory === "All" || p.category === activeCategory)
              .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(p => (
                <div 
                  key={p.id} 
                  className="glass-card product-card" 
                  onClick={() => addToCart(p)} 
                  style={{ 
                    opacity: p.stock_quantity <= 0 ? 0.5 : 1, 
                    cursor: p.stock_quantity <= 0 ? 'not-allowed' : 'pointer',
                    transition: 'transform 0.2s'
                  }}
                >
                  <span className="badge coffee" style={{ fontSize: '10px' }}>{p.category}</span>
                  <h3 className="dark-text" style={{ margin: '10px 0 5px 0', fontSize: '1.1rem' }}>{p.name}</h3>
                  <p className="stat-value" style={{ fontSize: '1.2rem', color: '#6f4e37' }}>₱{Number(p.price).toFixed(2)}</p>
                  <small className="sub-text">Stock: {p.stock_quantity}</small>
                  {p.stock_quantity <= 0 && <div className="alert-item" style={{marginTop: '5px', padding: '5px', textAlign: 'center'}}>Sold Out</div>}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* --- CART SIDEBAR --- */}
      <div className="glass-card cart-sidebar" style={{ width: '400px', margin: '20px', padding: '0', display: 'flex', flexDirection: 'column', border: '1px solid #eee' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #eee', background: '#fdf5ed' }}>
            <h2 className="dark-text" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}><ShoppingCart /> Current Order</h2>
        </div>
        
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#999', marginTop: '40px' }}>
                <Package size={40} style={{ opacity: 0.2, marginBottom: '10px' }} />
                <p>Cart is empty</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="cart-item-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #f5f5f5' }}>
                    <div style={{ flex: 1 }}>
                        <div className="dark-text" style={{ fontWeight: '700' }}>{item.name}</div>
                        <div className="sub-text" style={{ fontSize: '13px' }}>{item.quantity} x ₱{Number(item.price).toFixed(2)}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span className="dark-text" style={{ fontWeight: 'bold' }}>₱{(item.price * item.quantity).toFixed(2)}</span>
                        <button onClick={() => removeFromCart(item.id)} className="action-btn delete">
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
              ))
            )}
        </div>

        {/* --- CHECKOUT FOOTER --- */}
        <div style={{ padding: '25px', backgroundColor: '#fffaf5', borderTop: '1px solid #eee', borderRadius: '0 0 15px 15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <span className="sub-text" style={{ fontSize: '16px', fontWeight: 'bold' }}>Total Amount</span>
            <span className="stat-value" style={{ fontSize: '24px', fontWeight: '800' }}>₱{calculateTotal()}</span>
          </div>
          <button 
            onClick={handleCheckout} 
            className="btn-modal-submit" 
            style={{ width: '100%', margin: 0 }} 
            disabled={processing || cart.length === 0}
          >
            {processing ? <Loader2 className="animate-spin" size={20} /> : "Complete Transaction"}
          </button>
        </div>
      </div>
    </div>
  );
}