// admin/Dashboard.jsx
import { useEffect, useRef } from "react";

const statCards = [
  { label: "Total Users", value: "1,248", change: "+8.2%", icon: "👥", color: "#8B5CF6" },
  { label: "Active Users", value: "856", change: "+5.3%", icon: "✅", color: "#10b981" },
  { label: "Sessions Today", value: "2,453", change: "+10.2%", icon: "⚡", color: "#3b82f6" },
  { label: "Performance %", value: "78%", change: "+4.9%", icon: "📈", color: "#f59e0b" },
];

const recentActivity = [
  { user: "Anu Priya", action: "Completed Tongue Twister", score: 92, time: "2m ago", avatar: "A" },
  { user: "Ramesh K.", action: "Joined Math Session", score: 80, time: "8m ago", avatar: "R" },
  { user: "Sneha M.", action: "Earned Badge: Champion", score: 88, time: "15m ago", avatar: "S" },
  { user: "Arun Kumar", action: "Submitted Feedback", score: null, time: "22m ago", avatar: "A" },
  { user: "Divya P.", action: "Completed Visual Module", score: 78, time: "35m ago", avatar: "D" },
];

// Simple SVG line chart
function MiniLineChart() {
  const data = [40, 55, 48, 70, 65, 80, 75, 90, 85, 95, 88, 100];
  const w = 500, h = 120;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * (h - 20) - 10;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 120 }}>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinejoin="round" points={pts} />
      <polygon fill="url(#lineGrad)" points={`0,${h} ${pts} ${w},${h}`} />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / (max - min)) * (h - 20) - 10;
        return <circle key={i} cx={x} cy={y} r="3.5" fill="#8B5CF6" stroke="#fff" strokeWidth="1.5" />;
      })}
    </svg>
  );
}

function MiniBarChart() {
  const data = [60, 80, 50, 90, 70, 85, 65];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <svg viewBox="0 0 280 80" style={{ width: "100%", height: 80 }}>
      {data.map((v, i) => (
        <g key={i}>
          <rect x={i * 38 + 8} y={80 - v * 0.72} width={22} height={v * 0.72} rx={5} fill={i === 3 ? "#8B5CF6" : "#e8e3ff"} />
          <text x={i * 38 + 19} y={78} textAnchor="middle" fontSize="9" fill="#aaa">{days[i]}</text>
        </g>
      ))}
    </svg>
  );
}

export default function Dashboard() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1a1a2e", margin: 0 }}>Dashboard Overview</h1>
        <p style={{ color: "#8B5CF6", margin: "4px 0 0", fontSize: 14 }}>Welcome back, Admin. Here's what's happening today.</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 24 }}>
        {statCards.map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <span style={{ background: "#f0ebff", color: "#8B5CF6", borderRadius: 8, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{s.change}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#1a1a2e" }}>{s.value}</div>
            <div style={{ color: "#888", fontSize: 13, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 24 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 800, color: "#1a1a2e", fontSize: 16 }}>Activity Trend</div>
              <div style={{ fontSize: 12, color: "#aaa" }}>Last 12 weeks</div>
            </div>
            <select style={{ border: "1.5px solid #e8e3ff", borderRadius: 8, padding: "4px 10px", color: "#8B5CF6", fontSize: 13, outline: "none" }}>
              <option>This Week</option><option>This Month</option>
            </select>
          </div>
          <MiniLineChart />
        </div>
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
          <div style={{ fontWeight: 800, color: "#1a1a2e", fontSize: 16, marginBottom: 4 }}>Daily Sessions</div>
          <div style={{ fontSize: 12, color: "#aaa", marginBottom: 16 }}>This week</div>
          <MiniBarChart />
          <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
            {[{ l: "Avg", v: "350" }, { l: "Peak", v: "2,453" }, { l: "Goal", v: "3,000" }].map(x => (
              <div key={x.l}>
                <div style={{ fontSize: 11, color: "#aaa" }}>{x.l}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#8B5CF6" }}>{x.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
        <div style={{ fontWeight: 800, color: "#1a1a2e", fontSize: 16, marginBottom: 16 }}>Recent Activity</div>
        {recentActivity.map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: i < recentActivity.length - 1 ? "1px solid #f5f3ff" : "none" }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#8B5CF6,#5c29e7)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>{a.avatar}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "#1a1a2e", fontSize: 14 }}>{a.user}</div>
              <div style={{ color: "#888", fontSize: 13 }}>{a.action}</div>
            </div>
            {a.score && <div style={{ background: "#f0ebff", color: "#8B5CF6", borderRadius: 8, padding: "3px 12px", fontWeight: 700, fontSize: 13 }}>{a.score}%</div>}
            <div style={{ color: "#bbb", fontSize: 12 }}>{a.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}