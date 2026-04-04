import React, { useState } from 'react';
import api from '../utils/api';
import { User, ShieldCheck, Coffee, ArrowLeft } from 'lucide-react';
import './dashboard.css';

export default function Login() {
  const [role, setRole] = useState(null); // Tracks 'admin' or 'cashier'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // We send the email, password, AND the selected role to the backend
      // This allows the server to verify the user belongs to this specific portal
      const res = await api.post('/auth/login', { email, password, role });
      
      // 1. Save the access token and the confirmed role to localStorage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role);

      // 2. Redirect based on the role returned by the server
      if (res.data.user.role === 'admin') {
        window.location.assign('/admin');
      } else {
        window.location.assign('/cashier');
      }
    } catch (err) {
      console.error("Login Error:", err);
      
      // Extract the specific error message from your Express backend
      const errorMessage = err.response?.data?.error || "Login failed. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // PORTAL SELECTION VIEW
  if (!role) {
    return (
      <div className="login-page">
        <div className="role-selection-container">
          <header style={{ textAlign: 'center', marginBottom: '40px' }}>
            <Coffee size={60} color="var(--coffee-medium)" />
            <h1 style={{ color: 'var(--coffee-dark)', marginTop: '10px' }}>Cafe POS System</h1>
            <p style={{ color: '#888' }}>Please select your portal to continue</p>
          </header>

          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            {/* Admin Portal Card */}
            <div className="glass-card role-card" onClick={() => setRole('admin')}>
              <ShieldCheck size={48} color="var(--coffee-medium)" />
              <h3>Administrator</h3>
              <p>Manage Menu & Stats</p>
            </div>

            {/* Cashier Portal Card */}
            <div className="glass-card role-card" onClick={() => setRole('cashier')}>
              <User size={48} color="var(--coffee-medium)" />
              <h3>Cashier</h3>
              <p>Take Orders & Receipts</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LOGIN FORM VIEW
  return (
    <div className="login-page">
      <div className="glass-card login-form-container">
        <button className="back-btn" onClick={() => setRole(null)}>
          <ArrowLeft size={18} /> Back
        </button>
        
        <h2 style={{ textTransform: 'capitalize', color: 'var(--coffee-dark)' }}>{role} Login</h2>
        <p style={{ marginBottom: '25px', fontSize: '14px', color: '#888' }}>
          Enter your credentials to access the {role} panel.
        </p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="email" 
            placeholder="Email Address" 
            className="premium-input" 
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="premium-input" 
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button 
            type="submit" 
            className="save-btn" 
            disabled={loading}
            style={{ width: '100%', marginTop: '10px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Authenticating..." : `Login as ${role}`}
          </button>
        </form>
      </div>
    </div>
  );
}