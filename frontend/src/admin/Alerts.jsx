// admin/Alerts.jsx
import { useState } from "react";

const ALERTS = [
  { id: 1, user: "Arun Kane", alert: "Inactive for 3 days", type: "Warning", time: "10:30 AM", status: "Active", severity: "warning" },
  { id: 2, user: "Sneha M.", alert: "Low Performance (Math)", type: "Info", time: "09:15 Mar 24", status: "Active", severity: "info" },
  { id: 3, user: "Divya P.", alert: "Unusual Activity Detected", type: "Critical", time: "08:15 Mar 24", status: "Active", severity: "critical" },
  { id: 4, user: "Ramesh K.", alert: "Missed Sessions", type: "Warning", time: "Apr 23", status: "Resolved", severity: "warning" },
  { id: 5, user: "Anu Priya", alert: "Goal Achieved", type: "Info", time: "Apr 23", status: "Resolved", severity: "info" },
  { id: 6, user: "Kartik R.", alert: "Session Timeout Repeated", type: "Critical", time: "Apr 22", status: "Active", severity: "critical" },
];

const severityStyle = {
  critical: { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444", label: "Critical" },
  warning: { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b", label: "Warning" },
  info: { bg: "#dbeafe", color: "#1d4ed8", dot: "#3b82f6", label: "Info" },
};

const statusStyle = {
  Active: { bg: "#fee2e2", color: "#991b1b" },
  Resolved: { bg: "#dcfce7", color: "#166534" },
};

export default function Alerts() {
  const [filter, setFilter] = useState("All");
  const [alerts, setAlerts] = useState(ALERTS);

  const counts = {
    Critical: alerts.filter(a => a.severity === "critical" && a.status === "Active").length,
    Warning: alerts.filter(a => a.severity === "warning" && a.status === "Active").length,
    Info: alerts.filter(a => a.severity === "info" && a.status === "Active").length,
    Resolved: alerts.filter(a => a.status === "Resolved").length,
  };

  const filtered = filter === "All" ? alerts : alerts.filter(a => a.severity === filter.toLowerCase() || a.status === filter);

  const resolve = (id) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: "Resolved" } : a));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1a1a2e", margin: 0 }}>Alerts & Safety</h1>
        <p style={{ color: "#8B5CF6", margin: "4px 0 0", fontSize: 14 }}>Stay informed about important events and risks.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { l: "Critical", v: counts.Critical, color: "#ef4444", bg: "#fee2e2", icon: "🚨" },
          { l: "Warnings", v: counts.Warning, color: "#f59e0b", bg: "#fef3c7", icon: "⚠️" },
          { l: "Info", v: counts.Info, color: "#3b82f6", bg: "#dbeafe", icon: "ℹ️" },
          { l: "Resolved", v: counts.Resolved, color: "#10b981", bg: "#dcfce7", icon: "✅" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 12px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.v}</div>
              <div style={{ fontSize: 13, color: "#888" }}>{s.l}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Alert cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
        {[
          { type: "Inactivity", desc: "Users inactive for 3+ days", count: 4, severity: "warning" },
          { type: "Unusual Behavior", desc: "Abnormal session patterns detected", count: 2, severity: "critical" },
          { type: "Missed Tasks", desc: "Pending assignments overdue", count: 6, severity: "info" },
        ].map((a, i) => {
          const s = severityStyle[a.severity];
          return (
            <div key={i} style={{ background: s.bg, borderRadius: 14, padding: "20px", border: `1.5px solid ${s.dot}30` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: s.dot, marginTop: 2 }} />
                <div style={{ background: "#fff", color: s.color, borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{s.label}</div>
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: s.color, marginBottom: 6 }}>{a.type}</div>
              <div style={{ fontSize: 13, color: s.color, opacity: 0.8, marginBottom: 12 }}>{a.desc}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{a.count}</div>
              <div style={{ fontSize: 12, color: s.color, opacity: 0.7 }}>Active cases</div>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["All", "Critical", "Warning", "Info", "Resolved"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "7px 16px", borderRadius: 10, border: "1.5px solid", borderColor: filter === f ? "#8B5CF6" : "#e8e3ff", background: filter === f ? "#8B5CF6" : "#fff", color: filter === f ? "#fff" : "#8B5CF6", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{f}</button>
        ))}
      </div>

      {/* Alert table */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
        <div style={{ fontWeight: 800, color: "#1a1a2e", fontSize: 15, marginBottom: 16 }}>Recent Alerts</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#faf9ff" }}>
              {["User", "Alert", "Type", "Time", "Status", "Action"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 14px", color: "#8B5CF6", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((a, i) => {
              const sty = severityStyle[a.severity];
              return (
                <tr key={a.id} style={{ borderBottom: "1px solid #f5f3ff" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#faf9ff"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#8B5CF6,#5c29e7)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>{a.user[0]}</div>
                      <span style={{ fontWeight: 600, color: "#1a1a2e" }}>{a.user}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", color: "#555" }}>{a.alert}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ background: sty.bg, color: sty.color, borderRadius: 6, padding: "3px 10px", fontWeight: 700, fontSize: 12 }}>{a.type}</span>
                  </td>
                  <td style={{ padding: "12px 14px", color: "#888", fontSize: 13 }}>{a.time}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ ...statusStyle[a.status], borderRadius: 6, padding: "3px 10px", fontWeight: 700, fontSize: 12 }}>{a.status}</span>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    {a.status === "Active" && (
                      <button onClick={() => resolve(a.id)} style={{ background: "#f0ebff", color: "#8B5CF6", border: "none", borderRadius: 8, padding: "6px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Resolve</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}