// src/admin/AdminLayout.jsx
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard, Users, BarChart, FileText,
  Bell, MessageCircle, Trophy, Settings, Menu,
  ChevronLeft, ChevronRight, Search, User, LogOut
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
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // Mobile drawer
  const [isCollapsed, setIsCollapsed] = useState(false); // Desktop sidebar collapse

  const handleLogout = () => {
    // Basic logout handling for now
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  return (
    <div className="admin-container">

      {open && <div className="overlay" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${open ? "show" : ""} ${isCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <h2 className="logo">{!isCollapsed ? "ThiranNexus" : "TN"}</h2>
          <button 
            className="collapse-btn" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label="Toggle Sidebar"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav">
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
                title={isCollapsed ? label : ""}
              >
                <Icon size={20} className="nav-icon" />
                {!isCollapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className="admin-main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="menu-btn" onClick={() => setOpen(true)}>
              <Menu size={22} />
            </button>
            <h3 className="page-title">
              {NAV.find(n => n.path === location.pathname)?.label || "Admin Panel"}
            </h3>
          </div>

          <div className="topbar-right">
            <div className="search-bar">
              <Search size={16} className="search-icon" />
              <input type="text" placeholder="Search..." />
            </div>
            
            <button className="icon-btn action-btn">
              <Bell size={20} />
              <span className="badge">3</span>
            </button>

            <div className="profile-menu">
              <div className="avatar">
                <User size={18} />
              </div>
              <button className="icon-btn logout-btn" onClick={handleLogout} title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        <div className="content">
          <div className="content-inner">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}