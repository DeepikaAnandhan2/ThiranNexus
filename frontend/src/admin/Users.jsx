// admin/Users.jsx
import { useState } from "react";

const USERS = [
  { id: 1, name: "Anu Priya", email: "anu.priya@example.com", role: "User", disability: "Visual Impairment", status: "Active", joined: "Apr 24, 2024" },
  { id: 2, name: "Ramesh K.", email: "ramesh.k@example.com", role: "Caregiver", disability: "Speech Impairment", status: "Active", joined: "Apr 18, 2024" },
  { id: 3, name: "Sneha M.", email: "sneha.m@example.com", role: "User", disability: "Cognitive", status: "Active", joined: "Apr 15, 2024" },
  { id: 4, name: "Arun Kumar", email: "arun.k@example.com", role: "User", disability: "Visual Impairment", status: "Inactive", joined: "Apr 10, 2024" },
  { id: 5, name: "Divya P.", email: "divya.p@example.com", role: "Caregiver", disability: "Other", status: "Active", joined: "Apr 08, 2024" },
  { id: 6, name: "Kartik R.", email: "kartik.r@example.com", role: "User", disability: "Speech Impairment", status: "Active", joined: "Apr 06, 2024" },
  { id: 7, name: "Meena L.", email: "meena.l@example.com", role: "User", disability: "Cognitive", status: "Inactive", joined: "Apr 04, 2024" },
];

const disabilityColors = {
  "Visual Impairment": { bg: "#ede9fe", color: "#7c3aed" },
  "Speech Impairment": { bg: "#fce7f3", color: "#be185d" },
  "Cognitive": { bg: "#dbeafe", color: "#1d4ed8" },
  "Other": { bg: "#f0fdf4", color: "#166534" },
};

// Mini donut chart
function DisabilityDonut() {
  const data = [{ label: "Visual", pct: 42, color: "#8B5CF6" }, { label: "Speech", pct: 29, color: "#ec4899" }, { label: "Cognitive", pct: 21, color: "#3b82f6" }, { label: "Other", pct: 8, color: "#10b981" }];
  let cumulative = 0;
  const r = 50, cx = 60, cy = 60, circumference = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        {data.map((d, i) => {
          const dashArr = (d.pct / 100) * circumference;
          const dashOff = circumference - cumulative * circumference / 100;
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color} strokeWidth="16"
              strokeDasharray={`${dashArr} ${circumference - dashArr}`}
              strokeDashoffset={-cumulative * circumference / 100}
              style={{ transform: "rotate(-90deg)", transformOrigin: "60px 60px" }} />
          );
          cumulative += d.pct;
          return el;
        })}
        <text x="60" y="56" textAnchor="middle" fontSize="14" fontWeight="800" fill="#1a1a2e">1,248</text>
        <text x="60" y="70" textAnchor="middle" fontSize="10" fill="#888">Total</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {data.map(d => (
          <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color }} />
            <span style={{ fontSize: 12, color: "#555" }}>{d.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1a2e", marginLeft: "auto" }}>{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Users() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = USERS.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    const matchStatus = statusFilter === "All" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1a1a2e", margin: 0 }}>User Management</h1>
          <p style={{ color: "#8B5CF6", margin: "4px 0 0", fontSize: 14 }}>View, search and manage all users of the platform.</p>
        </div>
        <button style={{ background: "linear-gradient(135deg,#8B5CF6,#5c29e7)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(92,41,231,0.3)" }}>
          + Add User
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {[{ l: "Total Users", v: "1,248", color: "#8B5CF6" }, { l: "Active", v: "987", color: "#10b981" }, { l: "Caregivers", v: "261", color: "#3b82f6" }, { l: "Blocked", v: "23", color: "#ef4444" }].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "16px 20px", boxShadow: "0 2px 12px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.v}</div>
            <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
          {/* Filters */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users by name or email..." style={{ width: "100%", padding: "9px 16px 9px 38px", borderRadius: 10, border: "1.5px solid #e8e3ff", background: "#faf9ff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>🔍</span>
            </div>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ border: "1.5px solid #e8e3ff", borderRadius: 10, padding: "9px 14px", fontSize: 14, color: "#555", outline: "none" }}>
              <option>All</option><option>User</option><option>Caregiver</option>
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ border: "1.5px solid #e8e3ff", borderRadius: 10, padding: "9px 14px", fontSize: 14, color: "#555", outline: "none" }}>
              <option>All</option><option>Active</option><option>Inactive</option>
            </select>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#faf9ff" }}>
                  {["Name", "Email", "Role", "Disability", "Status", "Joined", "Actions"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 14px", color: "#8B5CF6", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #f5f3ff" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#faf9ff"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#8B5CF6,#5c29e7)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>{u.name[0]}</div>
                        <span style={{ fontWeight: 600, color: "#1a1a2e" }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", color: "#666" }}>{u.email}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ background: u.role === "Caregiver" ? "#ede9fe" : "#f0fdf4", color: u.role === "Caregiver" ? "#7c3aed" : "#166534", borderRadius: 6, padding: "3px 10px", fontWeight: 600, fontSize: 12 }}>{u.role}</span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ ...disabilityColors[u.disability], borderRadius: 6, padding: "3px 10px", fontWeight: 600, fontSize: 12 }}>{u.disability}</span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: u.status === "Active" ? "#10b981" : "#ef4444" }} />
                        <span style={{ color: u.status === "Active" ? "#10b981" : "#ef4444", fontWeight: 600, fontSize: 13 }}>{u.status}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", color: "#888", fontSize: 13 }}>{u.joined}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {["👁", "✏️", "🗑"].map((icon, j) => (
                          <button key={j} style={{ background: j === 2 ? "#fff0f0" : "#f0ebff", border: "none", borderRadius: 7, width: 30, height: 30, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: "16px 14px 0", color: "#888", fontSize: 13 }}>Showing {filtered.length} of {USERS.length} users</div>
          </div>
        </div>

        {/* Side panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
            <div style={{ fontWeight: 800, color: "#1a1a2e", fontSize: 15, marginBottom: 16 }}>Disability Distribution</div>
            <DisabilityDonut />
          </div>
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
            <div style={{ fontWeight: 800, color: "#1a1a2e", fontSize: 15, marginBottom: 16 }}>Engagement Levels</div>
            {[{ l: "Visual", v: 75 }, { l: "Speech", v: 60 }, { l: "Cognitive", v: 85 }, { l: "Other", v: 45 }].map(d => (
              <div key={d.l} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: "#555" }}>{d.l}</span><span style={{ fontWeight: 700, color: "#8B5CF6" }}>{d.v}%</span>
                </div>
                <div style={{ background: "#f0ebff", borderRadius: 10, height: 8 }}>
                  <div style={{ background: "linear-gradient(90deg,#8B5CF6,#5c29e7)", borderRadius: 10, height: 8, width: `${d.v}%`, transition: "width 0.5s" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}