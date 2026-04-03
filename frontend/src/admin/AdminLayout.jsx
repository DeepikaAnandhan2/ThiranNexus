import { Link, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BarChart,
  FileText,
  Bell,
  MessageSquare,
  Award,
  Settings
} from "lucide-react";
import "./admin.css";

const NAV = [
  { path: "/admin", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { path: "/admin/users", label: "Users", icon: <Users size={18} /> },
  { path: "/admin/analytics", label: "Analytics", icon: <BarChart size={18} /> },
  { path: "/admin/content", label: "Content", icon: <FileText size={18} /> },
  { path: "/admin/alerts", label: "Alerts", icon: <Bell size={18} /> },
  { path: "/admin/feedback", label: "Feedback", icon: <MessageSquare size={18} /> },
  { path: "/admin/rewards", label: "Rewards", icon: <Award size={18} /> },
  { path: "/admin/settings", label: "Settings", icon: <Settings size={18} /> },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="admin-container">

      {/* SIDEBAR */}
     <aside className="sidebar">
  <h2 className="logo">Thiran Nexus</h2>

  {NAV.map((item) => (
    <Link
      key={item.path}
      to={item.path}
      className={location.pathname === item.path ? "active nav-item" : "nav-item"}
    >
      <span className="icon">{item.icon}</span>
      <span>{item.label}</span>
    </Link>
  ))}
</aside>

      {/* MAIN */}
      <div className="main">
        

        {/* 🔥 THIS FIXES YOUR ISSUE */}
        <div className="content">
          <Outlet />
        </div>
      </div>

    </div>
  );
}