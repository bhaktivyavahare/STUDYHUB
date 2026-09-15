import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPendingResources, getAllUsers } from '../services/engagementService';
import { verifyResource } from '../services/resourceService';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pending, setPending] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (activeTab === 'pending') loadPending();
    else loadUsers();
  }, [activeTab, page]);

  const loadPending = async () => {
    try {
      setLoading(true);
      const res = await getPendingResources({ page, limit: 10 });
      setPending(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllUsers();
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (resourceId, status) => {
    setVerifyingId(resourceId);
    try {
      await verifyResource(resourceId, { status, rejection_reason: rejectionReason[resourceId] || null });
      setPending(prev => prev.filter(r => r.id !== resourceId));
    } catch (err) {
      alert(err.message || 'Failed to update resource');
    } finally {
      setVerifyingId(null);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const tabStyle = (tab) => ({
    padding: '0.5rem 1.25rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.88rem',
    transition: 'var(--transition)',
    background: activeTab === tab ? 'var(--primary)' : '#ffffff',
    color: activeTab === tab ? '#ffffff' : 'var(--text-muted)',
  });

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1>Admin Control Panel</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
          Manage resources, review submissions, and manage user accounts
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1.25rem' }}>
        <button style={tabStyle('pending')} onClick={() => { setActiveTab('pending'); setPage(1); }}>
          Pending Approvals {pending.length > 0 && activeTab === 'pending' && (
            <span style={{ background: '#dc2626', color: 'white', borderRadius: 9999, padding: '0.05rem 0.45rem', fontSize: '0.72rem', marginLeft: '0.4rem' }}>
              {pending.length}
            </span>
          )}
        </button>
        <button style={tabStyle('users')} onClick={() => { setActiveTab('users'); setPage(1); }}>
          Registered Users
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading data...</p>
      ) : activeTab === 'pending' ? (
        <>
          {pending.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>No pending submissions</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>All submitted resources have been reviewed.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {pending.map(res => (
                <div key={res.id} className="card" style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.85rem' }}>
                    <div>
                      <h3 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-main)' }}>{res.title}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                        {res.subject_name} • {res.type_name} • {formatSize(res.file_size)}
                      </p>
                      <p style={{ color: 'var(--text-subtle)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                        Submitted by <strong>{res.uploader_name}</strong> ({res.uploader_email}) • {' '}
                        {new Date(res.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <Link to={`/resources/${res.id}`} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                      Preview Notes
                    </Link>
                  </div>

                  <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Rejection reason (optional)"
                      value={rejectionReason[res.id] || ''}
                      onChange={e => setRejectionReason(prev => ({ ...prev, [res.id]: e.target.value }))}
                      style={{ flex: 1, minWidth: '200px', fontSize: '0.84rem' }}
                    />
                    <button
                      onClick={() => handleVerify(res.id, 'APPROVED')}
                      disabled={verifyingId === res.id}
                      className="btn btn-primary"
                      style={{ background: 'var(--success)', borderColor: 'var(--success)', fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleVerify(res.id, 'REJECTED')}
                      disabled={verifyingId === res.id}
                      className="btn btn-danger"
                      style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        // Users Table
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', background: '#f8fafc' }}>
                  {['Name', 'Email', 'Role', 'Branch', 'Joined Date'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)', background: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    <td style={{ padding: '0.75rem 1.25rem', fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)' }}>{u.name}</td>
                    <td style={{ padding: '0.75rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{u.email}</td>
                    <td style={{ padding: '0.75rem 1.25rem' }}>
                      <span className={`badge badge-${u.role_name === 'ADMIN' ? 'rejected' : 'approved'}`}>
                        {u.role_name}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{u.branch_name || '-'}</td>
                    <td style={{ padding: '0.75rem 1.25rem', color: 'var(--text-subtle)', fontSize: '0.82rem' }}>
                      {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
