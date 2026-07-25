import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(data.error || 'Login failed');
        return;
      }

      login(data.admin, data.token);
      toast.success('Login successful!');
      navigate('/admin');
    } catch (err) {
      toast.error('An error occurred during login');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f111a', color: '#fff' }}>
      <div className="admin-card" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label>Email</label>
            <input 
              type="email" 
              className="admin-input" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="admin-form-group">
            <label>Password</label>
            <input 
              type="password" 
              className="admin-input" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="admin-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
