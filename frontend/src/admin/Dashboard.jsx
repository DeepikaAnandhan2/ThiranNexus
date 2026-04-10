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
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#1a1a2e", margin:0 }}>Dashboard Overview</h1>
        <p style={{ color:"#8B5CF6", margin:"4px 0 0", fontSize:14 }}>Real-time data from ThiranNexus platform.</p>
      </div>

      {error && <div style={{ background:"#fee2e2", borderRadius:10, padding:"10px 16px", color:"#991b1b", marginBottom:20, fontSize:14 }}>⚠️ {error}</div>}

      {/* Stat Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20, marginBottom:24 }}>
        {loading ? [1,2,3,4].map(i => <Skel key={i} />) : statCards.map((s,i) => (
          <div key={i} style={{ background:"#fff", borderRadius:16, padding:"20px 24px", boxShadow:"0 2px 16px rgba(92,41,231,.07)", border:"1.5px solid #f0ebff" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
              <span style={{ fontSize:22 }}>{s.icon}</span>
              <span style={{ background:"#f0ebff", color:"#8B5CF6", borderRadius:8, padding:"3px 10px", fontSize:11, fontWeight:700 }}>{s.change}</span>
            </div>
            <div style={{ fontSize:28, fontWeight:800, color:"#1a1a2e" }}>{s.value}</div>
            <div style={{ color:"#888", fontSize:13, marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Chart + recent users */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20, marginBottom:24 }}>
        <div style={{ background:"#fff", borderRadius:16, padding:24, boxShadow:"0 2px 16px rgba(92,41,231,.07)", border:"1.5px solid #f0ebff" }}>
          <div style={{ fontWeight:800, color:"#1a1a2e", fontSize:16, marginBottom:4 }}>User Registrations (7 days)</div>
          <div style={{ fontSize:12, color:"#aaa", marginBottom:12 }}>{(trend.labels || []).join(", ")}</div>
          {loading ? <div style={{ height:120, background:"#f0ebff", borderRadius:10 }} /> : <MiniLineChart data={trend.userSeries || []} />}
        </div>
        <div style={{ background:"#fff", borderRadius:16, padding:24, boxShadow:"0 2px 16px rgba(92,41,231,.07)", border:"1.5px solid #f0ebff" }}>
          <div style={{ fontWeight:800, color:"#1a1a2e", fontSize:16, marginBottom:4 }}>Sessions (7 days)</div>
          <div style={{ fontSize:12, color:"#aaa", marginBottom:12 }}>Scribble game sessions</div>
          {loading ? <div style={{ height:120, background:"#f0ebff", borderRadius:10 }} /> : <MiniLineChart data={trend.sessionSeries || []} />}
        </div>
      </div>

      {/* Recent Users */}
      <div style={{ background:"#fff", borderRadius:16, padding:24, boxShadow:"0 2px 16px rgba(92,41,231,.07)", border:"1.5px solid #f0ebff" }}>
        <div style={{ fontWeight:800, color:"#1a1a2e", fontSize:16, marginBottom:16 }}>Recent Registrations</div>
        {loading ? [1,2,3].map(i => <div key={i} style={{ height:48, background:"#f0ebff", borderRadius:8, marginBottom:8 }} />) :
          users.length === 0 ? <p style={{ color:"#aaa", fontSize:14 }}>No users yet.</p> :
          users.map((u,i) => (
            <div key={u._id} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 0", borderBottom: i < users.length-1 ? "1px solid #f5f3ff" : "none" }}>
              <div style={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#8B5CF6,#5c29e7)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:15, flexShrink:0 }}>{(u.name||"U")[0]}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, color:"#1a1a2e", fontSize:14 }}>{u.name}</div>
                <div style={{ color:"#888", fontSize:12 }}>{u.email} · {u.disabilityType}</div>
              </div>
              <div style={{ fontSize:12, color:"#bbb" }}>{new Date(u.joinedAt).toLocaleDateString()}</div>
            </div>
          ))
        }
      </div>
    </div>
  );
}