import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/AuthChoice.css';

export default function AdminRegister() {
  return (
    <div className="auth-choice-page">
      <div className="auth-choice-card auth-choice-admin-register">
        <h1>Admin Signup</h1>
        <p>Admin registration is not available through this portal.</p>
        <p className="auth-choice-note">
          Admin accounts are created by platform administrators. Please contact your system administrator to request access.
        </p>
        <div className="auth-choice-actions">
          <Link to="/admin/login" className="auth-choice-button">Go to Admin Login</Link>
          <Link to="/register/user" className="auth-choice-button secondary">Create User Account</Link>
        </div>
      </div>
    </div>
  );
}
