import React from 'react';

const Notifications = () => {
  const handleJoin = () => alert("Redirecting to the Java Advanced Virtual Classroom...");

  return (
    <div className="dashboard-card alert-section">
      <h3 className="card-title">Notifications</h3>
      <div className="alert-box urgent">
        <div className="alert-content">
          <span className="alert-icon">⚠️</span>
          <p><strong>Urgent Alert:</strong> Course "Java Advanced" starts in 10 minutes.</p>
        </div>
        <button className="action-btn" onClick={handleJoin}>Join Class</button>
      </div>
    </div>
  );
};

export default Notifications;