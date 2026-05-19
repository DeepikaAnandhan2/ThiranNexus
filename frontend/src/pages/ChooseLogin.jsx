import React from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaShieldAlt } from 'react-icons/fa';
import '../styles/AuthChoice.css';

export default function ChooseLogin() {
  return (
    <div className="auth-choice-page">
      <div className="auth-choice-card">
        <h1>Choose Login Type</h1>
        <p>Select the account type to continue to the correct login page.</p>
        <div className="auth-choice-grid">
          <Link to="/login/user" className="auth-choice-item auth-choice-user">
            <div className="auth-choice-icon"><FaUser /></div>
            <h3>Student / Parent</h3>
            <p>Sign in to access your learning dashboard and resources.</p>
          </Link>
          <Link to="/admin/login" className="auth-choice-item auth-choice-admin">
            <div className="auth-choice-icon"><FaShieldAlt /></div>
            <h3>Admin</h3>
            <p>Sign in to manage content, users, and platform settings.</p>
          </Link>
        </div>
        <div className="auth-choice-footer">
          <Link to="/">Back to home</Link>
        </div>
      </div>
    </div>
  );
}
