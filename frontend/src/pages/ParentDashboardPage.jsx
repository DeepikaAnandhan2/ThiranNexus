import React from 'react';
import DashboardMain from '../components/ParentDashboard/DashboardMain';

const ParentDashboardPage = () => {
  return (
    <div className="page-container">
      {/* Sidebar is likely handled in your Layout or Home component, 
          so we just call the Main Dashboard component here */}
      <DashboardMain />
    </div>
  );
};

export default ParentDashboardPage;