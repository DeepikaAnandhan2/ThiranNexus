import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminLogin from './admin/Login'; // 👈 Import your new Admin Login
import Register from './pages/Register';
import Games from './pages/Games';
import Education from './pages/Education';
import Schemes from './pages/Schemes';
import SchemeDetails from './pages/SchemeDetails';
import SavedApplied from './pages/SavedApplied';
import Scribble from './pages/Scribble';

import DashboardMain from './components/ParentDashboard/DashboardMain';
import Dashboard from './pages/Dashboard';
import ParentDashboard from "./pages/ParentDashboard/ParentDashboard";
import FeedbackPage from './pages/FeedbackPage'
import AdminRoutes from './admin/AdminRoutes';

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

// 🔹 Protected Route (for Students)
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// 🔹 Admin Protected Route (Ensures role is 'admin')
const AdminProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

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
          
          {/* 🛠 ADMIN LOGIN (No Sidebar/Topbar) */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* 🔐 STUDENT ROUTES (with sidebar) */}
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

  <Route path="/schemes" element={<SchemesWithAuth />} />
  <Route path="/scheme/:id" element={<SchemeDetails />} />
  <Route path="/saved" element={<SavedApplied />} />
  <Route path="/feedback" element={<FeedbackPage />} />
</Route>

{/* 🔐 PARENT ROUTE (NO SIDEBAR) */}
<Route
  path="/parent-dashboard"
  element={
    <ProtectedRoute>
      <ParentDashboard />
    </ProtectedRoute>
  }
/>
          {/* 🛠 PROTECTED ADMIN DASHBOARD ROUTES */}
          <Route 
            path="/admin/*" 
            element={
            
                <AdminRoutes />
         
            } 
          />

          {/* ❌ FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}