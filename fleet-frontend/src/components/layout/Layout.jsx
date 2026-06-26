import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app-container">
      <div className={sidebarOpen ? "sidebar-overlay active" : "sidebar-overlay"} onClick={toggleSidebar}></div>
      <div className={`sidebar-wrapper ${sidebarOpen ? 'mobile-open' : ''}`}>
        <Sidebar />
      </div>
      
      <main className="main-content">
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
