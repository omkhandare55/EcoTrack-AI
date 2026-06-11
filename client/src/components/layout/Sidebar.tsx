import React from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, closeSidebar }) => {
  const navItems: NavItem[] = [
    { to: '/', label: 'Dashboard', icon: '📊' },
    { to: '/activities', label: 'Activities', icon: '🏃' },
    { to: '/analytics', label: 'Analytics', icon: '📈' },
    { to: '/goals', label: 'Goals', icon: '🎯' },
    { to: '/challenges', label: 'Challenges', icon: '🏆' },
    { to: '/recommendations', label: 'Tips & Insights', icon: '💡' },
  ];

  return (
    <>
      {isOpen && (
        <div className="sidebar-overlay-backdrop" onClick={closeSidebar} aria-hidden="true" />
      )}
      <nav
        id="app-sidebar"
        className={`app-sidebar ${isOpen ? 'open' : ''}`}
        aria-label="Main Navigation"
      >
        <ul className="sidebar-nav-list">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
                end={item.to === '/'}
              >
                <span className="nav-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};
