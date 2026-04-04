import React, { useState } from 'react';
import api from '../utils/api';
import { Coffee, ArrowLeft } from 'lucide-react';
import './dashboard.css';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin' // Default to admin for your first setup
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      alert("Registration successful! You can now login.");
      window.location.assign('/'); // Send back to login
    } catch (err) {
      alert(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="glass-card login-form-container">
        <a href="/" className="back-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <ArrowLeft size={18} /> Back to Login
        </a>
        
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <Coffee size={40} color="var(--coffee-medium)" />
            <h2 style={{ color: 'var(--coffee-dark)' }}>Create Account</h2>
        </div>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input name="name" placeholder="Full Name" className="premium-input" onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email Address" className="premium-input" onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" className="premium-input" onChange={handleChange} required />
          
          <select name="role" className="premium-input" onChange={handleChange} style={{ background: 'white' }}>
            <option value="admin">Administrator</option>
            <option value="cashier">Cashier</option>
          </select>

          <button type="submit" className="save-btn" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
            {loading ? "Creating Account..." : "Register Account"}
          </button>
        </form>
      </div>
    </div>
  );
}