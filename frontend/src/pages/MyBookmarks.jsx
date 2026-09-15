import React, { useState, useEffect } from 'react';
import { getMyBookmarks } from '../services/resourceService';
import ResourceCard from '../components/ResourceCard';
import { Link } from 'react-router-dom';

const MyBookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const res = await getMyBookmarks();
      setBookmarks(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1>My Bookmarked Notes</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
          Saved academic resources for quick revision
        </p>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading bookmarks...</p>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : bookmarks.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>No bookmarked notes yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
            Browse the resource library and save notes for easy access.
          </p>
          <Link to="/explore" className="btn btn-primary">Browse Resource Library</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.25rem' }}>
          {bookmarks.map(res => (
            <ResourceCard key={res.id} resource={res} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookmarks;
