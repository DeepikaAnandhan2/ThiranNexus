// src/admin/AdminLayout.jsx
import { Link, useLocation, Outlet } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard, Users, BarChart, FileText,
  Bell, MessageCircle, Trophy, Settings, Menu
} from "lucide-react";
import "./admin.css";

const NAV = [
  { path: "/admin",           icon: LayoutDashboard, label: "Dashboard" },
  { path: "/admin/users",     icon: Users,           label: "Users" },
  { path: "/admin/analytics", icon: BarChart,        label: "Analytics" },
  { path: "/admin/content",   icon: FileText,        label: "Content" },
  { path: "/admin/alerts",    icon: Bell,            label: "Alerts" },
  { path: "/admin/feedback",  icon: MessageCircle,   label: "Feedback" },
  { path: "/admin/rewards",   icon: Trophy,          label: "Rewards" },
  { path: "/admin/settings",  icon: Settings,        label: "Settings" },
];

export default function AdminLayout() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <div className="admin-container">

      {open && <div className="overlay" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${open ? "show" : ""}`}>
        <h2 className="logo">ThiranNexus</h2>

        {NAV.map(({ path, icon: Icon, label }) => {
          const active =
            path === "/admin"
              ? location.pathname === "/admin"
              : location.pathname.startsWith(path);

          return (
            <Link
              key={path}
              to={path}
              className={`nav-item ${active ? "active" : ""}`}
              onClick={() => setOpen(false)}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </aside>

      {/* Main */}
      <div className="main">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setOpen(true)}>
            <Menu size={22} />
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