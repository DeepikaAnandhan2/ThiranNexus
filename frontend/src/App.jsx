import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; 

// Layout & Common Components
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Page Imports
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Games from './pages/Games';
import Education from './pages/Education';
import Schemes from './pages/Schemes';
import SchemeDetails from './pages/SchemeDetails';
import SavedApplied from './pages/SavedApplied';
import Scribble from './pages/Scribble';
import DashboardMain from './components/ParentDashboard/DashboardMain';

/**
 * Layout Wrapper Component
 * Consistently applies the Sidebar and Topbar across the platform.
 */
const AppLayout = ({ children }) => (
  <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
    <Sidebar />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Topbar />
      <div style={{ flex: 1, overflowY: 'auto', background: '#f4f7fe' }}>
        {children}
      </div>
    </div>
  </div>
);

const NotFound = () => (
  <div style={{ 
    textAlign: 'center', 
    padding: '100px', 
    color: '#1b2559', 
    background: '#f4f7fe', 
    minHeight: '100vh' 
  }}>
    <h1 style={{ fontSize: '3rem' }}>404</h1>
    <h2>Page Not Found</h2>
    <p>The link you followed may be broken or the page may have been removed.</p>
    <a href="/home" style={{ color: '#6366f1', fontWeight: 'bold' }}>Back to Home</a>
  </div>
);

/**
 * Helper for the Schemes page to inject user context
 */
const SchemesWithAuth = () => {
  const { user } = useAuth(); 
  return <AppLayout><Schemes user={user} /></AppLayout>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
           {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* --- PROTECTED ROUTES (Integrated with Layout) --- */}
          <Route path="/home" element={<AppLayout><Home /></AppLayout>} />
          <Route path="/games" element={<AppLayout><Games /></AppLayout>} />
          <Route path="/scribble" element={<AppLayout><Scribble /></AppLayout>} />
          <Route path="/education" element={<Education />} />
          
          {/* Parent Dashboard Integration */}
          <Route path="/parent-dashboard" element={<AppLayout><DashboardMain /></AppLayout>} />

          {/* Schemes & Personalization */}
          <Route path="/schemes" element={<SchemesWithAuth />} />
          <Route path="/scheme/:id" element={<AppLayout><SchemeDetails /></AppLayout>} />
          <Route path="/saved" element={<AppLayout><SavedApplied /></AppLayout>} />

          {/* Catch-all Route */}
          <Route path="*" element={<NotFound />} />
         
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}