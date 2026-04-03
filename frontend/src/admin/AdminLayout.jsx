import { Link, useLocation, Outlet } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  BarChart,
  FileText,
  Bell,
  MessageCircle,
  Trophy,
  Settings,
  Menu
} from "lucide-react";

import "./admin.css";

export default function AdminLayout() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <div className="admin-container">

      {/* Overlay */}
      {open && <div className="overlay" onClick={() => setOpen(false)}></div>}

      {/* Sidebar */}
      <aside className={`sidebar ${open ? "show" : ""}`}>
        <h2 className="logo">Thiran Nexus</h2>

        <Link to="/admin" className="nav-item">
          <LayoutDashboard size={18} /> Dashboard
        </Link>

        <Link to="/admin/users" className="nav-item">
          <Users size={18} /> Users
        </Link>

        <Link to="/admin/analytics" className="nav-item">
          <BarChart size={18} /> Analytics
        </Link>

        <Link to="/admin/content" className="nav-item">
          <FileText size={18} /> Content
        </Link>

        <Link to="/admin/alerts" className="nav-item">
          <Bell size={18} /> Alerts
        </Link>

        <Link to="/admin/feedback" className="nav-item">
          <MessageCircle size={18} /> Feedback
        </Link>

        <Link to="/admin/rewards" className="nav-item">
          <Trophy size={18} /> Rewards
        </Link>

        <Link to="/admin/settings" className="nav-item">
          <Settings size={18} /> Settings
        </Link>
      </aside>

      {/* Main */}
      <div className="main">

        <header className="topbar">
          <button className="menu-btn" onClick={() => setOpen(true)}>
            <Menu size={22} color="black" />
          </button>
          <h3>Admin Panel</h3>
        </header>

        <div className="content">
          <Outlet />
        </div>
      </div>

    </div>
  );
}