import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout Components
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

// Pages
import LandingPage from './pages/LandingPage';
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
import ParentDashboard from './pages/ParentDashboardPage';
import FeedbackPage from './pages/FeedbackPage'
// (OPTIONAL) Admin Routes
import AdminRoutes from './admin/AdminRoutes';

// 🔹 Layout Wrapper
const AppLayout = () => {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-wrapper">
        <Topbar />
        <main className="main-content">
          {/* 🔥 Outlet replaces children */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// 🔹 Protected Route
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  // if not logged in → go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// 🔹 Schemes Wrapper
const SchemesWithAuth = () => {
  const { user } = useAuth();
  return <Schemes user={user} />;
};

import { Outlet } from "react-router-dom";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* 🔓 PUBLIC ROUTES */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 🔐 PROTECTED USER ROUTES */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/home" element={<Home />} />
            <Route path="/education" element={<Education />} />
            <Route path="/games" element={<Games />} />
            <Route path="/scribble" element={<Scribble />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/parent-dashboard" element={<DashboardMain />} />

            <Route path="/schemes" element={<SchemesWithAuth />} />
            <Route path="/scheme/:id" element={<SchemeDetails />} />
            <Route path="/saved" element={<SavedApplied />} />
            <Route path="/pdashboard" element={<ParentDashboard />} />
          </Route>

          {/* 🛠 ADMIN ROUTES */}
          <Route path="/admin/*" element={<AdminRoutes />} />

          {/* ❌ FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}