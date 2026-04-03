import React from 'react';

const MedicalTracker = () => {
  const handleConfirm = (med) => alert(`${med} intake confirmed. Updating medical logs.`);

  const doses = [
    { time: "08:00 AM", med: "Vitamin C", status: "Taken" },
    { time: "02:00 PM", med: "Omega 3", status: "Due Now" }
  ];

  return (
    <div className="dashboard-card">
      <h3 className="card-title">Medical Doses Flow</h3>
      <div className="medical-timeline">
        {doses.map((dose, index) => (
          <div key={index} className={`timeline-item ${dose.status.replace(/\s/g, '-').toLowerCase()}`}>
            <div className="time-marker">{dose.time}</div>
            <div className="med-info">
              <strong>{dose.med}</strong>
              <small>{dose.status}</small>
            </div>
            {dose.status === "Due Now" && (
              <button className="confirm-btn" onClick={() => handleConfirm(dose.med)}>Confirm Intake</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicalTracker;