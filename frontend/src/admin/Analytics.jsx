// src/admin/Analytics.jsx — real data from /api/admin/analytics
import { useState, useEffect } from "react";
import { adminAnalytics } from "./adminApi";

function LineChart({ data = [], color = "#8B5CF6" }) {
  if (!data.length || data.every(v => v === 0)) {
    return <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc", fontSize: 13 }}>No data yet</div>;
  }
  const w = 400, h = 100;
  const max = Math.max(...data, 1), min = Math.min(...data, 0);
  const pts = data.map((v, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 20) - 10;
    return `${x},${y}`;
  }).join(" ");
  const id = `g${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 100 }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill={`url(#${id})`} points={`0,${h} ${pts} ${w},${h}`} />
      <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" points={pts} />
      {data.map((v, i) => {
        const x = (i / Math.max(data.length - 1, 1)) * w;
        const y = h - ((v - min) / (max - min || 1)) * (h - 20) - 10;
        return <circle key={i} cx={x} cy={y} r="3.5" fill={color} stroke="#fff" strokeWidth="1.5" />;
      })}
    </svg>
  );
}

function BarChart({ data = [], labels = [], color = "#3b82f6" }) {
  const max = Math.max(...data, 1);
  return (
    <svg viewBox={`0 0 ${data.length * 48} 100`} style={{ width: "100%", height: 100 }}>
      {data.map((v, i) => (
        <g key={i}>
          <rect x={i * 48 + 8} y={100 - (v / max) * 80} width={30} height={(v / max) * 80} rx={5} fill={color} opacity={0.7 + (i % 2) * 0.3} />
          {labels[i] && <text x={i * 48 + 23} y={98} textAnchor="middle" fontSize="9" fill="#aaa">{labels[i]}</text>}
        </g>
      ))}
    </svg>
  );
}

function Skel({ h = 100 }) {
  return <div style={{ height: h, background: "#f0ebff", borderRadius: 10, animation: "pulse 1.5s infinite" }} />;
}

