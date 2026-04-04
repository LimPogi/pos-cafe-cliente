import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { ShoppingCart, Trash2, CreditCard } from 'lucide-react';

export default function Cashier() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ SAFE FETCH
  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      console.log("PRODUCTS:", res.data);

      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("FETCH PRODUCTS ERROR:", err);
      setProducts([]);
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // ✅ SAFE TOTAL CALCULATION
  const calculateTotal = () => {
    return cart
      .reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0)
      .toFixed(2);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Cart is empty!");

    try {
      await api.post('/orders', {
        items: cart,
        total_price: parseFloat(calculateTotal())
      });

      alert("Order Placed Successfully! 🧾");
      setCart([]);
    } catch (err) {
      console.error("CHECKOUT ERROR:", err);
      alert("Checkout failed: " + err.message);
    }
  };

  const printReceipt = (orderItems, total) => {
    const receiptWindow = window.open('', '_blank', 'width=300,height=600');

    receiptWindow.document.write(`
      <html>
        <body style="font-family: monospace; width: 250px;">
          <h2 style="text-align:center">☕ CAFE POS</h2>
          <hr>
          ${orderItems.map(item => `
            <div style="display:flex; justify-content:space-between">
              <span>${item.name} x${item.quantity}</span>
              <span>$${((item.price || 0) * item.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
          <hr>
          <h3 style="text-align:right">TOTAL: $${total}</h3>
          <p style="text-align:center">Thank you!</p>
        </body>
      </html>
    `);

    receiptWindow.document.close();
    receiptWindow.print();
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9f9f9' }}>

      {/* LEFT: Menu */}
      <div style={{ flex: 3, padding: '20px', overflowY: 'auto' }}>
        <h1>Menu</h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '20px'
        }}>
          {products.length === 0 ? (
            <p>No products available</p>
          ) : (
            products.map(p => (
              <ProductCard key={p.id} product={p} addToCart={addToCart} />
            ))
          )}
        </div>
      </div>

      {/* RIGHT: Cart */}
      <div style={{
        flex: 1,
        backgroundColor: '#fff',
        borderLeft: '2px solid #ddd',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h2><ShoppingCart /> Current Order</h2>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {cart.length === 0 ? (
            <p>No items in cart</p>
          ) : (
            cart.map(item => (
              <div key={item.id} style={cartItemStyle}>
                <div>
                  <strong>{item.name}</strong> <br />
                  <small>{item.quantity}x ${item.price}</small>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: 'red',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        <div style={{ borderTop: '2px solid #eee', paddingTop: '20px' }}>
          <h3>Total: ${calculateTotal()}</h3>

          <button onClick={handleCheckout} style={checkoutBtnStyle}>
            <CreditCard /> Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

// STYLES
const cartItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 0',
  borderBottom: '1px solid #eee'
};

const checkoutBtnStyle = {
  width: '100%',
  padding: '15px',
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '18px',
  fontWeight: 'bold',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  gap: '10px'
};