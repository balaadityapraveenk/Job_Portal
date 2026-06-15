import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/Authenticate';
import { API_BASE_URL } from '../config/api';
import './signin.css';

const SignIn = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const resolveEmail = (raw) => {
    const v = raw.trim().toLowerCase();
    if (v === 'admin') return 'admin@jobportal.com';
    if (v === 'student') return 'student@jobportal.com';
    if (v === 'recruiter') return 'recruiter@jobportal.com';
    return raw.trim();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);

    fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resolveEmail(form.email), password: form.password }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const t = await res.text();
          let msg = t;
          try {
            const parsed = JSON.parse(t);
            msg = parsed.detail || parsed.message || t;
          } catch (e) {}
          throw new Error(msg || 'Invalid credentials.');
        }
        return res.json();
      })
      .then((data) => {
        login({
          id: data.user.id,
          username: data.user.name || data.user.email,
          email: data.user.email,
          role: data.user.role,
          companyName: data.user.companyName,
        }, data.token);
        navigate(data.user.role === 'ADMIN' ? '/admin' : data.user.role === 'RECRUITER' ? '/recruiter' : '/');
      })
      .catch((err) => {
        setError(err.message || 'Login failed. Please try again.');
        setLoading(false);
      });
  };

  return (
    <div className="signin-root">
      {/* ── Animated background ── */}
      <div className="signin-bg">
        <div className="signin-orb signin-orb-1" />
        <div className="signin-orb signin-orb-2" />
        <div className="signin-orb signin-orb-3" />
        <div className="signin-grid" />
        {/* floating particles */}
        {[...Array(12)].map((_, i) => (
          <div key={i} className="signin-particle" style={{
            left: `${(i * 8.3) % 100}%`,
            animationDelay: `${i * 0.6}s`,
            animationDuration: `${4 + (i % 4)}s`,
          }} />
        ))}
      </div>

      {/* ── Card ── */}
      <div className="signin-card">
        {/* Rainbow top bar */}
        <div className="signin-card-bar" />

        {/* Brand */}
        <div className="signin-brand">
          <div className="signin-brand-icon">💼</div>
          <span className="signin-brand-name">JobPortal</span>
        </div>

        {/* Heading */}
        <div className="signin-heading">
          <h1 className="signin-title">Welcome back</h1>
          <p className="signin-subtitle">Sign in to your account to continue</p>
        </div>

        {/* Role hint pills */}
        <div className="signin-role-hints">
          <div className="role-hint-pill role-hint-student">
            <span className="role-hint-dot role-dot-student" />
            🎓 Student
          </div>
          <div className="role-hint-sep">·</div>
          <div className="role-hint-pill role-hint-admin">
            <span className="role-hint-dot role-dot-admin" />
            🛡️ Admin
          </div>
          <div className="role-hint-label">— role detected automatically</div>
        </div>

        {/* Error */}
        {error && (
          <div className="signin-error">
            <span className="signin-error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="signin-form">
          {/* Email field */}
          <div className="signin-field">
            <label className="signin-label" htmlFor="signin-email">
              Email / Username
            </label>
            <div className="signin-input-wrap">
              <span className="signin-input-icon">✉️</span>
              <input
                id="signin-email"
                type="text"
                className="signin-input"
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) => { setForm({ ...form, email: e.target.value }); setError(''); }}
                required
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          {/* Password field */}
          <div className="signin-field">
            <label className="signin-label" htmlFor="signin-password">
              Password
            </label>
            <div className="signin-input-wrap">
              <span className="signin-input-icon">🔒</span>
              <input
                id="signin-password"
                type={showPassword ? 'text' : 'password'}
                className="signin-input signin-input-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => { setForm({ ...form, password: e.target.value }); setError(''); }}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="signin-toggle-pw"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="signin-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="signin-spinner" />
                Signing in…
              </>
            ) : (
              <>
                <span>Sign In</span>
                <span className="signin-btn-arrow">→</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="signin-divider">
          <span className="signin-divider-line" />
          <span className="signin-divider-text">or</span>
          <span className="signin-divider-line" />
        </div>

        {/* Footer */}
        <p className="signin-footer">
          Don't have an account?{' '}
          <button className="signin-link" onClick={() => navigate('/signup')}>
            Create one free
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
