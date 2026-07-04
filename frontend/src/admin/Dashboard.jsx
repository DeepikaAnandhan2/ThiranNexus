// src/admin/Dashboard.jsx — fetches real data from /api/admin/dashboard/overview
import { useState, useEffect } from "react";
import { adminDashboard } from "./adminApi";

function MiniLineChart({ data = [] }) {
  if (!data.length) return null;
  const w = 500, h = 120;
  const max = Math.max(...data, 1), min = Math.min(...data, 0);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 20) - 10;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width:"100%", height:120 }}>
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill="url(#lg1)" points={`0,${h} ${pts} ${w},${h}`} />
      <polyline fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinejoin="round" points={pts} />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / (max - min || 1)) * (h - 20) - 10;
        return <circle key={i} cx={x} cy={y} r="3.5" fill="#8B5CF6" stroke="#fff" strokeWidth="1.5" />;
      })}
    </svg>
  );
}

function Skel() {
  return <div style={{ height:100, background:"#f0ebff", borderRadius:14, animation:"pulse 1.5s infinite" }} />;
}

export default function Dashboard() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    adminDashboard.getOverview()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};
  const trend  = data?.trend || {};
  const users  = data?.recentUsers || [];

  const statCards = [
    { label:"Total Users",    value: stats.totalUsers    ?? "—", icon:"👥", change: "+new",  color:"#8B5CF6" },
    { label:"Active Users",   value: stats.activeUsers   ?? "—", icon:"✅", change:"30d",    color:"#10b981" },
    { label:"Sessions Today", value: stats.sessionsToday ?? "—", icon:"⚡", change:"today",  color:"#3b82f6" },
    { label:"Performance %",  value: stats.performancePct != null ? `${stats.performancePct}%` : "—", icon:"📈", change:"active/total", color:"#f59e0b" },
  ];

  return (
    <div style={{ paddingBottom: "40px" }}>
      <div style={{ marginBottom:32, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize:28, fontWeight:800, color:"#111827", letterSpacing: "-0.02em", margin:0 }}>Dashboard Overview</h1>
          <p style={{ color:"#6b7280", margin:"6px 0 0", fontSize:15 }}>Real-time data from ThiranNexus platform.</p>
        </div>
      </div>

      {error && <div style={{ background:"#fee2e2", borderRadius:10, padding:"10px 16px", color:"#991b1b", marginBottom:20, fontSize:14 }}>⚠️ {error}</div>}

      {/* Stat Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))", gap:24, marginBottom:32 }}>
        {loading ? [1,2,3,4].map(i => <Skel key={i} />) : statCards.map((s,i) => (
          <div key={i} style={{ background:"#fff", borderRadius:12, padding:"24px", boxShadow:"0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.025)", border:"1px solid #e5e7eb", transition: "transform 0.2s", cursor: "pointer" }}
               onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
               onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <span style={{ fontSize:24 }}>{s.icon}</span>
              <span style={{ background:"#f3f4f6", color:"#4b5563", borderRadius:16, padding:"4px 12px", fontSize:12, fontWeight:600 }}>{s.change}</span>
            </div>
            <div style={{ fontSize:32, fontWeight:700, color:"#111827", letterSpacing: "-0.02em" }}>{s.value}</div>
            <div style={{ color:"#6b7280", fontSize:14, marginTop:6, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Chart + recent users */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:24, marginBottom:32 }}>
        <div style={{ background:"#fff", borderRadius:12, padding:24, boxShadow:"0 1px 3px rgba(0,0,0,0.05)", border:"1px solid #e5e7eb" }}>
          <div style={{ fontWeight:600, color:"#111827", fontSize:16, marginBottom:6 }}>User Registrations (7 days)</div>
          <div style={{ fontSize:13, color:"#6b7280", marginBottom:16 }}>{(trend.labels || []).join(", ")}</div>
          {loading ? <div style={{ height:120, background:"#f3f4f6", borderRadius:8 }} /> : <MiniLineChart data={trend.userSeries || []} />}
        </div>
        <div style={{ background:"#fff", borderRadius:12, padding:24, boxShadow:"0 1px 3px rgba(0,0,0,0.05)", border:"1px solid #e5e7eb" }}>
          <div style={{ fontWeight:600, color:"#111827", fontSize:16, marginBottom:6 }}>Sessions (7 days)</div>
          <div style={{ fontSize:13, color:"#6b7280", marginBottom:16 }}>Scribble game sessions</div>
          {loading ? <div style={{ height:120, background:"#f3f4f6", borderRadius:8 }} /> : <MiniLineChart data={trend.sessionSeries || []} />}
        </div>
      </div>

      {/* Recent Users */}
      <div style={{ background:"#fff", borderRadius:12, padding:24, boxShadow:"0 1px 3px rgba(0,0,0,0.05)", border:"1px solid #e5e7eb" }}>
        <div style={{ fontWeight:600, color:"#111827", fontSize:16, marginBottom:20 }}>Recent Registrations</div>
        {loading ? [1,2,3].map(i => <div key={i} style={{ height:48, background:"#f3f4f6", borderRadius:8, marginBottom:8 }} />) :
          users.length === 0 ? <p style={{ color:"#6b7280", fontSize:14 }}>No users yet.</p> :
          users.map((u,i) => (
            <div key={u._id} style={{ display:"flex", alignItems:"center", gap:16, padding:"12px 0", borderBottom: i < users.length-1 ? "1px solid #f3f4f6" : "none" }}>
              <div style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,#8B5CF6,#6366f1)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:600, fontSize:16, flexShrink:0 }}>{(u.name||"U")[0].toUpperCase()}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, color:"#111827", fontSize:14 }}>{u.name}</div>
                <div style={{ color:"#6b7280", fontSize:13, marginTop: 2 }}>{u.email} {u.disabilityType && `· ${u.disabilityType}`}</div>
              </div>
              <div style={{ fontSize:13, color:"#9ca3af", fontWeight: 500 }}>{new Date(u.joinedAt).toLocaleDateString()}</div>
            </div>
          ))
        }
      </div>
    </div>
  );
}