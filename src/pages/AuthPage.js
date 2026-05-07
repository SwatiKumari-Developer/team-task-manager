import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

export default function AuthPage() {
  const { login, signup } = useAuth();
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    let result;
    if (tab === 'login') {
      result = login(form.email, form.password);
    } else {
      if (!form.name.trim()) { setError('Name is required'); setLoading(false); return; }
      result = signup(form.name, form.email, form.password, form.role);
    }
    if (result.error) setError(result.error);
    setLoading(false);
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-box">TM</div>
          <div>
            <div className="logo-title">TaskFlow</div>
            <div className="logo-sub">Team Task Manager</div>
          </div>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>Sign In</button>
          <button className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => { setTab('signup'); setError(''); }}>Sign Up</button>
        </div>

        {tab === 'login' && (
          <div className="demo-hint">
            <strong>Demo:</strong> admin@demo.com / admin123 &nbsp;|&nbsp; bob@demo.com / bob123
          </div>
        )}

        <form onSubmit={submit}>
          {tab === 'signup' && (
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" type="text" placeholder="John Doe" value={form.name} onChange={handle} required />
            </div>
          )}
          <div className="form-group">
            <label>Email Address</label>
            <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handle} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handle} required minLength={6} />
          </div>
          {tab === 'signup' && (
            <div className="form-group">
              <label>Role</label>
              <select name="role" value={form.role} onChange={handle}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
