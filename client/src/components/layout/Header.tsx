import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <header className="app-header" role="banner">
      <div className="header-left">
        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? 'Close navigation drawer' : 'Open navigation drawer'}
          aria-expanded={isSidebarOpen}
          aria-controls="app-sidebar"
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
        <Link to="/" className="header-logo-link">
          <span className="logo-icon" aria-hidden="true">
            🌱
          </span>
          <span className="logo-text">EcoTrack AI</span>
        </Link>
      </div>

      <div className="header-right">
        {user && (
          <div className="user-dropdown-container">
            <button
              type="button"
              className="user-profile-btn"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
              aria-label="User account options"
            >
              <span className="profile-avatar" aria-hidden="true">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span className="profile-name">{user.name}</span>
              <span className="profile-caret" aria-hidden="true">
                ▼
              </span>
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="dropdown-overlay-dismiss"
                  onClick={() => setIsDropdownOpen(false)}
                  aria-hidden="true"
                />
                <ul className="user-dropdown-menu" role="menu">
                  <li role="none">
                    <Link
                      to="/profile"
                      className="dropdown-item"
                      role="menuitem"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      My Profile &amp; Achievements
                    </Link>
                  </li>
                  <li role="separator" className="dropdown-separator" />
                  <li role="none">
                    <button
                      type="button"
                      className="dropdown-item dropdown-logout-btn"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      Sign Out
                    </button>
                  </li>
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
