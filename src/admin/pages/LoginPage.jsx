import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error('Please enter email and password');
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(data.error || 'Invalid credentials');
        return;
      }

      const userData = data.admin || data.user || { name: 'Admin', email: email.trim() };
      login(userData, data.token);
      toast.success('Welcome back, Admin!');
      navigate('/admin');
    } catch (err) {
      toast.error('An error occurred during login. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b0f19', color: '#fff', padding: '1rem' }}>
      <div className="admin-card" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem', border: '1px solid #1e293b', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
        
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(79, 70, 229, 0.15)', border: '1px solid rgba(79, 70, 229, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#6366f1' }}>
            <ShieldCheck size={32} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f8fafc' }}>Waqas Provision Store</h2>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Admin Portal Authentication</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div>
            <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#cbd5e1' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input 
                type="email" 
                className="admin-input" 
                placeholder="admin@freshmarketgrocery.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.75rem' }}
                required
              />
            </div>
          </div>

          <div>
            <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#cbd5e1' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="admin-input" 
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="admin-btn" 
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', backgroundColor: '#4f46e5', color: '#fff', fontSize: '0.95rem', fontWeight: 600, marginTop: '0.5rem' }}
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

      </div>
    </div>
  );
}
