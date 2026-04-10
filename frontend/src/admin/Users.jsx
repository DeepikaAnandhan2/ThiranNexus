// src/admin/Users.jsx — real data from /api/admin/users
import { useState, useEffect, useCallback } from "react";
import { adminUsers } from "./adminApi";

const DISABILITY_COLORS = {
  visual:    { bg: "#ede9fe", color: "#7c3aed" },
  hearing:   { bg: "#fce7f3", color: "#be185d" },
  cognitive: { bg: "#dbeafe", color: "#1d4ed8" },
  motor:     { bg: "#fef3c7", color: "#92400e" },
  speech:    { bg: "#f0fdf4", color: "#166534" },
  multiple:  { bg: "#fee2e2", color: "#991b1b" },
  other:     { bg: "#f5f3ff", color: "#5b21b6" },
  none:      { bg: "#f1f5f9", color: "#475569" },
};

const ROLE_COLORS = {
  student: { bg: "#f0fdf4", color: "#166534" },
  parent:  { bg: "#ede9fe", color: "#7c3aed" },
};

// ── Dynamic donut from real disability breakdown ──────────
function DisabilityDonut({ breakdown = [] }) {
  const COLORS = ["#8B5CF6","#ec4899","#3b82f6","#10b981","#f59e0b","#ef4444","#6366f1","#14b8a6"];
  const total  = breakdown.reduce((s, d) => s + d.count, 0) || 1;
  const r = 50, cx = 60, cy = 60, circumference = 2 * Math.PI * r;
  let cumulative = 0;

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
      <svg width="120" height="120" viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
        {breakdown.map((d, i) => {
          const pct     = d.count / total;
          const dashArr = pct * circumference;
          const offset  = -cumulative * circumference;
          cumulative   += pct;
          return (
            <circle key={d.label} cx={cx} cy={cy} r={r} fill="none"
              stroke={COLORS[i % COLORS.length]} strokeWidth="16"
              strokeDasharray={`${dashArr} ${circumference - dashArr}`}
              strokeDashoffset={offset}
              style={{ transform: "rotate(-90deg)", transformOrigin: "60px 60px" }} />
          );
        })}
        <text x="60" y="55" textAnchor="middle" fontSize="13" fontWeight="800" fill="#1a1a2e">{total}</text>
        <text x="60" y="69" textAnchor="middle" fontSize="10" fill="#888">Total</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {breakdown.map((d, i) => (
          <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS[i % COLORS.length], flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "#555" }}>{d.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1a2e", marginLeft: "auto" }}>{Math.round(d.count / total * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {[1,2,3,4,5,6,7].map(i => (
        <td key={i} style={{ padding: "12px 14px" }}>
          <div style={{ height: 16, background: "#f0ebff", borderRadius: 6 }} />
        </td>
      ))}
    </tr>
  );
}

