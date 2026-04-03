import React from 'react';
import EducationAnalysis from './EducationAnalysis'; // Now Chat Analysis
import CognitiveProgress from './CognitiveProgress';
import Notifications from './Notifications';
import MedicalTracker from './MedicalTracker';
import '../../styles/ParentDashboard.css';

const DashboardMain = () => {
  const handleUpdate = () => {
    alert("Fetching latest progress data from ThiranNexus servers...");
  };

  return (
    <div className="parent-dashboard-container">
      <header className="dashboard-header">
        <div className="header-text">
          <h2>Parent Dashboard</h2>
          <p>Real-time chat insights and health tracking</p>
        </div>
        <button className="refresh-btn" onClick={handleUpdate}>Update Data</button>
      </header>

      <div className="dashboard-grid">
        <div className="grid-full"><Notifications /></div>
        <div className="grid-half"><EducationAnalysis /></div> {/* This is the Chat Analysis */}
        <div className="grid-half"><CognitiveProgress /></div>
        <div className="grid-full"><MedicalTracker /></div>
      </div>
    </div>
  );
};

export default DashboardMain;