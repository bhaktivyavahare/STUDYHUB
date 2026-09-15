import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { getDashboardStats } from '../services/engagementService';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getDashboardStats()
      .then(res => setStats(res.data))
      .catch(console.error);
  }, []);

  return (


    
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
          <h1>System Administration Dashboard</h1>
          <span className="badge badge-rejected" style={{ fontSize: '0.72rem' }}>
            ADMINISTRATOR
          </span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          StudyHub Platform Global Management & Review Control Center
        </p>
      </div>

      {/* Summary Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {[
          { label: 'Pending Review Queue', value: stats?.pending_approvals ?? '0', color: 'var(--warning)', link: '/admin-panel' },
          { label: 'Total Registered Users', value: stats?.total_users ?? '0', color: 'var(--primary)', link: '/admin-panel' },
          { label: 'Total Approved Resources', value: stats?.total_resources ?? '0', color: 'var(--success)', link: '/explore' },
          { label: 'My Submissions', value: stats?.my_uploads ?? '0', color: 'var(--secondary)', link: '/my-uploads' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ position: 'relative' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: stat.color, marginBottom: '0.25rem' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {stat.label}
            </div>
            {stat.link && <Link to={stat.link} style={{ position: 'absolute', inset: 0 }} />}
          </div>
        ))}
      </div>

      {/* Admin Actions */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-muted)' }}>
          System Administration Controls
        </h3>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/admin-panel" className="btn btn-primary">Open Admin Panel</Link>
          <Link to="/explore" className="btn btn-secondary">Browse All Resources</Link>
          <Link to="/my-uploads" className="btn btn-secondary">My Submissions</Link>
          <Link to="/profile" className="btn btn-secondary">My Account Profile</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
