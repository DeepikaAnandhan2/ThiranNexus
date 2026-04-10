// src/admin/Settings.jsx — real admin data from /api/admin/settings
import { useState, useEffect } from "react";
import { adminSettings } from "./adminApi";

const roleColors = {
  super_admin: { bg: "#fef3c7", color: "#92400e" },
  admin: { bg: "#ede9fe", color: "#7c3aed" },
  moderator: { bg: "#dbeafe", color: "#1d4ed8" },
  support: { bg: "#f0fdf4", color: "#166534" },
};

const ROLE_PERMISSIONS = [
  { role: "super_admin", users: true, content: true, analytics: true, alerts: true, settings: true },
  { role: "admin", users: true, content: true, analytics: true, alerts: true, settings: false },
  { role: "moderator", users: false, content: true, analytics: false, alerts: true, settings: false },
  { role: "support", users: false, content: false, analytics: false, alerts: false, settings: false },
];

function Toggle({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} style={{ width: 42, height: 24, borderRadius: 12, background: value ? "#8B5CF6" : "#e5e7eb", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: value ? 21 : 3, transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
    </div>
  );
}

function AddAdminModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "admin" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) { setErr("All fields required"); return; }
    setSaving(true); setErr("");
    try {
      await adminSettings.createAdmin(form);
      onCreated();
      onClose();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 400, boxShadow: "0 20px 60px rgba(92,41,231,0.2)" }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#1a1a2e", marginBottom: 20 }}>Add New Admin</div>
        {err && <div style={{ background: "#fee2e2", borderRadius: 8, padding: "8px 12px", color: "#991b1b", fontSize: 13, marginBottom: 12 }}>⚠️ {err}</div>}
        {[
          { label: "Full Name", key: "name", type: "text" },
          { label: "Email", key: "email", type: "email" },
          { label: "Password", key: "password", type: "password" },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: "#555", display: "block", marginBottom: 6 }}>{f.label}</label>
            <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e8e3ff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
        ))}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: "#555", display: "block", marginBottom: 6 }}>Role</label>
          <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e8e3ff", fontSize: 14, outline: "none" }}>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="support">Support</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1.5px solid #e8e3ff", background: "#fff", color: "#888", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Cancel</button>
          <button onClick={handleCreate} disabled={saving}
            style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#8B5CF6,#5c29e7)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, opacity: saving ? 0.7 : 1 }}>
            {saving ? "Creating…" : "Create Admin"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const [tab, setTab] = useState("Admins");
  const [admins, setAdmins] = useState([]);
  const [platform, setPlatform] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [sysSettings, setSysSettings] = useState({
    notifications: true, maintenance: false, language: true, beta: false, analytics: true, backup: true,
  });

  const fetchData = async () => {
    setLoading(true); setError("");
    try {
      const [a, p] = await Promise.all([adminSettings.getAdmins(), adminSettings.getPlatformInfo()]);
      setAdmins(a.admins || []);
      setPlatform(p.platform || null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this admin account?")) return;
    try {
      await adminSettings.deleteAdmin(id);
      fetchData();
    } catch (e) {
      alert("Failed: " + e.message);
    }
  };

  const handleToggleStatus = async (admin) => {
    const newStatus = admin.status === "Active" ? "Inactive" : "Active";
    try {
      await adminSettings.updateAdmin(admin._id, { status: newStatus });
      fetchData();
    } catch (e) {
      alert("Failed: " + e.message);
    }
  };

  return (
    <div>
      {showModal && <AddAdminModal onClose={() => setShowModal(false)} onCreated={fetchData} />}

      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1a1a2e", margin: 0 }}>Admin Settings</h1>
          <p style={{ color: "#8B5CF6", margin: "4px 0 0", fontSize: 14 }}>Manage admin accounts, roles, and platform info.</p>
        </div>
        {tab === "Admins" && (
          <button onClick={() => setShowModal(true)} style={{ background: "linear-gradient(135deg,#8B5CF6,#5c29e7)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(92,41,231,0.3)" }}>
            + Add Admin
          </button>
        )}
      </div>

      {error && <div style={{ background: "#fee2e2", borderRadius: 10, padding: "10px 16px", color: "#991b1b", marginBottom: 20, fontSize: 14 }}>⚠️ {error}</div>}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {["Admins", "Roles & Permissions", "System"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "9px 20px", borderRadius: 10, border: "1.5px solid", borderColor: tab === t ? "#8B5CF6" : "#e8e3ff", background: tab === t ? "#8B5CF6" : "#fff", color: tab === t ? "#fff" : "#8B5CF6", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>{t}</button>
        ))}
      </div>

      {/* Admins Tab */}
      {tab === "Admins" && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
          <div style={{ fontWeight: 800, color: "#1a1a2e", fontSize: 16, marginBottom: 16 }}>
            Admin Accounts ({loading ? "…" : admins.length})
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#faf9ff" }}>
                {["Name", "Email", "Role", "Status", "Last Login", "Actions"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 14px", color: "#8B5CF6", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? [1, 2, 3].map(i => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5, 6].map(j => <td key={j} style={{ padding: "12px 14px" }}><div style={{ height: 16, background: "#f0ebff", borderRadius: 6 }} /></td>)}
                  </tr>
                ))
                : admins.length === 0
                  ? <tr><td colSpan={6} style={{ padding: 30, textAlign: "center", color: "#aaa" }}>No admins found. Run the seed script.</td></tr>
                  : admins.map((a) => {
                    const rc = roleColors[a.role] || roleColors.support;
                    return (
                      <tr key={a._id} style={{ borderBottom: "1px solid #f5f3ff" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#faf9ff"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#8B5CF6,#5c29e7)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>{(a.name || "A")[0]}</div>
                            <span style={{ fontWeight: 600, color: "#1a1a2e" }}>{a.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px", color: "#666", fontSize: 13 }}>{a.email}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ ...rc, borderRadius: 6, padding: "3px 10px", fontWeight: 700, fontSize: 12 }}>{a.role}</span>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.status === "Active" ? "#10b981" : "#ef4444" }} />
                            <span style={{ color: a.status === "Active" ? "#10b981" : "#ef4444", fontWeight: 600, fontSize: 13 }}>{a.status}</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px", color: "#888", fontSize: 13 }}>
                          {a.lastLogin ? new Date(a.lastLogin).toLocaleDateString() : "Never"}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => handleToggleStatus(a)}
                              style={{ background: "#f0ebff", border: "none", borderRadius: 7, padding: "5px 10px", cursor: "pointer", fontSize: 12, color: "#8B5CF6", fontWeight: 600 }}>
                              {a.status === "Active" ? "Disable" : "Enable"}
                            </button>
                            <button onClick={() => handleDelete(a._id)}
                              style={{ background: "#fff0f0", border: "none", borderRadius: 7, width: 30, height: 30, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>
      )}

      {/* Roles & Permissions */}
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
                    <td style={{ padding: "14px" }}>
                      <span style={{ ...(roleColors[r.role] || roleColors.support), borderRadius: 8, padding: "4px 12px", fontWeight: 700, fontSize: 13 }}>{r.role}</span>
                    </td>
                    {["users", "content", "analytics", "alerts", "settings"].map(p => (
                      <td key={p} style={{ padding: "14px", textAlign: "center" }}>
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

      {/* System tab */}
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

          {/* Platform info from real API */}
          <div style={{ marginTop: 24, padding: 20, background: "#faf9ff", borderRadius: 14, border: "1.5px solid #f0ebff" }}>
            <div style={{ fontWeight: 700, color: "#1a1a2e", marginBottom: 12 }}>Platform Info (Live)</div>
            {(platform
              ? [
                { l: "Site Name", v: platform.name },
                { l: "Version", v: platform.version },
                { l: "Total Users", v: platform.stats?.totalUsers ?? "—" },
                { l: "Total Games", v: platform.stats?.totalGames ?? "—" },
                { l: "Schemes", v: platform.stats?.totalSchemes ?? "—" },
                { l: "Admins", v: platform.stats?.totalAdmins ?? "—" },
              ]
              : [{ l: "Loading…", v: "—" }]
            ).map((x) => (
              <div
                key={x.l}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid #ede9fe",
                }}
              >
                <span style={{ color: "#888", fontSize: 14 }}>{x.l}</span>
                <span style={{ fontWeight: 600, color: "#1a1a2e", fontSize: 14 }}>
                  {x.v}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}