import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SkipLink } from '../common/SkipLink';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

export const AppLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="app-grid-layout">
      <SkipLink />
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <div className="layout-body-wrapper">
        <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
        <main id="main-content" className="layout-main-content" tabIndex={-1}>
          <div className="page-container">
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};
