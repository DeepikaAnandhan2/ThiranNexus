// src/components/NotificationBell.jsx
// Drop this into your student Topbar or Dashboard header.
// Shows unread count badge. Click to open dropdown of admin notifications.
// Usage: <NotificationBell />

import { useState, useEffect, useRef } from "react";
import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const getHeaders = () => {
  const token = localStorage.getItem("token") || localStorage.getItem("tn_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unread,  setUnread]  = useState(0);
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE}/api/notifications/mine`, { headers: getHeaders() });
      setNotifications(res.data.notifications || []);
      setUnread(res.data.unreadCount || 0);
    } catch { /* silent fail */ }
    finally  { setLoading(false); }
  };

  const markRead = async (id) => {
    try {
      await axios.put(`${BASE}/api/notifications/${id}/read`, {}, { headers: getHeaders() });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnread(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await axios.put(`${BASE}/api/notifications/read-all`, {}, { headers: getHeaders() });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnread(0);
    } catch {}
  };

  // Poll every 60 seconds for new notifications
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 6, position: "relative", display: "flex", alignItems: "center" }}
        title="Notifications from admin"
      >
        <span style={{ fontSize: 22 }}>🔔</span>
        {unread > 0 && (
          <div style={{ position: "absolute", top: 2, right: 2, width: 18, height: 18, background: "#ef4444", borderRadius: "50%", fontSize: 10, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
            {unread > 9 ? "9+" : unread}
          </div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{ position: "absolute", right: 0, top: 44, width: 340, background: "#fff", borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.15)", border: "1.5px solid #f0ebff", zIndex: 999, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid #f0ebff" }}>
            <div style={{ fontWeight: 800, color: "#1a1a2e", fontSize: 15 }}>Notifications</div>
            {unread > 0 && (
              <button onClick={markAllRead} style={{ background: "none", border: "none", cursor: "pointer", color: "#8B5CF6", fontSize: 12, fontWeight: 700 }}>
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 380, overflowY: "auto" }}>
            {loading && <div style={{ padding: 20, textAlign: "center", color: "#aaa", fontSize: 13 }}>Loading…</div>}
            {!loading && notifications.length === 0 && (
              <div style={{ padding: 32, textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
                <div style={{ color: "#aaa", fontSize: 13 }}>No notifications yet</div>
              </div>
            )}
            {!loading && notifications.map(n => (
              <div key={n._id}
                onClick={() => !n.read && markRead(n._id)}
                style={{ padding: "12px 18px", background: n.read ? "#fff" : "#faf9ff", borderBottom: "1px solid #f5f3ff", cursor: n.read ? "default" : "pointer", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: n.read ? "#e5e7eb" : "#8B5CF6", flexShrink: 0, marginTop: 4 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: n.read ? 500 : 700, color: "#1a1a2e", fontSize: 13, marginBottom: 3 }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: "#555", lineHeight: 1.5 }}>{n.message}</div>
                  <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>{new Date(n.createdAt).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{ padding: "10px 18px", textAlign: "center", borderTop: "1px solid #f0ebff" }}>
              <a href="/feedback" style={{ fontSize: 13, color: "#8B5CF6", fontWeight: 600, textDecoration: "none" }}>View Help & Support →</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}