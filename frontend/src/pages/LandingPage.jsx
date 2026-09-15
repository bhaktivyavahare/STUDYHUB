import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export const LandingPage = () => {
  const { isAuthenticated, user, getDashboardRoute } = useAuth();

  return (
    <div className="container">
      {/* Hero Section */}
      <section
        style={{
          textAlign: 'center',
          padding: '4rem 1.5rem 4.5rem',
          maxWidth: '820px',
          margin: '0 auto',
        }}
      >
        <div style={{ marginBottom: '1.25rem' }}>
          <span
            className="badge badge-approved"
            style={{ padding: '0.35rem 0.85rem', fontSize: '0.85rem' }}
          >
            Academic Study & Resource Sharing Platform
          </span>
        </div>
        <h1
          style={{
            fontSize: '3rem',
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: '1.25rem',
            color: 'var(--text-main)',
            letterSpacing: '-0.03em'
          }}
        >
          Learn. Share. Excel. Together.
        </h1>
        <p
          style={{
            fontSize: '1.15rem',
            color: 'var(--text-muted)',
            marginBottom: '2rem',
            lineHeight: 1.6,
          }}
        >
          StudyHub bridges students and faculty with a structured repository for course notes, lecture slides, question papers, and syllabus resources.
        </p>

        <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {isAuthenticated ? (
            <Link to={getDashboardRoute(user?.role_name)} className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}>
              Go to Your Dashboard
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}>
                Create Student Account
              </Link>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}>
                Sign In to StudyHub
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1rem', marginBottom: '3rem' }}>
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
            Structured Organization
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Organized Academic Catalog</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
            Access branch-specific and semester-sorted lecture notes, previous examination papers, and unit-wise study modules.
          </p>
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
            Peer & Faculty Verification
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Faculty Moderation</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
            Faculty members verify submissions and share official course outlines, guaranteeing study material accuracy and quality.
          </p>
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
            Security & Controls
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Role-Based Permissions</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
            Secure token authentication and strict role-based access ensure students and faculty have access to appropriate actions.
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
