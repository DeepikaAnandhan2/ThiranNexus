import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import keyboardNavigation from './utils/keyboardNavigation';

// ✅ NEW: Accessibility Helpers for Speech & Color Profiles
import AccessibilityWrapper from './components/AccessibilityWrapper';
import { AccessibilityProvider } from './context/AccessibilityContext';
import './styles/accessibility.css'; // Global Color Accessibility Stylesheet

import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import ChooseLogin from './pages/ChooseLogin';
import Login from './pages/Login';
import AdminLogin from './admin/Login';
import ChooseRegister from './pages/ChooseRegister';
import Register from './pages/Register';
import AdminRegister from './pages/AdminRegister';
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

import Education2 from './pages/Education2';

// 🔹 Layout Wrapper
const AppLayout = () => {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="content-area">
        <Topbar /> {/* ✅ Clean layout execution context handles tracking internally */}
        <main className="page-content">
          <div className="page-inner">
            <Outlet />
          </div>
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
  React.useEffect(() => {
    keyboardNavigation.init();
    return () => {
      keyboardNavigation.destroy();
    };
  }, []);

  return (
    <AuthProvider>
      {/* ✅ Wrap the app tree layers inside accessibility contexts cleanly */}
      <AccessibilityProvider>
        <AccessibilityWrapper>
          <BrowserRouter>
            <Routes>

              {/* 🔓 PUBLIC ROUTES */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<ChooseLogin />} />
              <Route path="/login/user" element={<Login />} />
              <Route path="/register" element={<ChooseRegister />} />
              <Route path="/register/user" element={<Register />} />
              <Route path="/admin/register" element={<AdminRegister />} />
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
                <Route path="/education2" element={<Education2 />} />
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
        </AccessibilityWrapper>
      </AccessibilityProvider>
    </AuthProvider>
  );
}