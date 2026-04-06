import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { ShoppingCart, Trash2, Coffee, Loader2, LogOut, Plus, Minus, Search, X } from 'lucide-react';
import './dashboard.css'; 

export default function Cashier() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const addToCart = (product) => {
    if (product.stock_quantity <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) return prev;
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
    const rawUser = localStorage.getItem('user');
    const userData = rawUser ? JSON.parse(rawUser) : null;

    if (!userData) {
      alert("Session error: Please log in again.");
      return;
    }

    setProcessing(true);
    try {
      const total = calculateTotal();
      // FIXED: Sending exactly what order.js expects (id and price)
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
      fetchProducts(); 
    } catch (err) {
      console.error(err);
      alert("Checkout failed. Check console for details.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="cashier-layout" style={{ display: 'flex', height: '100vh', backgroundColor: '#f9f7f5' }}>
      <div style={{ flex: 3, padding: '30px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h1 style={{ color: '#3c2a21' }}>JCA Cucina Menu</h1>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
             <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '10px', top: '12px', color: '#888' }}/>
                <input type="text" placeholder="Search menu..." className="premium-input" style={{ paddingLeft: '35px' }} onChange={(e) => setSearchTerm(e.target.value)} />
             </div>
             <button onClick={() => {localStorage.clear(); window.location.href="/"}} className="logout-btn"><LogOut size={18}/></button>
          </div>
        </div>

        {loading ? <Loader2 className="animate-spin" /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
              <div key={p.id} className="glass-card product-card" onClick={() => addToCart(p)} style={{ opacity: p.stock_quantity <= 0 ? 0.5 : 1 }}>
                <div className="category-tag" style={{ width: 'fit-content', marginBottom: '10px' }}>{p.category}</div>
                <h3 style={{ margin: '5px 0' }}>{p.name}</h3>
                <p style={{ fontWeight: 'bold', color: '#6f4e37' }}>${Number(p.price).toFixed(2)}</p>
                <small>Stock: {p.stock_quantity}</small>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card cart-sidebar" style={{ width: '400px', margin: '20px', padding: '0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><ShoppingCart /> Cart</h2>
        </div>
        
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
            {cart.length === 0 && <p style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>Your cart is empty</p>}
            {cart.map(item => (
            <div key={item.id} className="cart-item-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #f5f5f5' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600' }}>{item.name}</div>
                    <div style={{ fontSize: '13px', color: '#888' }}>{item.quantity} x ${Number(item.price).toFixed(2)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontWeight: 'bold' }}>${(item.price * item.quantity).toFixed(2)}</span>
                    <button onClick={() => removeFromCart(item.id)} className="remove-item-btn" style={{ color: '#ff4d4d', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
            ))}
        </div>

        <div style={{ padding: '20px', backgroundColor: '#fffaf5', borderRadius: '0 0 15px 15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Total:</span>
            <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#3c2a21' }}>${calculateTotal()}</span>
          </div>
          <button onClick={handleCheckout} className="save-btn" style={{ width: '100%' }} disabled={processing || cart.length === 0}>
            {processing ? <Loader2 className="animate-spin" /> : "Complete Order"}
          </button>
        </div>
      </div>
    </div>
  );
}