import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/Authenticate';
import { API_BASE_URL } from '../config/api';
import './style.css';

const SignUp = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'USER',
    companyName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (formData.role === 'RECRUITER' && !formData.companyName.trim()) {
      setError('Company name is required for recruiter accounts.');
      return;
    }

    setLoading(true);

    fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        companyName: formData.companyName,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          let msg = text;
          try {
            const parsed = JSON.parse(text);
            msg = parsed.detail || parsed.message || text;
          } catch (e) {}
          throw new Error(msg || 'Registration failed');
        }
        return res.json();
      })
      .then((data) => {
        // Automatically log in to retrieve the JWT token
        return fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });
      })
      .then((res) => {
        if (!res.ok) throw new Error('Automatic login failed');
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
        navigate(data.user.role === 'RECRUITER' ? '/recruiter' : '/');
      })
      .catch((err) => {
        console.error('Registration error:', err);
        setError(err.message || 'Registration failed. Please try again.');
        setLoading(false);
      });
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-decoration">
        <div className="auth-bg-orb auth-bg-orb-1" />
        <div className="auth-bg-orb auth-bg-orb-2" />
      </div>

      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">💼</div>
          <div className="auth-brand-name">JobPortal</div>
        </div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join thousands of job seekers finding their dream role</p>

        {error && <div className="error-message">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="signup-username">Username</label>
            <input
              id="signup-username"
              type="text"
              name="username"
              className="form-control"
              placeholder="johndoe"
              value={formData.username}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-email">Email Address</label>
            <input
              id="signup-email"
              type="email"
              name="email"
              className="form-control"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              name="password"
              className="form-control"
              placeholder="Min. 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-role">Account Type</label>
            <select
              id="signup-role"
              name="role"
              className="form-control"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="USER">Student / Job Seeker</option>
              <option value="RECRUITER">Recruiter / Company</option>
            </select>
          </div>

          {formData.role === 'RECRUITER' && (
            <div className="form-group">
              <label className="form-label" htmlFor="signup-company">Company Name</label>
              <input
                id="signup-company"
                type="text"
                name="companyName"
                className="form-control"
                placeholder="Your company"
                value={formData.companyName}
                onChange={handleChange}
                required
                autoComplete="organization"
              />
            </div>
          )}

          <button type="submit" className="auth-submit-btn" disabled={loading} id="signup-btn">
            {loading ? 'Creating account…' : '→ Create Account'}
          </button>
        </form>

        <div className="auth-divider">or</div>

        <p className="auth-switch-text">
          Already have an account?{' '}
          <button className="link-button" onClick={() => navigate('/signin')}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
