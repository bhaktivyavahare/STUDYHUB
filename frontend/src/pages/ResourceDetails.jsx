import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResourceById, addBookmark, removeBookmark, deleteResource } from '../services/resourceService';
import { getMyRating } from '../services/engagementService';
import { useAuth } from '../hooks/useAuth';
import { API_BASE_URL } from '../utils/constants';
import StarRating from '../components/StarRating';
import CommentSection from '../components/CommentSection';

const ResourceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [avgRating, setAvgRating] = useState(null);
  const [totalRatings, setTotalRatings] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState(null);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadResource();
  }, [id]);

  const loadResource = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getResourceById(id);
      setResource(res.data);
      setAvgRating(res.data.avg_rating || null);
      setTotalRatings(res.data.total_ratings || 0);

      if (user) {
        try {
          const ratingRes = await getMyRating(id);
          setUserRating(ratingRes.data.user_rating || 0);
        } catch (_) {}
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setDownloading(true);
    setDownloadMessage(null);
    try {
      const token = localStorage.getItem('studyhub_token');
      const response = await fetch(`${API_BASE_URL}/resources/${id}/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        let msg = 'Unable to download resource. Please try again.';
        try {
          const errJson = await response.json();
          if (errJson?.message) msg = errJson.message;
        } catch (_) {}
        throw new Error(msg);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = resource.file_name || 'resource';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setResource(prev => ({ ...prev, download_count: prev.download_count + 1 }));
      setDownloadMessage({ type: 'success', text: 'Download started successfully.' });
    } catch (err) {
      setDownloadMessage({ type: 'error', text: err.message || 'Error downloading file.' });
    } finally {
      setDownloading(false);
    }
  };

  const handleBookmark = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      if (isBookmarked) {
        await removeBookmark(id);
        setIsBookmarked(false);
      } else {
        await addBookmark(id);
        setIsBookmarked(true);
      }
    } catch (err) {
      if (err.message?.includes('already')) {
        setIsBookmarked(true);
      } else {
        alert(err.message || 'Failed to update bookmark');
      }
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteResource(id);
      navigate('/student/dashboard', { replace: true });
    } catch (err) {
      setDownloadMessage({ type: 'error', text: err.message || 'Unable to delete resource. Please try again.' });
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRated = (data) => {
    setAvgRating(data.avg_rating);
    setTotalRatings(data.total_ratings);
    setUserRating(data.user_rating);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (loading) return (
    <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      Loading resource details...
    </div>
  );

  if (error) return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div className="alert alert-error">
        {error}
      </div>
    </div>
  );

  if (!resource) return null;

  const isOwnerOrAdmin = user && (user.role_name === 'ADMIN' || Number(user.id) === Number(resource.uploaded_by));

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '860px', margin: '0 auto' }}>
      <button
        className="btn btn-secondary"
        onClick={() => navigate(-1)}
        style={{ marginBottom: '1.25rem', padding: '0.35rem 0.75rem', fontSize: '0.82rem' }}
      >
        Back to List
      </button>

      {downloadMessage && (
        <div className={`alert alert-${downloadMessage.type}`}>
          {downloadMessage.text}
        </div>
      )}

      {/* Main Header Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary-border)' }}>
                {resource.type_name}
              </span>
              <span className={`badge badge-${resource.verification_status?.toLowerCase()}`}>
                {resource.verification_status}
              </span>
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-main)' }}>
              {resource.title}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{resource.subject_name}</span>
              {resource.unit_name ? ` • ${resource.unit_name}` : ''}
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.65rem', flexShrink: 0, alignItems: 'center' }}>
            <button
              className="btn btn-secondary"
              onClick={handleBookmark}
              style={isBookmarked ? { color: 'var(--warning)', borderColor: 'var(--warning-border)', background: 'var(--warning-bg)' } : {}}
            >
              {isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>
            <button className="btn btn-primary" onClick={handleDownload} disabled={downloading}>
              {downloading ? 'Downloading...' : `Download File (${resource.download_count || 0})`}
            </button>
            {isOwnerOrAdmin && (
              <button
                className="btn btn-danger"
                onClick={() => setShowDeleteModal(true)}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem' }}
              >
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Rating Section */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600, textTransform: 'uppercase' }}>
            Community Rating
          </div>
          <StarRating
            resourceId={id}
            avgRating={avgRating}
            totalRatings={totalRatings}
            userRating={userRating}
            onRated={handleRated}
          />
        </div>

        {/* Description */}
        {resource.description && (
          <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '0.88rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-muted)' }}>
              Description & Notes
            </h3>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55, color: 'var(--text-main)', fontSize: '0.9rem' }}>
              {resource.description}
            </p>
          </div>
        )}

        {/* File Metadata Grid */}
        <div style={{
          marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem'
        }}>
          {[
            { label: 'File Name', value: resource.file_name },
            { label: 'File Size', value: formatFileSize(resource.file_size) },
            { label: 'Uploaded By', value: resource.uploader_name },
            { label: 'Total Downloads', value: resource.download_count || 0 },
            { label: 'Total Views', value: resource.view_count || 0 },
            { label: 'Upload Date', value: new Date(resource.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
          ].map(item => (
            <div key={item.label} style={{ background: '#f8fafc', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginBottom: '0.15rem' }}>{item.label}</div>
              <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-main)', wordBreak: 'break-word' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Comments */}
      <div className="card">
        <CommentSection resourceId={id} />
      </div>

      {/* Confirmation Modal */}
      {showDeleteModal && (
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
              Are you sure you want to delete <strong>"{resource.title}"</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
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

export default ResourceDetails;
