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

  // --- FIXED ADD TO CART LOGIC ---
  const addToCart = (product) => {
    if (!product || product.stock_quantity === undefined) return;

    const availableStock = product.stock_quantity || 0;
    if (availableStock <= 0) return alert("This item is out of stock!");

    setCart(currentCart => {
      const existing = currentCart.find(item => item.id === product.id);
      
      if (existing) {
        if (existing.quantity >= availableStock) {
          alert("Cannot add more. Limit reached based on stock.");
          return currentCart;
        }
        return currentCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // If it doesn't exist, add it as a new item
      return [...currentCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    const productInMenu = products.find(p => p.id === id);
    const stockLimit = productInMenu?.stock_quantity || 0;

    setCart(currentCart => 
      currentCart.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          if (newQty > stockLimit && delta > 0) {
            alert("Not enough stock!");
            return item;
          }
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const removeFromCart = (id) => {
    if(window.confirm("Remove this item?")) {
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
      fetchProducts(); 
    } catch (err) {
      alert("Checkout failed. Check your connection.");
    } finally {
      setProcessing(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // Filter products based on search
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="cashier-layout" style={{ display: 'flex', height: '100vh', backgroundColor: '#f9f7f5' }}>
      {/* LEFT: Menu */}
      <div style={{ flex: 3, padding: '30px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Coffee size={32} color="var(--coffee-medium)" />
            <h1 style={{ margin: 0, color: 'var(--coffee-dark)' }}>Cafe Menu</h1>
          </div>
          
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
            <input 
              type="text" 
              placeholder="Search drinks or category..." 
              className="premium-input" 
              style={{ paddingLeft: '40px', marginBottom: 0 }}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button onClick={logout} className="logout-btn">
            <LogOut size={18} /> Logout
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <Loader2 className="animate-spin" size={48} color="var(--coffee-medium)" />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {filteredProducts.map(p => (
              <div 
                key={p.id} 
                className={`glass-card product-card ${p.stock_quantity <= 0 ? 'out-of-stock' : ''}`} 
                onClick={() => p.stock_quantity > 0 && addToCart(p)}
                style={{ position: 'relative', opacity: p.stock_quantity <= 0 ? 0.6 : 1 }}
              >
                {p.stock_quantity <= 0 && (
                  <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#dc3545', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>SOLD OUT</div>
                )}
                <h3>{p.name}</h3>
                <span className="category-tag">{p.category}</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--coffee-medium)' }}>${Number(p.price).toFixed(2)}</span>
                  <small style={{ color: '#888' }}>Stock: {p.stock_quantity}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT: Cart Sidebar */}
      <div className="glass-card" style={{ flex: 1, margin: '20px', display: 'flex', flexDirection: 'column', borderRadius: '20px', padding: '25px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--coffee-dark)' }}><ShoppingCart /> Order</h2>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {cart.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#aaa', marginTop: '50px' }}>Empty Cart</p>
          ) : (
            cart.map(item => (
              <div key={item.id} style={{ padding: '15px 0', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '600' }}>{item.name}</span>
                  <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <div className="qty-controls" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f5f5f5', padding: '5px 10px', borderRadius: '20px' }}>
                    <Minus size={14} onClick={() => updateQuantity(item.id, -1)} style={{ cursor: 'pointer' }} />
                    <span style={{ fontWeight: 'bold' }}>{item.quantity}</span>
                    <Plus size={14} onClick={() => updateQuantity(item.id, 1)} style={{ cursor: 'pointer' }} />
                  </div>
                  <Trash2 size={16} color="#ff4d4f" onClick={() => removeFromCart(item.id)} style={{ cursor: 'pointer' }} />
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ borderTop: '2px solid #eee', paddingTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <span>Total</span>
            <span style={{ fontWeight: 'bold', fontSize: '1.4rem' }}>${calculateTotal()}</span>
          </div>
          <button 
            onClick={handleCheckout} 
            className="save-btn" 
            disabled={cart.length === 0 || processing}
            style={{ width: '100%', padding: '15px' }}
          >
            {processing ? <Loader2 className="animate-spin" /> : "Complete Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}