import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminLogin from './admin/Login';
import Register from './pages/Register';
import Games from './pages/Games';
import Education from './pages/Education';
import Schemes from './pages/Schemes';
import SchemeDetails from './pages/SchemeDetails';
import SavedApplied from './pages/SavedApplied';
import Scribble from './pages/Scribble';

import Dashboard from './pages/Dashboard';
import ParentDashboard from "./pages/ParentDashboard/ParentDashboard";
import FeedbackPage from './pages/FeedbackPage';
import AdminRoutes from './admin/AdminRoutes';

// ✅ LOGIC GAME
import LogicGame from './components/games/LogicGame';

// ✅ NEW: UDID HELP PAGE
import UdidHelp from './pages/UdidHelp';

// 🔹 Layout Wrapper
const AppLayout = () => {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-wrapper">
        <Topbar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// 🔹 Protected Route
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// 🔹 Admin Protected Route
const AdminProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

// 🔹 Schemes Wrapper
const SchemesWithAuth = () => {
  const { user } = useAuth();
  return <Schemes user={user} />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* 🔓 PUBLIC ROUTES */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* ✅ NEW: UDID HELP PAGE */}
          <Route path="/udid-help" element={<UdidHelp />} />

          {/* 🔐 STUDENT ROUTES */}
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

            {/* 🎮 MAIN GAMES */}
            <Route path="/games" element={<Games />} />

            {/* 🎯 LOGIC GAME */}
            <Route path="/games/logic" element={<LogicGame />} />

            <Route path="/scribble" element={<Scribble />} />
            <Route path="/schemes" element={<SchemesWithAuth />} />
            <Route path="/scheme/:id" element={<SchemeDetails />} />
            <Route path="/saved" element={<SavedApplied />} />
            <Route path="/feedback" element={<FeedbackPage />} />
          </Route>

          {/* 👨‍👩‍👧 PARENT DASHBOARD */}
          <Route
            path="/parent-dashboard"
            element={
              <ProtectedRoute>
                <ParentDashboard />
              </ProtectedRoute>
            }
          />

          {/* 🛠 ADMIN */}
          <Route path="/admin/*" element={<AdminRoutes />} />

          {/* ❌ FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}