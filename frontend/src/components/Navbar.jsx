import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { getDashboardStats } from '../services/engagementService';

export const Navbar = () => {
  const { user, isAuthenticated, logout, getDashboardRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && (user?.role_name === 'ADMIN' || user?.role_name === 'FACULTY')) {
      getDashboardStats()
        .then(res => setPendingCount(res.data.pending_approvals || 0))
        .catch(() => {});
    }
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const ROLE_BADGE = {
    ADMIN: { bg: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
    FACULTY: { bg: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' },
    STUDENT: { bg: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' },
  };
  const roleBadgeStyle = ROLE_BADGE[user?.role_name] || ROLE_BADGE.STUDENT;

  return (
    <nav className="navbar">
      <Link to="/" className="brand-logo">
        <span style={{
          background: 'var(--primary)',
          color: '#ffffff',
          width: 28, height: 28,
          borderRadius: 6,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: '0.85rem'
        }}>SH</span>
        <span>StudyHub</span>
      </Link>

      <ul className="nav-links">
        <li><Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link></li>
        <li><Link to="/explore" className={`nav-link ${isActive('/explore') ? 'active' : ''}`}>Explore</Link></li>

        {isAuthenticated ? (
          <>
            <li><Link to="/resources/upload" className={`nav-link ${isActive('/resources/upload') ? 'active' : ''}`}>Upload</Link></li>
            <li><Link to="/my-uploads" className={`nav-link ${isActive('/my-uploads') ? 'active' : ''}`}>My Uploads</Link></li>
            <li><Link to="/bookmarks" className={`nav-link ${isActive('/bookmarks') ? 'active' : ''}`}>Bookmarks</Link></li>

            {(user?.role_name === 'ADMIN' || user?.role_name === 'FACULTY') && (
              <li style={{ position: 'relative' }}>
                <Link to="/admin-panel" className={`nav-link ${isActive('/admin-panel') ? 'active' : ''}`}>
                  Admin Panel
                  {pendingCount > 0 && (
                    <span style={{
                      position: 'absolute', top: -4, right: -10,
                      background: '#dc2626', color: '#ffffff', borderRadius: 9999,
                      fontSize: '0.65rem', fontWeight: 700, padding: '0.05rem 0.35rem',
                      lineHeight: 1.2
                    }}>
                      {pendingCount}
                    </span>
                  )}
                </Link>
              </li>
            )}

            <li>
              <Link to={getDashboardRoute(user?.role_name)} className="nav-link">Dashboard</Link>
            </li>

            <li>
              <Link to="/profile" style={{ textDecoration: 'none' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 700, color: '#ffffff'
                }}>
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              </Link>
            </li>

            <li>
              <span style={{ padding: '0.2rem 0.55rem', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700, ...roleBadgeStyle }}>
                {user?.role_name}
              </span>
            </li>

            <li>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li><Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`}>Login</Link></li>
            <li>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.4rem 0.95rem', fontSize: '0.85rem' }}>
                Get Started
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
