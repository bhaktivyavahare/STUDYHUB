import React from 'react';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; {new Date().getFullYear()} StudyHub. Academic Resource-Sharing Platform. All rights reserved.</p>
        <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          Learn. Share. Grow. Built for college excellence.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
