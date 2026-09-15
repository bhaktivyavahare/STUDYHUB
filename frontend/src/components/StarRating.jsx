import React, { useState } from 'react';
import { rateResource } from '../services/engagementService';
import { useAuth } from '../hooks/useAuth';

const StarRating = ({ resourceId, avgRating, totalRatings, userRating, onRated }) => {
  const { user } = useAuth();
  const [hovered, setHovered] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleRate = async (star) => {
    if (!user) return alert('Please log in to rate this resource.');
    setLoading(true);
    try {
      const res = await rateResource(resourceId, star);
      if (onRated) onRated(res.data);
    } catch (err) {
      alert(err.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', gap: '0.15rem' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              cursor: user ? 'pointer' : 'default',
              fontSize: '1.25rem',
              color: star <= (hovered || userRating || Math.round(avgRating))
                ? '#d97706'
                : '#cbd5e1',
              transition: 'color 0.15s',
              padding: '0.1rem',
            }}
          >
            ★
          </button>
        ))}
      </div>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        {avgRating ? `${parseFloat(avgRating).toFixed(1)} / 5` : 'No ratings yet'}
        {totalRatings > 0 && <span> ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})</span>}
      </span>
      {userRating > 0 && (
        <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
          Your Rating: {userRating} stars
        </span>
      )}
    </div>
  );
};

export default StarRating;
