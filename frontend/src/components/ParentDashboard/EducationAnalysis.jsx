import React from 'react';

const ChatAnalysis = () => {
  const analysisData = [
    { label: 'Vocabulary Growth', value: 85, color: '#6366f1' },
    { label: 'Sentimental Positivity', value: 72, color: '#10b981' },
    { label: 'Response Speed', value: 45, color: '#f59e0b' }
  ];

  const viewDetailedReport = () => alert("Opening full linguistic analysis report...");

  return (
    <div className="dashboard-card">
      <div className="card-header-flex">
        <h3 className="card-title">Chat Analysis</h3>
        <button className="small-btn" onClick={viewDetailedReport}>Details</button>
      </div>
      <div className="progress-list">
        {analysisData.map((item, index) => (
          <div key={index} className="progress-item">
            <div className="progress-label">
              <span>{item.label}</span>
              <span>{item.value}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${item.value}%`, backgroundColor: item.color }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatAnalysis;