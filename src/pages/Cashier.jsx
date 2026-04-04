import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { ShoppingCart, Trash2, CreditCard, Coffee, Loader2, LogOut, Plus, Minus, Search } from 'lucide-react';
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
    const stock = Number(product.stock_quantity) || 0;
    if (stock <= 0) return alert("This item is out of stock!");

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= stock) {
          alert("Stock limit reached!");
          return prev;
        }
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    const productInMenu = products.find(p => p.id === id);
    const stockLimit = Number(productInMenu?.stock_quantity) || 0;

    setCart(prev => 
      prev.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          if (newQty > stockLimit && delta > 0) return item;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0).toFixed(2);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setProcessing(true);

    try {
      const total = calculateTotal();
      await api.post('/orders', { 
        total_price: parseFloat(total),
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          subtotal: (Number(item.price) * item.quantity).toFixed(2)
        }))
      });

      alert("Order Placed Successfully! 🧾");
      setCart([]);
      fetchProducts(); 
    } catch (err) {
      alert(err.response?.data?.error || "Checkout failed. Log out and back in.");
    } finally {
      setProcessing(false);
    }
  };

  const categories = ["All", ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p => 
    (activeCategory === "All" || p.category === activeCategory) &&
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="cashier-layout" style={{ display: 'flex', height: '100vh', backgroundColor: '#f9f7f5' }}>
      <div style={{ flex: 3, padding: '30px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h1 style={{ color: 'var(--coffee-dark)', margin: 0 }}>Cafe POS</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
             <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '10px', top: '12px', color: '#888' }} />
                <input 
                  type="text" 
                  placeholder="Search menu..." 
                  className="premium-input" 
                  style={{ paddingLeft: '35px', width: '250px' }}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <button onClick={() => {localStorage.clear(); window.location.href="/"}} className="logout-btn"><LogOut size={18} /></button>
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', overflowX: 'auto' }}>
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={activeCategory === cat ? "category-btn active" : "category-btn"}
              style={{
                padding: '8px 15px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                backgroundColor: activeCategory === cat ? 'var(--coffee-medium)' : '#fff',
                color: activeCategory === cat ? '#fff' : '#666'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? <Loader2 className="animate-spin" /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {filteredProducts.map(p => (
              <div key={p.id} className="glass-card product-card" onClick={() => addToCart(p)} style={{ opacity: p.stock_quantity <= 0 ? 0.5 : 1 }}>
                <span className="category-tag">{p.category}</span>
                <h3 style={{ margin: '10px 0' }}>{p.name}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold' }}>${Number(p.price).toFixed(2)}</span>
                  <small>Stock: {p.stock_quantity}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card" style={{ flex: 1, margin: '20px', display: 'flex', flexDirection: 'column', padding: '20px' }}>
        <h2 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Order Summary</h2>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {cart.map(item => (
            <div key={item.id} style={{ marginBottom: '15px', padding: '10px', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>{item.name}</span>
                <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <div className="qty-controls">
                  <Minus size={14} onClick={() => updateQuantity(item.id, -1)} />
                  <span>{item.quantity}</span>
                  <Plus size={14} onClick={() => updateQuantity(item.id, 1)} />
                </div>
                <Trash2 size={16} color="red" onClick={() => setCart(cart.filter(i => i.id !== item.id))} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '2px solid #eee', paddingTop: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold' }}>
            <span>Total</span>
            <span>${calculateTotal()}</span>
          </div>
          <button onClick={handleCheckout} className="save-btn" disabled={cart.length === 0 || processing} style={{ width: '100%', marginTop: '15px' }}>
            {processing ? <Loader2 className="animate-spin" /> : "Complete Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}