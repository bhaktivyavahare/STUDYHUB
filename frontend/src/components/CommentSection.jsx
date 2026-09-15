import React, { useState, useEffect } from 'react';
import { getComments, addComment, deleteComment } from '../services/engagementService';
import { useAuth } from '../hooks/useAuth';

const CommentSection = ({ resourceId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [resourceId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const res = await getComments(resourceId);
      setComments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await addComment(resourceId, newComment.trim());
      setComments(prev => [res.data, ...prev]);
      setNewComment('');
    } catch (err) {
      alert(err.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      alert(err.message || 'Failed to delete comment');
    }
  };

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1.05rem', fontWeight: 700 }}>
        Discussion & Comments <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 400 }}>({comments.length})</span>
      </h3>

      {user ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 700, color: 'white'
            }}>
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Add a comment or question about this resource..."
                rows="3"
                style={{ width: '100%', marginBottom: '0.5rem', resize: 'vertical' }}
              />
              <button type="submit" className="btn btn-primary" disabled={submitting || !newComment.trim()}>
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div style={{ padding: '0.85rem 1rem', background: '#f1f5f9', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Please <a href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>log in</a> to participate in the discussion.
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Loading comments...</p>
      ) : comments.length === 0 ? (
        <p style={{ color: 'var(--text-subtle)', textAlign: 'center', padding: '1.5rem 0', fontSize: '0.88rem' }}>
          No comments posted yet. Be the first to leave a comment!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {comments.map(comment => (
            <div key={comment.id} style={{
              padding: '0.85rem 1rem',
              background: '#f8fafc',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              display: 'flex', gap: '0.75rem'
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: '#64748b',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.78rem', fontWeight: 700, color: 'white'
              }}>
                {comment.user_name?.[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>{comment.user_name}</strong>
                    <span style={{ color: 'var(--text-subtle)', fontSize: '0.78rem', marginLeft: '0.5rem' }}>
                      {new Date(comment.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  {user && (user.id === comment.user_id || user.role_name === 'ADMIN') && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p style={{ marginTop: '0.35rem', lineHeight: 1.45, fontSize: '0.88rem', color: '#334155' }}>{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
