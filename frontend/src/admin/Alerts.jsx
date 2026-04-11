// src/admin/Alerts.jsx — resolve shows what notification was sent to student
import { useState, useEffect, useCallback } from "react";
import { adminAlerts } from "./adminApi";

const severityStyle = {
  critical: { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444", label: "Critical" },
  warning:  { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b", label: "Warning"  },
  info:     { bg: "#dbeafe", color: "#1d4ed8", dot: "#3b82f6", label: "Info"     },
};
const statusStyle = {
  Active:   { bg: "#fee2e2", color: "#991b1b" },
  Resolved: { bg: "#dcfce7", color: "#166534" },
};

// Toast notification
function Toast({ msg, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: "#fff", borderRadius: 14, padding: "16px 20px", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", border: "1.5px solid #dcfce7", maxWidth: 360, animation: "slideUp 0.3s" }}>
      <div style={{ fontWeight: 700, color: "#166534", marginBottom: 6 }}>✅ Alert Resolved</div>
      <div style={{ fontSize: 13, color: "#555", lineHeight: 1.5 }}>{msg}</div>
      <button onClick={onClose} style={{ position: "absolute", top: 10, right: 12, background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#aaa" }}>×</button>
    </div>
  );
}

export default function Alerts() {
  const [data,      setData]      = useState({ alerts: [], counts: { critical: 0, warning: 0, info: 0, resolved: 0 } });
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [filter,    setFilter]    = useState("All");
  const [resolving, setResolving] = useState(null);
  const [toast,     setToast]     = useState(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = {};
      if (filter === "Critical") params.severity = "critical";
      else if (filter === "Warning")  params.severity = "warning";
      else if (filter === "Info")     params.severity = "info";
      else if (filter === "Resolved") params.status   = "Resolved";
      const res = await adminAlerts.getAll(params);
      setData(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const handleResolve = async (id) => {
    setResolving(id);
    try {
      const res = await adminAlerts.resolve(id);
      // Build toast message from what the backend returned
      const n = res.notification;
      let msg = `Student notified via in-app message.`;
      if (n?.email) msg += ` Email sent to ${n.emailTo}.`;
      else if (n?.emailTo === 'not available') msg += ` No email on record — in-app only.`;
      if (n?.message) msg += `\n\nMessage: "${n.message}"`;
      setToast(msg);
      fetchAlerts();
    } catch (e) {
      alert("Failed to resolve: " + e.message);
    } finally {
      setResolving(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this alert?")) return;
    try { await adminAlerts.delete(id); fetchAlerts(); }
    catch (e) { alert("Failed: " + e.message); }
  };

  const counts = data.counts || {};

  return (
    <div>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1a1a2e", margin: 0 }}>Alerts & Safety</h1>
        <p style={{ color: "#8B5CF6", margin: "4px 0 0", fontSize: 14 }}>
          Auto-generated from user activity. Resolving an alert sends a notification to the student.
        </p>
      </div>

      {error && <div style={{ background: "#fee2e2", borderRadius: 10, padding: "10px 16px", color: "#991b1b", marginBottom: 20, fontSize: 14 }}>⚠️ {error}</div>}

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { l: "Critical", v: counts.critical ?? 0, color: "#ef4444", bg: "#fee2e2", icon: "🚨" },
          { l: "Warnings", v: counts.warning  ?? 0, color: "#f59e0b", bg: "#fef3c7", icon: "⚠️" },
          { l: "Info",     v: counts.info     ?? 0, color: "#3b82f6", bg: "#dbeafe", icon: "ℹ️" },
          { l: "Resolved", v: counts.resolved ?? 0, color: "#10b981", bg: "#dcfce7", icon: "✅" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 12px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{loading ? "—" : s.v}</div>
              <div style={{ fontSize: 13, color: "#888" }}>{s.l}</div>
            </div>
          </div>
        ))}
      </div>

      {/* How resolve works — info banner */}
      <div style={{ background: "#f0ebff", borderRadius: 12, padding: "12px 18px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 12, border: "1.5px solid #ddd6fe" }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
        <div style={{ fontSize: 13, color: "#5b21b6" }}>
          <strong>How Resolve works:</strong> Clicking "Resolve" sends an in-app notification to the student visible on their dashboard.
          If SMTP email is configured (<code>SMTP_HOST</code>, <code>SMTP_USER</code>, <code>SMTP_PASS</code> in .env), an email is also sent automatically.
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["All","Critical","Warning","Info","Resolved"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "7px 16px", borderRadius: 10, border: "1.5px solid", borderColor: filter === f ? "#8B5CF6" : "#e8e3ff", background: filter === f ? "#8B5CF6" : "#fff", color: filter === f ? "#fff" : "#8B5CF6", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{f}</button>
        ))}
        <button onClick={fetchAlerts} style={{ padding: "7px 14px", borderRadius: 10, border: "1.5px solid #e8e3ff", background: "#fff", color: "#8B5CF6", fontWeight: 700, fontSize: 13, cursor: "pointer", marginLeft: "auto" }}>↻ Refresh</button>
      </div>

      {/* Alert table */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
        <div style={{ fontWeight: 800, color: "#1a1a2e", fontSize: 15, marginBottom: 16 }}>Recent Alerts {loading && <span style={{ fontSize: 12, color: "#aaa", fontWeight: 400 }}>Loading…</span>}</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#faf9ff" }}>
              {["User","Alert","Type","Date","Status","Action"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 14px", color: "#8B5CF6", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? [1,2,3].map(i => <tr key={i}>{[1,2,3,4,5,6].map(j => <td key={j} style={{ padding: "12px 14px" }}><div style={{ height: 16, background: "#f0ebff", borderRadius: 6 }} /></td>)}</tr>)
              : data.alerts.length === 0
                ? <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#aaa", fontSize: 14 }}>No alerts. System auto-generates alerts for inactive students and low scorers.</td></tr>
                : data.alerts.map((a) => {
                    const sty      = severityStyle[a.severity] || severityStyle.info;
                    const userName = a.userId?.name || a.userName || "Student";
                    return (
                      <tr key={a._id} style={{ borderBottom: "1px solid #f5f3ff" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#faf9ff"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#8B5CF6,#5c29e7)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{userName[0]}</div>
                            <div>
                              <div style={{ fontWeight: 600, color: "#1a1a2e" }}>{userName}</div>
                              {a.userId?.email && <div style={{ fontSize: 11, color: "#aaa" }}>{a.userId.email}</div>}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px", color: "#555" }}>{a.alert}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ background: sty.bg, color: sty.color, borderRadius: 6, padding: "3px 10px", fontWeight: 700, fontSize: 12 }}>{a.type}</span>
                        </td>
                        <td style={{ padding: "12px 14px", color: "#888", fontSize: 13 }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ ...statusStyle[a.status], borderRadius: 6, padding: "3px 10px", fontWeight: 700, fontSize: 12 }}>{a.status}</span>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            {a.status === "Active" && (
                              <button onClick={() => handleResolve(a._id)} disabled={resolving === a._id}
                                title="Notifies student and marks resolved"
                                style={{ background: "#f0ebff", color: "#8B5CF6", border: "none", borderRadius: 8, padding: "6px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer", opacity: resolving === a._id ? 0.6 : 1 }}>
                                {resolving === a._id ? "Sending…" : "✉ Resolve & Notify"}
                              </button>
                            )}
                            <button onClick={() => handleDelete(a._id)}
                              style={{ background: "#fff0f0", color: "#ef4444", border: "none", borderRadius: 8, padding: "6px 10px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
            }
          </tbody>
        </table>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}