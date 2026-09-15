import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile, updateMyProfile } from '../services/engagementService';
import { useAuth } from '../hooks/useAuth';

const MyProfile = () => {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await getMyProfile();
      setProfile(res.data);
      setFormData({ name: res.data.name, bio: res.data.bio || '' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await updateMyProfile(formData);
      setProfile(prev => ({ ...prev, ...formData }));
      setEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      Loading account profile...
    </div>
  );

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '760px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1.75rem' }}>User Profile</h1>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Profile Info Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem', fontWeight: 700, color: 'white', flexShrink: 0
          }}>
            {profile?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)' }}>{profile?.name}</h2>
              <span className={`badge badge-${profile?.role_name === 'ADMIN' ? 'rejected' : 'approved'}`}>
                {profile?.role_name}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.2rem' }}>{profile?.email}</p>
            {profile?.branch_name && (
              <p style={{ color: 'var(--text-subtle)', fontSize: '0.84rem' }}>
                {profile.branch_name}{profile.semester_name ? ` • ${profile.semester_name}` : ''}
              </p>
            )}
          </div>
          {!editing && (
            <button className="btn btn-secondary" onClick={() => setEditing(true)}>Edit Profile</button>
          )}
        </div>

        {profile?.bio && !editing && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.55, borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            {profile.bio}
          </p>
        )}

        {/* Edit Form */}
        {editing && (
          <form onSubmit={handleSave} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                rows="3"
                placeholder="Share your academic interests..."
                value={formData.bio}
                onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => { setEditing(false); setFormData({ name: profile.name, bio: profile.bio || '' }); }}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Activity Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Submissions', value: profile?.stats?.total_uploads ?? 0 },
          { label: 'Downloads', value: profile?.stats?.total_downloads ?? 0 },
          { label: 'Bookmarks', value: profile?.stats?.total_bookmarks ?? 0 },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{stat.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="card">
        <h3 style={{ marginBottom: '0.85rem', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-muted)' }}>
          Account Navigation
        </h3>
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/my-uploads')}>My Submissions</button>
          <button className="btn btn-secondary" onClick={() => navigate('/bookmarks')}>Saved Bookmarks</button>
          <button className="btn btn-primary" onClick={() => navigate('/resources/upload')}>Upload Resource</button>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
