import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const ResourceCard = ({ resource }) => {
  const getStatusBadge = (status) => {
    if (status === 'APPROVED') return <span className="badge badge-approved">Approved</span>;
    if (status === 'PENDING') return <span className="badge badge-pending">Pending</span>;
    if (status === 'REJECTED') return <span className="badge badge-rejected">Rejected</span>;
    return null;
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Top row: type badge + status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <span style={{
          padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', fontWeight: 600,
          background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary-border)'
        }}>
          {resource.type_name}
        </span>
        {getStatusBadge(resource.verification_status)}
      </div>

      {/* Title */}
      <h3 style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.35, color: 'var(--text-main)', margin: 0 }}>
        <Link to={`/resources/${resource.id}`} style={{ color: 'inherit' }}>
          {resource.title}
        </Link>
      </h3>

      {/* Academic Course Info */}
      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{resource.subject_name}</span>
        {resource.unit_name && <span style={{ color: 'var(--text-subtle)' }}>• {resource.unit_name}</span>}
      </div>

      {/* Description */}
      <p style={{
        fontSize: '0.83rem', color: 'var(--text-subtle)', lineHeight: 1.45,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0
      }}>
        {resource.description || 'No description provided.'}
      </p>

      {/* Footer: uploader + downloads + CTA */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <div>
          <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '0.82rem' }}>{resource.uploader_name || 'Faculty/Student'}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
            {resource.download_count || 0} downloads {resource.file_size ? `• ${formatSize(resource.file_size)}` : ''}
          </div>
        </div>
        <Link to={`/resources/${resource.id}`} className="btn btn-secondary" style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}>
          View Notes
        </Link>
      </div>
    </div>
  );
};

export default ResourceCard;
