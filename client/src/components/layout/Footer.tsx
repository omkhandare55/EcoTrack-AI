import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="app-footer" role="contentinfo">
      <div className="footer-content">
        <p className="footer-copyright">
          &copy; {new Date().getFullYear()} EcoTrack AI. Committed to a sustainable future.
        </p>
        <div className="footer-links">
          <a href="#accessibility-policy" className="footer-link">
            Accessibility Statement
          </a>
          <span className="footer-separator" aria-hidden="true">
            |
          </span>
          <a href="#privacy-policy" className="footer-link">
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
};
