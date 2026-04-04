import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { ShoppingCart, Trash2, Coffee, Loader2, LogOut, Plus, Minus, Search } from 'lucide-react';
import './dashboard.css'; 

export default function Cashier() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("FETCH ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    if (!product || product.stock_quantity <= 0) return;

    setCart(currentCart => {
      const existing = currentCart.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) {
          alert("Limit reached based on available stock.");
          return currentCart;
        }
        return currentCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...currentCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    const productInMenu = products.find(p => p.id === id);
    setCart(currentCart => 
      currentCart.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          if (newQty > (productInMenu?.stock_quantity || 0) && delta > 0) {
            alert("Not enough stock!");
            return item;
          }
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + ((Number(item.price) || 0) * item.quantity), 0).toFixed(2);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    
    // FIX: Retrieve user info to solve the 'user_id' database error seen in your video
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) return alert("Session expired. Please login again.");

    const total = calculateTotal();
    setProcessing(true);

    try {
      await api.post('/orders', { 
        user_id: user.id, // This is the missing link from your error message
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          subtotal: (Number(item.price) * item.quantity).toFixed(2)
        })), 
        total_price: parseFloat(total) 
      });

      alert("Order Placed Successfully! 🧾");
      setCart([]);
      fetchProducts(); 
    } catch (err) {
      console.error(err);
      alert("Checkout failed: " + (err.response?.data?.message || "Check connection"));
    } finally {
      setProcessing(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // Improved Filtering Logic
  const categories = ["All", ...new Set(products.map(p => p.category))];
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="cashier-layout" style={{ display: 'flex', height: '100vh', backgroundColor: '#f9f7f5' }}>
      {/* LEFT: Menu Section */}
      <div style={{ flex: 3, padding: '30px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '25px' }}>
          <h1 style={{ margin: 0, color: 'var(--coffee-dark)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Coffee size={32} color="var(--coffee-medium)" /> Cafe POS
          </h1>
          
          <div style={{ position: 'relative', width: '350px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
            <input 
              type="text" 
              placeholder="Search menu..." 
              className="premium-input" 
              style={{ paddingLeft: '40px', marginBottom: 0, borderRadius: '25px' }}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button onClick={logout} className="logout-btn">
            <LogOut size={18} /> Logout
          </button>
        </div>

        {/* Category Filter Bar */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', overflowX: 'auto', paddingBottom: '10px' }}>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <Loader2 className="animate-spin" size={48} color="var(--coffee-medium)" />
            <p>Brewing your menu...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {filteredProducts.map(p => (
              <div 
                key={p.id} 
                className={`glass-card product-card ${p.stock_quantity <= 0 ? 'out-of-stock' : ''}`} 
                onClick={() => p.stock_quantity > 0 && addToCart(p)}
              >
                {p.stock_quantity <= 0 && <div className="sold-out-badge">SOLD OUT</div>}
                <h3 style={{ marginBottom: '5px' }}>{p.name}</h3>
                <span className="category-tag">{p.category}</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--coffee-medium)' }}>
                    ${Number(p.price).toFixed(2)}
                  </span>
                  <small style={{ color: p.stock_quantity < 10 ? '#dc3545' : '#888', fontWeight: '500' }}>
                    Stock: {p.stock_quantity}
                  </small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT: Order Summary */}
      <div className="glass-card cart-sidebar" style={{ flex: 1, margin: '20px', display: 'flex', flexDirection: 'column', borderRadius: '24px', padding: '25px', border: '1px solid rgba(255,255,255,0.3)' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--coffee-dark)', marginTop: 0 }}>
          <ShoppingCart /> Order Summary
        </h2>

        <div style={{ flex: 1, overflowY: 'auto', margin: '15px 0' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#aaa', marginTop: '60px' }}>
              <Coffee size={40} style={{ opacity: 0.2, marginBottom: '10px' }} />
              <p>Your cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '600' }}>{item.name}</span>
                  <span style={{ fontWeight: 'bold' }}>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <div className="qty-controls">
                    <Minus size={14} className="qty-btn" onClick={() => updateQuantity(item.id, -1)} />
                    <span style={{ minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                    <Plus size={14} className="qty-btn" onClick={() => updateQuantity(item.id, 1)} />
                  </div>
                  <Trash2 size={16} color="#ff4d4f" onClick={() => setCart(cart.filter(i => i.id !== item.id))} style={{ cursor: 'pointer' }} />
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ borderTop: '2px dashed #eee', paddingTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <span style={{ color: '#666' }}>Total Amount</span>
            <span style={{ fontWeight: '800', fontSize: '1.6rem', color: 'var(--coffee-dark)' }}>${calculateTotal()}</span>
          </div>
          <button 
            onClick={handleCheckout} 
            className="save-btn" 
            disabled={cart.length === 0 || processing}
            style={{ width: '100%', padding: '18px', borderRadius: '15px', display: 'flex', justifyContent: 'center' }}
          >
            {processing ? <Loader2 className="animate-spin" /> : "Complete Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}