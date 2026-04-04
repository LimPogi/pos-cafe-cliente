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

  const calculateTotal = () => cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0).toFixed(2);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    // DEBUGGING: Check what is actually in storage
    const rawUser = localStorage.getItem('user');
    console.log("Current User Data in Storage:", rawUser);
    
    const userData = rawUser ? JSON.parse(rawUser) : null;

    if (!userData || !userData.id) {
      alert("Session error: User ID not found. Please log out and back in.");
      return;
    }

    setProcessing(true);
    try {
      const total = calculateTotal();
      await api.post('/orders', { 
        user_id: userData.id, 
        total_price: parseFloat(total),
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          subtotal: (Number(item.price) * item.quantity).toFixed(2)
        }))
      });

      alert("Order Successful! 🧾");
      setCart([]);
      fetchProducts(); 
    } catch (err) {
      alert("Checkout failed. Make sure the 'orders' table has an INSERT policy.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="cashier-layout" style={{ display: 'flex', height: '100vh', backgroundColor: '#f9f7f5' }}>
      <div style={{ flex: 3, padding: '30px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h1>JCA Cucina POS</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
             <input type="text" placeholder="Search..." className="premium-input" onChange={(e) => setSearchTerm(e.target.value)} />
             <button onClick={() => {localStorage.clear(); window.location.href="/"}} className="logout-btn"><LogOut size={18}/></button>
          </div>
        </div>

        {loading ? <Loader2 className="animate-spin" /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
              <div key={p.id} className="glass-card product-card" onClick={() => addToCart(p)} style={{ opacity: p.stock_quantity <= 0 ? 0.5 : 1 }}>
                <h3>{p.name}</h3>
                <p>${Number(p.price).toFixed(2)}</p>
                <small>Stock: {p.stock_quantity}</small>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card cart-sidebar" style={{ width: '350px', margin: '20px', padding: '20px' }}>
        <h2>Cart</h2>
        {cart.map(item => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>{item.name} (x{item.quantity})</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div style={{ marginTop: 'auto', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
          <h3>Total: ${calculateTotal()}</h3>
          <button onClick={handleCheckout} className="save-btn" style={{ width: '100%' }} disabled={processing}>
            {processing ? <Loader2 className="animate-spin" /> : "Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
}