export default function Users() {
  const [data,         setData]         = useState({ users: [], total: 0, pages: 1, disabilityBreakdown: [], engagementBreakdown: [] });
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [search,       setSearch]       = useState("");
  const [roleFilter,   setRoleFilter]   = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page,         setPage]         = useState(1);
  const [deleteId,     setDeleteId]     = useState(null);
  const [deleting,     setDeleting]     = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = { page, limit: 15 };
      if (search)       params.search = search;
      if (roleFilter)   params.role   = roleFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await adminUsers.getAll(params);
      setData(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(fetchUsers, 400);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user and all their game data?")) return;
    setDeleting(true);
    try {
      await adminUsers.delete(id);
      setDeleteId(null);
      fetchUsers();
    } catch (e) {
      alert("Delete failed: " + e.message);
    } finally {
      setDeleting(false);
    }
  };

  const totalStudents  = data.users.filter(u => u.role === "student").length;
  const totalParents   = data.users.filter(u => u.role === "parent").length;

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1a1a2e", margin: 0 }}>User Management</h1>
          <p style={{ color: "#8B5CF6", margin: "4px 0 0", fontSize: 14 }}>Real user data from your MongoDB database.</p>
        </div>
      </div>

      {error && <div style={{ background: "#fee2e2", borderRadius: 10, padding: "10px 16px", color: "#991b1b", marginBottom: 20, fontSize: 14 }}>⚠️ {error}</div>}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { l: "Total Users",  v: data.total,       color: "#8B5CF6" },
          { l: "Students",     v: totalStudents,     color: "#10b981" },
          { l: "Parents",      v: totalParents,      color: "#3b82f6" },
          { l: "Pages",        v: data.pages,        color: "#f59e0b" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "16px 20px", boxShadow: "0 2px 12px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.v ?? "—"}</div>
            <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
          {/* Filters */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search name, email, UDID..."
                style={{ width: "100%", padding: "9px 16px 9px 38px", borderRadius: 10, border: "1.5px solid #e8e3ff", background: "#faf9ff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>🔍</span>
            </div>
            <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
              style={{ border: "1.5px solid #e8e3ff", borderRadius: 10, padding: "9px 14px", fontSize: 14, color: "#555", outline: "none" }}>
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="parent">Parent</option>
            </select>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              style={{ border: "1.5px solid #e8e3ff", borderRadius: 10, padding: "9px 14px", fontSize: 14, color: "#555", outline: "none" }}>
              <option value="">All Status</option>
              <option value="active">Active (30d)</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#faf9ff" }}>
                  {["Name", "Email", "Role", "Disability", "State", "Joined", "Actions"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 14px", color: "#8B5CF6", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [1,2,3,4,5].map(i => <SkeletonRow key={i} />)
                  : data.users.length === 0
                    ? <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#aaa" }}>No users found</td></tr>
                    : data.users.map((u) => {
                        const dColor = DISABILITY_COLORS[u.disabilityType] || DISABILITY_COLORS.none;
                        const rColor = ROLE_COLORS[u.role]                 || ROLE_COLORS.student;
                        return (
                          <tr key={u._id} style={{ borderBottom: "1px solid #f5f3ff" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#faf9ff"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <td style={{ padding: "12px 14px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#8B5CF6,#5c29e7)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                                  {(u.name||"U")[0]}
                                </div>
                                <span style={{ fontWeight: 600, color: "#1a1a2e" }}>{u.name}</span>
                              </div>
                            </td>
                            <td style={{ padding: "12px 14px", color: "#666", fontSize: 13 }}>{u.email}</td>
                            <td style={{ padding: "12px 14px" }}>
                              <span style={{ ...rColor, borderRadius: 6, padding: "3px 10px", fontWeight: 600, fontSize: 12 }}>{u.role}</span>
                            </td>
                            <td style={{ padding: "12px 14px" }}>
                              <span style={{ ...dColor, borderRadius: 6, padding: "3px 10px", fontWeight: 600, fontSize: 12 }}>{u.disabilityType || "none"}</span>
                            </td>
                            <td style={{ padding: "12px 14px", color: "#888", fontSize: 13 }}>{u.state || "—"}</td>
                            <td style={{ padding: "12px 14px", color: "#888", fontSize: 13 }}>
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                            </td>
                            <td style={{ padding: "12px 14px" }}>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button
                                  onClick={() => handleDelete(u._id)}
                                  disabled={deleting}
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

          {/* Pagination */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 14px 0", flexWrap: "wrap", gap: 8 }}>
            <span style={{ color: "#888", fontSize: 13 }}>
              Showing page {page} of {data.pages} ({data.total} total users)
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid #e8e3ff", background: "#fff", color: "#8B5CF6", fontWeight: 700, cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.5 : 1 }}>← Prev</button>
              <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page >= data.pages}
                style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid #e8e3ff", background: "#fff", color: "#8B5CF6", fontWeight: 700, cursor: page >= data.pages ? "not-allowed" : "pointer", opacity: page >= data.pages ? 0.5 : 1 }}>Next →</button>
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
            <div style={{ fontWeight: 800, color: "#1a1a2e", fontSize: 15, marginBottom: 16 }}>Disability Distribution</div>
            {loading
              ? <div style={{ height: 120, background: "#f0ebff", borderRadius: 10 }} />
              : <DisabilityDonut breakdown={data.disabilityBreakdown} />
            }
          </div>

          <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
            <div style={{ fontWeight: 800, color: "#1a1a2e", fontSize: 15, marginBottom: 16 }}>Avg Score by Disability</div>
            {loading
              ? [1,2,3].map(i => <div key={i} style={{ height: 32, background: "#f0ebff", borderRadius: 8, marginBottom: 8 }} />)
              : data.engagementBreakdown.length === 0
                ? <p style={{ color: "#aaa", fontSize: 13 }}>No game scores yet.</p>
                : data.engagementBreakdown.map(d => (
                    <div key={d.label} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                        <span style={{ color: "#555" }}>{d.label}</span>
                        <span style={{ fontWeight: 700, color: "#8B5CF6" }}>{d.avgScore} avg</span>
                      </div>
                      <div style={{ background: "#f0ebff", borderRadius: 10, height: 8 }}>
                        <div style={{ background: "linear-gradient(90deg,#8B5CF6,#5c29e7)", borderRadius: 10, height: 8, width: `${Math.min(100, d.avgScore * 10)}%`, transition: "width 0.5s" }} />
                      </div>
                    </div>
                  ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}