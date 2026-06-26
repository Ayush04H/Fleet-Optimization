import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ toggleSidebar }) => {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="mobile-toggle" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <div className="search-bar">
          <input type="text" placeholder="Search..." className="form-control" />
        </div>
      </div>
      <div className="navbar-right">
        <button className="icon-btn">
          <Bell size={20} />
          <span className="badge-indicator"></span>
        </button>
        <div className="user-profile">
          <div className="avatar">
            <User size={20} />
          </div>
          <span className="user-name">Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
