import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleSelect = (role) => {
    setShowDropdown(false);
    if (role === 'admin') {
      navigate('/admin/login');
    } else {
      navigate('/login');
    }
  };

  return (
    <nav className="gov-navbar">
      <div className="nav-container">
        {/* Logo */}
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
            {/* 🔽 SIGN IN DROPDOWN */}
            <div className="dropdown-container">
              <button
                className="btn-signin"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                Sign In ▾
              </button>

              {showDropdown && (
                <div className="dropdown-menu">
                  <div onClick={() => handleSelect('user')}>👤 User</div>
                  <div onClick={() => handleSelect('admin')}>🛠 Admin</div>
                </div>
              )}
            </div>

            {/* Register stays same */}
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