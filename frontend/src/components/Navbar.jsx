// src/components/Navbar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css'; // We will create this next

const Navbar = () => {
  return (
    <nav className="navbar">
      {/* 1. Logo Section */}
      <div className="navbar-logo">
        <span className="logo-icon">⚡</span> TeamFlow
      </div>

      {/* 2. Navigation Links */}
      <ul className="navbar-links">
        <li>
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/chat" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Chat
          </NavLink>
        </li>
        <li>
          <NavLink to="/team" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Team
          </NavLink>
        </li>
        <li>
          <NavLink to="/settings" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Settings
          </NavLink>
        </li>
      </ul>

      {/* 3. User Profile / Action */}
      <div className="navbar-actions">
        <button className="btn-primary">New Project</button>
        <div className="user-avatar">JD</div>
      </div>
    </nav>
  );
};

export default Navbar;