import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout Components
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

// Pages
import LandingPage from './pages/LandingPage'; // New Landing Page
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

import Dashboard from './pages/Dashboard';

// Layout Wrapper for Dashboard/Internal Pages
const AppLayout = ({ children }) => {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-wrapper">
        <Topbar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

// Auth-specific wrapper for Schemes
const SchemesWithAuth = () => {
  const { user } = useAuth();
  return (
    <AppLayout>
      <Schemes user={user} />
    </AppLayout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          
          {/* --- PUBLIC ROUTES --- */}
          {/* The Landing Page is now the first thing people see */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* --- PRIVATE / DASHBOARD ROUTES --- */}
          {/* These use the AppLayout (Sidebar + Topbar) */}
          <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />

          <Route path="/home" element={<AppLayout><Home /></AppLayout>} />
          <Route path="/education" element={<AppLayout><Education /></AppLayout>} />
          <Route path="/games" element={<AppLayout><Games /></AppLayout>} />
          <Route path="/scribble" element={<AppLayout><Scribble /></AppLayout>} />

          {/* Parent specific View */}
          <Route path="/parent-dashboard" element={<AppLayout><DashboardMain /></AppLayout>} />

          {/* Scheme Management */}
          <Route path="/schemes" element={<SchemesWithAuth />} />
          <Route path="/scheme/:id" element={<AppLayout><SchemeDetails /></AppLayout>} />
          <Route path="/saved" element={<AppLayout><SavedApplied /></AppLayout>} />

          {/* --- FALLBACK --- */}
          {/* Redirects unknown paths back to the landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}