import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  return (
    <nav className="gov-navbar">
      <div className="nav-container">
        {/* Clickable Logo Section */}
        <Link to="/" className="logo-link">
          <div className="logo-section">
            <h1 className="brand-title">
              Thiran<span>Nexus</span>
            </h1>
            <span className="gov-badge">National Education & Skill Portal</span>
          </div>
        </Link>
        
        <div className="nav-right">
          <div className="nav-links">
            <a href="#schemes">Schemes</a>
            <a href="#resources">Resources</a>
            <a href="#about">About Us</a>
          </div>
          
          <div className="auth-buttons">
            <Link to="/login">
              <button className="btn-signin">Sign In</button>
            </Link>
            <Link to="/register">
              <button className="btn-register">Register</button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;