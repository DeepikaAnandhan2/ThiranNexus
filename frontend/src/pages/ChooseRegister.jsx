import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserGraduate, FaUserShield } from 'react-icons/fa';
import '../styles/AuthChoice.css';

export default function ChooseRegister() {
  return (
    <div className="auth-choice-page">
      <div className="auth-choice-card">
        <h1>Choose Signup Type</h1>
        <p>Select the right account type before creating your profile.</p>
        <div className="auth-choice-grid">
          <Link to="/register/user" className="auth-choice-item auth-choice-user">
            <div className="auth-choice-icon"><FaUserGraduate /></div>
            <h3>Student / Parent</h3>
            <p>Create a learner or caregiver account to access courses and support.</p>
          </Link>
          <Link to="/admin/register" className="auth-choice-item auth-choice-admin">
            <div className="auth-choice-icon"><FaUserShield /></div>
            <h3>Admin</h3>
            <p>Request access for admin accounts or contact your platform administrator.</p>
          </Link>
        </div>
        <div className="auth-choice-footer">
          <Link to="/">Back to home</Link>
        </div>
      </div>
    </div>
  );
}
