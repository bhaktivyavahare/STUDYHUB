import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { getDashboardStats } from '../services/engagementService';

export const StudentDashboard = () => {
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
          <h1>Welcome, {user?.name?.split(' ')[0]}</h1>
          <span className="badge badge-approved" style={{ fontSize: '0.72rem' }}>
            STUDENT PORTAL
          </span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {user?.branch_name ? user.branch_name : 'Academic Community'}
          {user?.semester_name ? ` • ${user.semester_name}` : ''}
        </p>
      </div>

      {/* Stats Summary Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {[
          { label: 'My Submissions', value: stats?.my_uploads ?? '0', link: '/my-uploads' },
          { label: 'Total Downloads', value: stats?.my_downloads ?? '0', link: null },
          { label: 'Bookmarked Notes', value: stats?.my_bookmarks ?? '0', link: '/bookmarks' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ position: 'relative' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {stat.label}
            </div>
            {stat.link && <Link to={stat.link} style={{ position: 'absolute', inset: 0 }} />}
          </div>
        ))}
      </div>

      {/* Navigation & Quick Actions */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-muted)' }}>
          Quick Navigation & Actions
        </h3>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/explore" className="btn btn-primary">Browse All Resources</Link>
          <Link to="/resources/upload" className="btn btn-secondary">Upload Material</Link>
          <Link to="/my-uploads" className="btn btn-secondary">My Uploads</Link>
          <Link to="/bookmarks" className="btn btn-secondary">Saved Bookmarks</Link>
          <Link to="/profile" className="btn btn-secondary">Edit Profile</Link>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
