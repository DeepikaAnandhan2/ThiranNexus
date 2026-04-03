// admin/Settings.jsx
import { useState } from "react";

const ADMINS = [
  { name: "Super Admin", email: "admin@thirannnexus.com", role: "Super Admin", status: "Active" },
  { name: "Priya S.", email: "priya.s@thirannnexus.com", role: "Admin", status: "Active" },
  { name: "Karan M.", email: "karan.m@thirannnexus.com", role: "Moderator", status: "Inactive" },
  { name: "Meena R.", email: "meena.r@thirannnexus.com", role: "Support", status: "Inactive" },
];

const roleColors = {
  "Super Admin": { bg: "#fef3c7", color: "#92400e" },
  "Admin": { bg: "#ede9fe", color: "#7c3aed" },
  "Moderator": { bg: "#dbeafe", color: "#1d4ed8" },
  "Support": { bg: "#f0fdf4", color: "#166534" },
};

const ROLE_PERMISSIONS = [
  { role: "Super Admin", users: true, content: true, analytics: true, alerts: true, settings: true },
  { role: "Admin", users: true, content: true, analytics: true, alerts: true, settings: false },
  { role: "Moderator", users: false, content: true, analytics: false, alerts: true, settings: false },
  { role: "Support", users: false, content: false, analytics: false, alerts: false, settings: false },
];

function Toggle({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} style={{ width: 42, height: 24, borderRadius: 12, background: value ? "#8B5CF6" : "#e5e7eb", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: value ? 21 : 3, transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
    </div>
  );
}

export default function Settings() {
  const [tab, setTab] = useState("Admins");
  const [sysSettings, setSysSettings] = useState({
    notifications: true, maintenance: false, language: true, beta: false, analytics: true, backup: true,
  });

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1a1a2e", margin: 0 }}>Admin Settings</h1>
          <p style={{ color: "#8B5CF6", margin: "4px 0 0", fontSize: 14 }}>Manage admins, roles, and system preferences.</p>
        </div>
        <button style={{ background: "linear-gradient(135deg,#8B5CF6,#5c29e7)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(92,41,231,0.3)" }}>
          + Add Admin
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {["Admins", "Roles & Permissions", "System"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "9px 20px", borderRadius: 10, border: "1.5px solid", borderColor: tab === t ? "#8B5CF6" : "#e8e3ff", background: tab === t ? "#8B5CF6" : "#fff", color: tab === t ? "#fff" : "#8B5CF6", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>{t}</button>
        ))}
      </div>

      {/* Admins Tab */}
      {tab === "Admins" && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
          <div style={{ fontWeight: 800, color: "#1a1a2e", fontSize: 16, marginBottom: 16 }}>Admin Accounts</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#faf9ff" }}>
                {["Name", "Email", "Role", "Status", "Actions"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 14px", color: "#8B5CF6", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ADMINS.map((a, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f5f3ff" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#faf9ff"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#8B5CF6,#5c29e7)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>{a.name[0]}</div>
                      <span style={{ fontWeight: 600, color: "#1a1a2e" }}>{a.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", color: "#666" }}>{a.email}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ ...roleColors[a.role], borderRadius: 6, padding: "3px 10px", fontWeight: 700, fontSize: 12 }}>{a.role}</span>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.status === "Active" ? "#10b981" : "#ef4444" }} />
                      <span style={{ color: a.status === "Active" ? "#10b981" : "#ef4444", fontWeight: 600, fontSize: 13 }}>{a.status}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {["✏️", "🗑"].map((icon, j) => (
                        <button key={j} style={{ background: j === 1 ? "#fff0f0" : "#f0ebff", border: "none", borderRadius: 7, width: 30, height: 30, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Roles & Permissions Tab */}
      {tab === "Roles & Permissions" && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
          <div style={{ fontWeight: 800, color: "#1a1a2e", fontSize: 16, marginBottom: 16 }}>Role Permissions Matrix</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#faf9ff" }}>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "#8B5CF6", fontWeight: 700, fontSize: 12, textTransform: "uppercase" }}>Role</th>
                  {["Users", "Content", "Analytics", "Alerts", "Settings"].map(p => (
                    <th key={p} style={{ textAlign: "center", padding: "10px 14px", color: "#8B5CF6", fontWeight: 700, fontSize: 12, textTransform: "uppercase" }}>{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROLE_PERMISSIONS.map((r, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f5f3ff" }}>
                    <td style={{ padding: "14px 14px" }}>
                      <span style={{ ...roleColors[r.role], borderRadius: 8, padding: "4px 12px", fontWeight: 700, fontSize: 13 }}>{r.role}</span>
                    </td>
                    {["users", "content", "analytics", "alerts", "settings"].map(p => (
                      <td key={p} style={{ padding: "14px 14px", textAlign: "center" }}>
                        <span style={{ fontSize: 18 }}>{r[p] ? "✅" : "❌"}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* System Tab */}
      {tab === "System" && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
          <div style={{ fontWeight: 800, color: "#1a1a2e", fontSize: 16, marginBottom: 20 }}>System Preferences</div>
          {[
            { key: "notifications", label: "Email Notifications", desc: "Send email alerts to admins for critical events" },
            { key: "maintenance", label: "Maintenance Mode", desc: "Temporarily disable user access for updates" },
            { key: "language", label: "Multi-language Support", desc: "Enable Tamil, Hindi, and other regional languages" },
            { key: "beta", label: "Beta Features", desc: "Enable experimental features for testing" },
            { key: "analytics", label: "Analytics Tracking", desc: "Collect anonymized usage data for improvement" },
            { key: "backup", label: "Auto Backup", desc: "Automatically backup data every 24 hours" },
          ].map(s => (
            <div key={s.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid #f5f3ff" }}>
              <div>
                <div style={{ fontWeight: 700, color: "#1a1a2e", fontSize: 15 }}>{s.label}</div>
                <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>{s.desc}</div>
              </div>
              <Toggle value={sysSettings[s.key]} onChange={v => setSysSettings(prev => ({ ...prev, [s.key]: v }))} />
            </div>
          ))}

          <div style={{ marginTop: 24, padding: 20, background: "#faf9ff", borderRadius: 14, border: "1.5px solid #f0ebff" }}>
            <div style={{ fontWeight: 700, color: "#1a1a2e", marginBottom: 12 }}>Platform Info</div>
            {[{ l: "Site Name", v: "ThiranNexus" }, { l: "Version", v: "v2.4.1" }, { l: "Language", v: "English" }, { l: "Icon", v: "Default" }].map(x => (
              <div key={x.l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #ede9fe" }}>
                <span style={{ color: "#888", fontSize: 14 }}>{x.l}</span>
                <span style={{ fontWeight: 600, color: "#1a1a2e", fontSize: 14 }}>{x.v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}