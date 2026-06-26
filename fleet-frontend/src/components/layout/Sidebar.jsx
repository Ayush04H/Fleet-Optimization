import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Truck, CalendarCheck, Settings, Users, Map, MapPin } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Fleet<span className="brand-accent">Ops</span></h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/map" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <MapPin size={20} />
              <span>Live Map</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/vehicles" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Truck size={20} />
              <span>Vehicles</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/assignments" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <CalendarCheck size={20} />
              <span>Assignments</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/drivers" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Users size={20} />
              <span>Drivers</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/routes" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Map size={20} />
              <span>Routes</span>
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <div className="nav-item">
          <Settings size={20} />
          <span>Settings</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
