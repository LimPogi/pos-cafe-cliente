import React, { useState } from 'react';
import api from '../utils/api';
import { User, ShieldCheck, Coffee, ArrowLeft } from 'lucide-react';
import './dashboard.css';

export default function Login() {
  const [role, setRole] = useState(null); // 'admin' or 'cashier'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await api.post('/auth/login', { email, password, role });
    
    // 1. Save credentials to local storage
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('role', role);

    // 2. Force a full page reload to the specific dashboard
    // This is the most reliable way to clear the login state
    if (role === 'admin') {
      window.location.assign('/admin');
    } else {
      window.location.assign('/cashier');
    }
  } catch (err) {
    console.error("Login Error:", err);
    alert("Login failed! Please check your credentials for the " + role + " portal.");
  }
};

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
            <div className="glass-card role-card" onClick={() => setRole('admin')}>
              <ShieldCheck size={48} color="var(--coffee-medium)" />
              <h3>Administrator</h3>
              <p>Manage Menu & Stats</p>
            </div>

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

  return (
    <div className="login-page">
      <div className="glass-card login-form-container">
        <button className="back-btn" onClick={() => setRole(null)}>
          <ArrowLeft size={18} /> Back
        </button>
        
        <h2 style={{ textTransform: 'capitalize', color: 'var(--coffee-dark)' }}>{role} Login</h2>
        <p style={{ marginBottom: '25px', fontSize: '14px', color: '#888' }}>Enter your credentials to access the {role} panel.</p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="email" 
            placeholder="Email Address" 
            className="premium-input" 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="premium-input" 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button type="submit" className="save-btn" style={{ width: '100%', marginTop: '10px' }}>
            Login as {role}
          </button>
        </form>
      </div>
    </div>
  );
}