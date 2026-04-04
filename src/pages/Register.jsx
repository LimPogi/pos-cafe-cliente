import React, { useState } from 'react';
import api from '../utils/api';
import { Coffee, ArrowLeft } from 'lucide-react';
import './dashboard.css';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin' 
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // This sends the data to your Render backend
      // Your backend now knows to handle 'password' separately from the 'users' table!
      await api.post('/auth/register', formData);
      
      alert("Registration successful! You can now login.");
      window.location.assign('/'); 
    } catch (err) {
      // Cites the error message from your server logs if available
      alert(err.response?.data?.error || "Registration failed. Check if email already exists.");
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
          {/* Added 'value' to inputs to make them "controlled components" */}
          <input 
            name="name" 
            placeholder="Full Name" 
            className="premium-input" 
            value={formData.name}
            onChange={handleChange} 
            required 
          />
          <input 
            name="email" 
            type="email" 
            placeholder="Email Address" 
            className="premium-input" 
            value={formData.email}
            onChange={handleChange} 
            required 
          />
          <input 
            name="password" 
            type="password" 
            placeholder="Password (min 6 characters)" 
            className="premium-input" 
            value={formData.password}
            onChange={handleChange} 
            required 
          />
          
          <select 
            name="role" 
            className="premium-input" 
            value={formData.role}
            onChange={handleChange} 
            style={{ background: 'white' }}
          >
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