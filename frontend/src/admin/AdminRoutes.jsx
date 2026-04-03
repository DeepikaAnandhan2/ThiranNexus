import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import Dashboard from "./Dashboard";
import Users from "./Users";
import Analytics from "./Analytics";
import Content from "./Content";
import Alerts from "./Alerts";
import Feedback from "./Feedback";
import Rewards from "./Rewards";
import Settings from "./Settings";
import Login from "./Login";

function ProtectedRoute({ children }) {
  const isAuth = true;
  return isAuth ? children : <Navigate to="/admin/login" replace />;
}

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="content" element={<Content />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="rewards" element={<Rewards />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}