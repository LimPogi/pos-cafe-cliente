import React from 'react';
import { PlusCircle } from 'lucide-react';

export default function ProductCard({ product, addToCart }) {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: '24px' }}>☕</div>
      <h3 style={{ margin: '10px 0 5px 0' }}>{product.name}</h3>
      <p style={{ color: '#666', margin: '0' }}>${product.price.toFixed(2)}</p>
      <button 
        onClick={() => addToCart(product)}
        style={addBtnStyle}
      >
        <PlusCircle size={16} /> Add to Order
      </button>
    </div>
  );
}

const cardStyle = {
  border: '1px solid #ddd',
  borderRadius: '12px',
  padding: '15px',
  textAlign: 'center',
  backgroundColor: '#fff',
  boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
};

const addBtnStyle = {
  marginTop: '10px',
  padding: '8px 12px',
  backgroundColor: '#6F4E37',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  width: '100%',
  justifyContent: 'center'
};