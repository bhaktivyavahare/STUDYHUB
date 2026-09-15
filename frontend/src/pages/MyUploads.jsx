import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyUploads } from '../services/engagementService';
import { deleteResource } from '../services/resourceService';
import { useAuth } from '../hooks/useAuth';

const MyUploads = () => {
  const { user } = useAuth();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [deletingResource, setDeletingResource] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  useEffect(() => {
    loadUploads();
  }, [page]);

  const loadUploads = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyUploads({ page, limit: 10 });
      setUploads(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingResource) return;
    setIsDeleting(true);
    setActionFeedback(null);
    try {
      await deleteResource(deletingResource.id);
      setUploads(prev => prev.filter(item => item.id !== deletingResource.id));
      setActionFeedback({ type: 'success', text: 'Resource deleted successfully.' });
      setDeletingResource(null);
    } catch (err) {
      setActionFeedback({ type: 'error', text: err.message || 'Unable to delete this resource. Please try again.' });
      setDeletingResource(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1>My Submissions</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
            All academic resources you have contributed to StudyHub
          </p>
        </div>
        <Link to="/resources/upload" className="btn btn-primary">Upload New Resource</Link>
      </div>

      {actionFeedback && (
        <div className={`alert alert-${actionFeedback.type}`} style={{ marginBottom: '1.25rem' }}>
          {actionFeedback.text}
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading submissions...</p>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : uploads.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>No resources uploaded yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
            Share your lecture notes, lab manuals, or question papers with your classmates.
          </p>
          <Link to="/resources/upload" className="btn btn-primary">Upload Your First Resource</Link>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {uploads.map(upload => (
              <div key={upload.id} className="card" style={{ padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                      <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)' }}>{upload.title}</h3>
                      <span className={`badge badge-${upload.verification_status?.toLowerCase()}`}>
                        {upload.verification_status}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                      {upload.subject_name} • {upload.type_name} • {formatSize(upload.file_size)}
                    </p>
                    {upload.verification_status === 'REJECTED' && upload.rejection_reason && (
                      <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.35rem' }}>
                        Rejection reason: {upload.rejection_reason}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ textAlign: 'center', color: 'var(--text-subtle)', fontSize: '0.78rem', marginRight: '0.35rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>{upload.download_count}</div>
                      downloads
                    </div>
                    <Link to={`/resources/${upload.id}`} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                      View Details
                    </Link>
                    <button
                      className="btn btn-danger"
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                      onClick={() => setDeletingResource(upload)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.75rem' }}>
              <button className="btn btn-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
              <span style={{ alignSelf: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Page {page} of {totalPages}</span>
              <button className="btn btn-secondary" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          )}
        </>
      )}

      {/* Confirmation Modal */}
      {deletingResource && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '420px', width: '100%', boxShadow: 'var(--shadow-md)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Delete Resource?
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Are you sure you want to delete <strong>"{deletingResource.title}"</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setDeletingResource(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyUploads;
