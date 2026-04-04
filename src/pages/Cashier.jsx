import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { ShoppingCart, Trash2, CreditCard, Coffee, Loader2, LogOut, Plus, Minus } from 'lucide-react';
import './dashboard.css'; 

export default function Cashier() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      // Ensure we handle the data structure correctly
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("FETCH ERROR:", err);
      alert("Could not load products. Please check if your server is running.");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
  // Add this safety check at the very top of the function
  if (!product || product.stock_quantity === null || product.stock_quantity === undefined) {
    console.error("Product data is incomplete:", product);
    return; 
  }

  setCart(currentCart => {
    const existing = currentCart.find(item => item.id === product.id);
    if (existing && existing.quantity >= product.stock_quantity) {
      alert("Not enough stock available!");
      return currentCart;
    }
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(currentCart => 
      currentCart.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const removeFromCart = (id) => {
    if(window.confirm("Remove this item from cart?")) {
      setCart(cart.filter(item => item.id !== id));
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + ((Number(item.price) || 0) * item.quantity), 0).toFixed(2);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    
    const total = calculateTotal();
    setProcessing(true);

    try {
      // Sending data that matches your Supabase schema
      await api.post('/orders', { 
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          subtotal: (Number(item.price) * item.quantity).toFixed(2)
        })), 
        total_price: parseFloat(total) 
      });

      alert("Order Placed Successfully! 🧾");
      setCart([]);
      fetchProducts(); // Refresh stock levels
    } catch (err) {
      console.error("CHECKOUT ERROR:", err);
      alert(err.response?.data?.error || "Checkout failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="cashier-layout" style={{ display: 'flex', height: '100vh', backgroundColor: '#f9f7f5' }}>
      {/* LEFT: Menu */}
      <div style={{ flex: 3, padding: '30px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Coffee size={32} color="var(--coffee-medium)" />
            <h1 style={{ margin: 0, color: 'var(--coffee-dark)', fontSize: '2rem' }}>Cafe Menu</h1>
          </div>
          <button onClick={logout} className="logout-btn" style={{ padding: '8px 15px' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <Loader2 className="animate-spin" size={48} color="var(--coffee-medium)" />
            <p style={{ marginTop: '15px', color: '#888', fontWeight: '500' }}>Brewing your menu...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {products.map(p => (
              <div key={p.id} className="glass-card product-card" onClick={() => addToCart(p)} style={{ cursor: 'pointer' }}>
                <div style={{ marginBottom: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{p.name}</h3>
                  <span className="category-tag" style={{ fontSize: '0.75rem', opacity: 0.7 }}>{p.category}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontWeight: 'bold', color: 'var(--coffee-medium)', margin: 0 }}>
                    ${Number(p.price).toFixed(2)}
                  </p>
                  <small style={{ color: p.stock_quantity < 10 ? '#dc3545' : '#888' }}>
                    Stock: {p.stock_quantity}
                  </small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT: Cart Sidebar */}
      <div className="glass-card" style={{ flex: 1, margin: '20px', display: 'flex', flexDirection: 'column', borderRadius: '20px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--coffee-dark)', borderBottom: '1px solid #eee', paddingBottom: '15px', margin: 0 }}>
          <ShoppingCart /> Order Summary
        </h2>

        <div style={{ flex: 1, overflowY: 'auto', padding: '15px 0' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <p style={{ color: '#aaa' }}>Your cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
                  <span>{item.name}</span>
                  <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f5f5f5', borderRadius: '20px', padding: '2px 8px' }}>
                    <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1); }} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><Minus size={14}/></button>
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{item.quantity}</span>
                    <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1); }} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><Plus size={14}/></button>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }} style={{ border: 'none', background: 'none', color: '#ff4d4f', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ borderTop: '2px solid #f0f0f0', paddingTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <span style={{ fontSize: '1.1rem', color: '#666' }}>Total Amount</span>
            <span style={{ fontWeight: '800', fontSize: '1.4rem', color: 'var(--coffee-dark)' }}>
              ${calculateTotal()}
            </span>
          </div>
          <button 
            onClick={handleCheckout} 
            className="save-btn" 
            disabled={cart.length === 0 || processing}
            style={{ width: '100%', padding: '15px', borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold' }}
          >
            {processing ? <Loader2 className="animate-spin" /> : <><CreditCard size={20} /> Complete Payment</>}
          </button>
        </div>
      </div>
    </div>
  );
}