export default function Analytics() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    adminAnalytics.get()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const kpis  = data?.kpis    || {};
  const charts = data?.charts  || {};
  const top    = data?.topPerformers || [];

  const kpiCards = [
    { label: "Success Rate",     value: kpis.successRate    != null ? `${kpis.successRate}%`    : "—", icon: "🎯", color: "#8B5CF6" },
    { label: "Improvement %",   value: kpis.improvementPct != null ? `${kpis.improvementPct}%` : "—", icon: "📈", color: "#10b981" },
    { label: "Total Users",     value: kpis.totalUsers  ?? "—",                                        icon: "👥", color: "#3b82f6" },
    { label: "Total Games",     value: kpis.totalGames  ?? "—",                                        icon: "⭐", color: "#f59e0b" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1a1a2e", margin: 0 }}>Analytics & Performance</h1>
        <p style={{ color: "#8B5CF6", margin: "4px 0 0", fontSize: 14 }}>Real metrics from your MongoDB game + user data.</p>
      </div>

      {error && <div style={{ background: "#fee2e2", borderRadius: 10, padding: "10px 16px", color: "#991b1b", marginBottom: 20, fontSize: 14 }}>⚠️ {error}</div>}

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {loading
          ? [1,2,3,4].map(i => <Skel key={i} />)
          : kpiCards.map((k, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 12px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 22 }}>{k.icon}</span>
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, color: k.color }}>{k.value}</div>
                <div style={{ fontSize: 13, color: "#888", marginTop: 3 }}>{k.label}</div>
              </div>
            ))
        }
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 22, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
          <div style={{ fontWeight: 800, color: "#1a1a2e", fontSize: 15, marginBottom: 4 }}>Daily Sessions</div>
          <div style={{ fontSize: 12, color: "#aaa", marginBottom: 12 }}>Scribble sessions per day</div>
          {loading ? <Skel /> : <LineChart data={charts.dailySessions || []} color="#8B5CF6" />}
        </div>
        <div style={{ background: "#fff", borderRadius: 16, padding: 22, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
          <div style={{ fontWeight: 800, color: "#1a1a2e", fontSize: 15, marginBottom: 4 }}>Math Scores</div>
          <div style={{ fontSize: 12, color: "#aaa", marginBottom: 12 }}>
            Avg: {charts.mathScores?.avg ?? "—"} · Max: {charts.mathScores?.max ?? "—"} · Total: {charts.mathScores?.total ?? "—"}
          </div>
          {loading ? <Skel /> : <BarChart data={charts.mathScores?.series || []} labels={charts.labels || []} color="#3b82f6" />}
        </div>
        <div style={{ background: "#fff", borderRadius: 16, padding: 22, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
          <div style={{ fontWeight: 800, color: "#1a1a2e", fontSize: 15, marginBottom: 4 }}>Speech Accuracy</div>
          <div style={{ fontSize: 12, color: "#aaa", marginBottom: 12 }}>
            Avg: {charts.speechAccuracy?.avg ?? "—"} · Total: {charts.speechAccuracy?.total ?? "—"}
          </div>
          {loading ? <Skel /> : <LineChart data={charts.speechAccuracy?.series || []} color="#10b981" />}
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Per-game breakdown */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
          <div style={{ fontWeight: 800, color: "#1a1a2e", fontSize: 15, marginBottom: 16 }}>Average Score by Game</div>
          {loading
            ? <Skel />
            : (charts.avgScoreByGame || []).length === 0
              ? <p style={{ color: "#aaa", fontSize: 13 }}>No game data yet.</p>
              : (charts.avgScoreByGame || []).map((g, i) => (
                  <div key={g.game} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, color: "#1a1a2e", textTransform: "capitalize" }}>{g.game}</span>
                      <span style={{ fontWeight: 700, color: "#8B5CF6" }}>{g.avgScore} avg · {g.total} games</span>
                    </div>
                    <div style={{ background: "#f0ebff", borderRadius: 10, height: 8 }}>
                      <div style={{ background: "linear-gradient(90deg,#8B5CF6,#5c29e7)", borderRadius: 10, height: 8, width: `${Math.min(100, g.avgScore * 10)}%` }} />
                    </div>
                  </div>
                ))
          }
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 16 }}>
            {[
              { l: "New Users/Week", v: kpis.newUsersThisWeek ?? "—" },
              { l: "Success Rate",   v: kpis.successRate != null ? `${kpis.successRate}%` : "—" },
              { l: "Total Games",    v: kpis.totalGames  ?? "—" },
            ].map(x => (
              <div key={x.l} style={{ textAlign: "center", background: "#faf9ff", borderRadius: 10, padding: "10px 0" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#8B5CF6" }}>{x.v}</div>
                <div style={{ fontSize: 11, color: "#aaa" }}>{x.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top performers */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
          <div style={{ fontWeight: 800, color: "#1a1a2e", fontSize: 15, marginBottom: 16 }}>Top Performing Users</div>
          {loading
            ? [1,2,3,4,5].map(i => <div key={i} style={{ height: 44, background: "#f0ebff", borderRadius: 8, marginBottom: 8 }} />)
            : top.length === 0
              ? <p style={{ color: "#aaa", fontSize: 13 }}>No game scores recorded yet.</p>
              : top.map((u, i) => {
                  const medals = ["🥇","🥈","🥉"];
                  return (
                    <div key={u._id || i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: i < top.length - 1 ? "1px solid #f5f3ff" : "none" }}>
                      <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>{medals[i] || `#${i+1}`}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: "#1a1a2e", fontSize: 14 }}>{u.name}</div>
                        <div style={{ fontSize: 12, color: "#888" }}>{u.disabilityType} · {u.games} games</div>
                      </div>
                      <div style={{ background: "#f0ebff", color: "#8B5CF6", borderRadius: 8, padding: "4px 12px", fontWeight: 700, fontSize: 14 }}>{u.totalScore} pts</div>
                    </div>
                  );
                })
          }
        </div>
      </div>
    </div>
  );
}