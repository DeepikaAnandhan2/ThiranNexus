// admin/Analytics.jsx

const kpis = [
  { label: "Success Rate", value: "85%", change: "+4.2%", icon: "🎯", color: "#8B5CF6" },
  { label: "Improvement %", value: "15%", change: "+2.1%", icon: "📈", color: "#10b981" },
  { label: "Avg. Completion", value: "68%", change: "+5.6%", icon: "✅", color: "#3b82f6" },
  { label: "Total Points", value: "5,678", change: "+10.2%", icon: "⭐", color: "#f59e0b" },
];

const topUsers = [
  { name: "Anu Priya", score: 92, improvement: "+8%", badge: "🥇" },
  { name: "Ramesh K.", score: 80, improvement: "+5%", badge: "🥈" },
  { name: "Sneha M.", score: 88, improvement: "+12%", badge: "🥉" },
  { name: "Arun Kumar", score: 75, improvement: "+3%", badge: "4" },
  { name: "Divya P.", score: 78, improvement: "+6%", badge: "5" },
];

// Line chart for daily usage
function LineChart({ data, color = "#8B5CF6", label = "" }) {
  const w = 400, h = 100;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 20) - 10;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div>
      {label && <div style={{ fontSize: 12, color: "#aaa", marginBottom: 8 }}>{label}</div>}
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 100 }}>
        <defs>
          <linearGradient id={`g${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon fill={`url(#g${color.replace("#","")})`} points={`0,${h} ${pts} ${w},${h}`} />
        <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" points={pts} />
        {data.map((v, i) => {
          const x = (i / (data.length - 1)) * w;
          const y = h - ((v - min) / (max - min || 1)) * (h - 20) - 10;
          return <circle key={i} cx={x} cy={y} r="3.5" fill={color} stroke="#fff" strokeWidth="1.5" />;
        })}
      </svg>
    </div>
  );
}

// Bar chart
function BarChart({ data, labels, color = "#8B5CF6" }) {
  const max = Math.max(...data);
  return (
    <svg viewBox={`0 0 ${data.length * 40} 100`} style={{ width: "100%", height: 100 }}>
      {data.map((v, i) => (
        <g key={i}>
          <rect x={i * 40 + 8} y={100 - (v / max) * 80} width={24} height={(v / max) * 80} rx={5} fill={color} opacity={0.7 + (i % 2) * 0.3} />
          {labels && <text x={i * 40 + 20} y={98} textAnchor="middle" fontSize="9" fill="#aaa">{labels[i]}</text>}
        </g>
      ))}
    </svg>
  );
}

export default function Analytics() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1a1a2e", margin: 0 }}>Analytics & Performance</h1>
        <p style={{ color: "#8B5CF6", margin: "4px 0 0", fontSize: 14 }}>Track learning outcomes and engagement metrics.</p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {kpis.map((k, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 12px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 22 }}>{k.icon}</span>
              <span style={{ background: "#f0ebff", color: "#8B5CF6", borderRadius: 8, padding: "2px 9px", fontSize: 12, fontWeight: 700 }}>{k.change}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 13, color: "#888", marginTop: 3 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 22, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
          <div style={{ fontWeight: 800, color: "#1a1a2e", fontSize: 15, marginBottom: 4 }}>Daily Usage</div>
          <div style={{ fontSize: 12, color: "#aaa", marginBottom: 12 }}>Sessions per day</div>
          <LineChart data={[200, 350, 280, 420, 380, 510, 460]} color="#8B5CF6" />
        </div>
        <div style={{ background: "#fff", borderRadius: 16, padding: 22, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
          <div style={{ fontWeight: 800, color: "#1a1a2e", fontSize: 15, marginBottom: 4 }}>Math Scores</div>
          <div style={{ fontSize: 12, color: "#aaa", marginBottom: 12 }}>Average weekly score</div>
          <BarChart data={[60, 72, 65, 80, 75, 88, 82]} labels={["W1","W2","W3","W4","W5","W6","W7"]} color="#3b82f6" />
        </div>
        <div style={{ background: "#fff", borderRadius: 16, padding: 22, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
          <div style={{ fontWeight: 800, color: "#1a1a2e", fontSize: 15, marginBottom: 4 }}>Speech Accuracy</div>
          <div style={{ fontSize: 12, color: "#aaa", marginBottom: 12 }}>Tongue Twister results</div>
          <LineChart data={[55, 60, 58, 70, 75, 80, 85]} color="#10b981" />
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Improvement trend */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
          <div style={{ fontWeight: 800, color: "#1a1a2e", fontSize: 15, marginBottom: 4 }}>Improvement Trend</div>
          <div style={{ fontSize: 12, color: "#aaa", marginBottom: 16 }}>Last 6 weeks</div>
          <LineChart data={[5, 8, 7, 10, 12, 15]} color="#f59e0b" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 20 }}>
            {[{ l: "Week 1", v: "5%" }, { l: "Week 3", v: "10%" }, { l: "Week 6", v: "15%" }].map(x => (
              <div key={x.l} style={{ textAlign: "center", background: "#faf9ff", borderRadius: 10, padding: "10px 0" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#8B5CF6" }}>{x.v}</div>
                <div style={{ fontSize: 11, color: "#aaa" }}>{x.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top performing users */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
          <div style={{ fontWeight: 800, color: "#1a1a2e", fontSize: 15, marginBottom: 16 }}>Top Performing Users</div>
          {topUsers.map((u, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: i < topUsers.length - 1 ? "1px solid #f5f3ff" : "none" }}>
              <div style={{ fontSize: 20, width: 28, textAlign: "center" }}>{u.badge.length > 1 ? u.badge : <span style={{ background: "#f0ebff", color: "#8B5CF6", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{u.badge}</span>}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "#1a1a2e", fontSize: 14 }}>{u.name}</div>
                <div style={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>{u.improvement} improvement</div>
              </div>
              <div style={{ background: "#f0ebff", color: "#8B5CF6", borderRadius: 8, padding: "4px 12px", fontWeight: 700, fontSize: 14 }}>{u.score}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}