import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Save credentials to localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.user.role);

      // Redirect based on role
      if (response.data.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/cashier');
      }
    } catch (err) {
      alert("Login Failed: " + (err.response?.data?.error || "Check credentials"));
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
      <form onSubmit={handleLogin} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
        <h2>☕ Cafe POS Login</h2>
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required style={inputStyle} /><br/>
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required style={inputStyle} /><br/>
        <button type="submit" style={btnStyle}>Login</button>
      </form>
    </div>
  );
}

const inputStyle = { display: 'block', margin: '10px 0', padding: '10px', width: '250px' };
const btnStyle = { width: '100%', padding: '10px', background: '#6F4E37', color: 'white', border: 'none', cursor: 'pointer' };