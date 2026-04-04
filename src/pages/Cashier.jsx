import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { ShoppingCart, Trash2, CreditCard, Coffee, Loader2, LogOut } from 'lucide-react';
import './dashboard.css'; 

export default function Cashier() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

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
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0).toFixed(2);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    const total = calculateTotal();
    try {
      await api.post('/orders', { items: cart, total_price: parseFloat(total) });
      alert("Order Placed Successfully! 🧾");
      setCart([]);
    } catch (err) {
      alert("Checkout failed. Check your connection.");
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-soft)' }}>
      {/* LEFT: Menu */}
      <div style={{ flex: 3, padding: '30px', overflowY: 'auto' }}>
        
        {/* HEADER WITH LOGOUT */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Coffee size={32} color="var(--coffee-medium)" />
            <h1 style={{ margin: 0, color: 'var(--coffee-dark)' }}>Cafe Menu</h1>
          </div>
          
          <button onClick={logout} className="logout-btn">
            <LogOut size={18} /> Logout
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <Loader2 className="animate-spin" size={40} color="var(--coffee-medium)" />
            <p style={{ marginTop: '10px', color: '#888' }}>Brewing your menu...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {products.length === 0 ? (
              <p>No products available.</p>
            ) : (
              products.map(p => (
                <div key={p.id} className="glass-card product-card" onClick={() => addToCart(p)}>
                  <h3 style={{ margin: '0 0 5px 0' }}>{p.name}</h3>
                  <span className="category-tag">{p.category}</span>
                  <p style={{ fontWeight: 'bold', color: 'var(--coffee-medium)', marginTop: '10px' }}>
                    ${Number(p.price).toFixed(2)}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* RIGHT: Cart Sidebar */}
      <div className="glass-card" style={{ flex: 1, margin: '20px', display: 'flex', flexDirection: 'column', borderRadius: '15px', textAlign: 'left' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--coffee-dark)' }}>
          <ShoppingCart /> Cart
        </h2>

        <div style={{ flex: 1, overflowY: 'auto', margin: '20px 0' }}>
          {cart.length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center', marginTop: '20px' }}>Your cart is empty</p>
          ) : (
            cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <div>
                  <div style={{ fontWeight: '600' }}>{item.name}</div>
                  <small>{item.quantity}x ${Number(item.price).toFixed(2)}</small>
                </div>
                <button onClick={() => removeFromCart(item.id)} style={{ border: 'none', background: 'none', color: '#dc3545', cursor: 'pointer' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        <div style={{ borderTop: '2px solid var(--bg-soft)', paddingTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <span style={{ fontWeight: 'bold' }}>Total</span>
            <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--coffee-medium)' }}>
              ${calculateTotal()}
            </span>
          </div>
          <button onClick={handleCheckout} className="save-btn" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <CreditCard size={20} /> Checkout
          </button>
        </div>
      </div>
    </div>
  );
}