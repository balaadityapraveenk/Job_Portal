import React from 'react';
import { Link, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/Authenticate';
import Home from './Home';
import Jobs from './Jobs';
import JobDetails from './JobDetails';
import Apply from './Apply';
import './style.css';
import Applications from './Applications';
import Contact from './Contact';
import SignIn from './SignIn';
import SignUp from './SignUp';
import AdminDashboard from './AdminDashboard';
import RecruiterDashboard from './RecruiterDashboard';

const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  return (
    <li className="nav-item">
      <Link to={to} className={`nav-link${isActive ? ' active' : ''}`}>
        {children}
      </Link>
    </li>
  );
};

const MainNavBar = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p className="loading-text">Loading Job Portal…</p>
      </div>
    );
  }

  const isAdmin = user?.role === 'ADMIN';
  const isRecruiter = user?.role === 'RECRUITER';

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '?';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo */}
          <div className="navbar-logo">
            <Link to={user ? (isAdmin ? '/admin' : isRecruiter ? '/recruiter' : '/') : '/'} className="logo-link">
              <span className="logo-icon">💼</span>
              <span className="logo-text-main">JobPortal</span>
            </Link>
          </div>

          {/* Nav links */}
          <ul className="nav-menu">
            {!user ? (
              /* ── Visitor navigation ── */
              <>
                <li className="nav-item" style={{ marginLeft: '12px' }}>
                  <Link to="/signin" className="nav-signin-btn">
                    Sign In
                  </Link>
                </li>
                <li className="nav-item" style={{ marginLeft: '8px' }}>
                  <Link to="/signup" className="nav-signup-btn">
                    Sign Up
                  </Link>
                </li>
              </>
            ) : isAdmin ? (
              /* ── Admin navigation ── */
              <>
                <NavLink to="/admin">Dashboard</NavLink>
                <NavLink to="/jobs">Jobs</NavLink>
                
                <li className="nav-item">
                  <div className="user-chip">
                    <div
                      className="user-avatar"
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                      }}
                    >
                      👑
                    </div>
                    <span>{user.username}</span>
                    <span style={{
                      fontSize: '0.65rem',
                      background: 'rgba(245,158,11,0.2)',
                      color: '#fcd34d',
                      border: '1px solid rgba(245,158,11,0.3)',
                      borderRadius: '999px',
                      padding: '1px 7px',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}>
                      Admin
                    </span>
                  </div>
                </li>

                <li className="nav-item">
                  <button onClick={handleLogout} className="logout-btn">
                    🚪 Logout
                  </button>
                </li>
              </>
            ) : isRecruiter ? (
              <>
                <NavLink to="/recruiter">Dashboard</NavLink>
                <NavLink to="/jobs">Jobs</NavLink>

                <li className="nav-item">
                  <div className="user-chip">
                    <div
                      className="user-avatar"
                      style={{
                        background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
                      }}
                    >
                      {initials}
                    </div>
                    <span>{user.companyName || user.username}</span>
                    <span className="role-chip">Recruiter</span>
                  </div>
                </li>

                <li className="nav-item">
                  <button onClick={handleLogout} className="logout-btn">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              /* ── Student navigation ── */
              <>
                <NavLink to="/">Home</NavLink>
                <NavLink to="/jobs">Jobs</NavLink>
                <NavLink to="/applications">Applications</NavLink>
                <NavLink to="/contact">Contact</NavLink>

                <li className="nav-item">
                  <div className="user-chip">
                    <div className="user-avatar">{initials}</div>
                    <span>{user.username}</span>
                  </div>
                </li>

                <li className="nav-item">
                  <button onClick={handleLogout} className="logout-btn">
                    🚪 Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>

      {/* Routes */}
      <main style={{ flex: 1 }}>
        {!user ? (
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Redirect any other request back to SignIn */}
            <Route path="*" element={<Navigate to="/signin" replace />} />
          </Routes>
        ) : (
          <Routes>
            {/* Admin routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/recruiter" element={<RecruiterDashboard />} />

            {/* Common routes */}
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/job/:id" element={<JobDetails />} />
            <Route path="/apply/:id" element={<Apply />} />

            {/* Student-only routes */}
            {!isAdmin && (
              <>
                <Route path="/" element={<Home />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/applications" element={<Applications />} />
              </>
            )}

            {/* Catch-all: role-aware home */}
            <Route path="*" element={<Navigate to={isAdmin ? "/admin" : isRecruiter ? "/recruiter" : "/"} replace />} />
          </Routes>
        )}
      </main>
    </div>
  );
};

export default MainNavBar;
