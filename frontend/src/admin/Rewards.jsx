// admin/Rewards.jsx

const LEADERBOARD = [
  { rank: 1, name: "Anu Priya", points: 2480, badge: "🏆", level: "Champion", avatar: "A", change: "+120" },
  { rank: 2, name: "Sneha M.", points: 2150, badge: "🥈", level: "Expert", avatar: "S", change: "+95" },
  { rank: 3, name: "Ramesh K.", points: 1980, badge: "🥉", level: "Expert", avatar: "R", change: "+80" },
  { rank: 4, name: "Divya P.", points: 1750, badge: "4️⃣", level: "Advanced", avatar: "D", change: "+65" },
  { rank: 5, name: "Arun Kumar", points: 1520, badge: "5️⃣", level: "Advanced", avatar: "A2", change: "+40" },
  { rank: 6, name: "Kartik R.", points: 1340, badge: "6️⃣", level: "Intermediate", avatar: "K", change: "+55" },
  { rank: 7, name: "Meena L.", points: 1120, badge: "7️⃣", level: "Intermediate", avatar: "M", change: "+30" },
];

const BADGES = [
  { name: "First Step", desc: "Completed first session", icon: "🌟", color: "#f59e0b", count: 856 },
  { name: "Champion", desc: "Top 1% performance", icon: "🏆", color: "#8B5CF6", count: 24 },
  { name: "Streak Master", desc: "7-day login streak", icon: "🔥", color: "#ef4444", count: 312 },
  { name: "Math Wizard", desc: "90%+ in Math module", icon: "🧮", color: "#3b82f6", count: 178 },
  { name: "Voice Pro", desc: "Perfect speech score", icon: "🎤", color: "#10b981", count: 94 },
  { name: "Explorer", desc: "All modules completed", icon: "🗺️", color: "#ec4899", count: 67 },
];

const levelColors = {
  Champion: { bg: "#fef3c7", color: "#92400e" },
  Expert: { bg: "#ede9fe", color: "#7c3aed" },
  Advanced: { bg: "#dbeafe", color: "#1d4ed8" },
  Intermediate: { bg: "#f0fdf4", color: "#166534" },
};

export default function Rewards() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1a1a2e", margin: 0 }}>Rewards & Motivation</h1>
        <p style={{ color: "#8B5CF6", margin: "4px 0 0", fontSize: 14 }}>Leaderboard, points, and achievement badges.</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { l: "Total Points Given", v: "48,230", icon: "⭐", color: "#f59e0b" },
          { l: "Badges Awarded", v: "1,531", icon: "🏅", color: "#8B5CF6" },
          { l: "Active Streaks", v: "312", icon: "🔥", color: "#ef4444" },
          { l: "Top Score", v: "2,480", icon: "🏆", color: "#10b981" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 12px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.v}</div>
            <div style={{ fontSize: 13, color: "#888", marginTop: 3 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Leaderboard */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
          <div style={{ fontWeight: 800, color: "#1a1a2e", fontSize: 16, marginBottom: 20 }}>🏆 Leaderboard</div>

          {/* Top 3 podium */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 16, marginBottom: 24, padding: "0 20px" }}>
            {[LEADERBOARD[1], LEADERBOARD[0], LEADERBOARD[2]].map((u, i) => {
              const heights = [80, 100, 70];
              const podiumColors = ["#e5e7eb", "#f59e0b", "#d1d5db"];
              return (
                <div key={u.rank} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#8B5CF6,#5c29e7)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{u.avatar[0]}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a2e" }}>{u.name.split(" ")[0]}</div>
                  <div style={{ fontSize: 11, color: "#8B5CF6", marginBottom: 6 }}>{u.points.toLocaleString()} pts</div>
                  <div style={{ width: "100%", height: heights[i], background: `linear-gradient(180deg, ${podiumColors[i]}, ${podiumColors[i]}80)`, borderRadius: "8px 8px 0 0", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 8 }}>
                    <span style={{ fontSize: 18 }}>{u.badge}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full list */}
          {LEADERBOARD.map((u, i) => (
            <div key={u.rank} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: i < LEADERBOARD.length - 1 ? "1px solid #f5f3ff" : "none" }}>
              <div style={{ width: 28, textAlign: "center", fontSize: u.rank <= 3 ? 18 : 14, fontWeight: 800, color: u.rank <= 3 ? "#f59e0b" : "#ccc" }}>{u.rank <= 3 ? u.badge : `#${u.rank}`}</div>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#8B5CF6,#5c29e7)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{u.avatar[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "#1a1a2e", fontSize: 14 }}>{u.name}</div>
                <span style={{ ...levelColors[u.level], borderRadius: 5, padding: "1px 7px", fontWeight: 600, fontSize: 11 }}>{u.level}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 800, color: "#8B5CF6", fontSize: 15 }}>{u.points.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: "#10b981" }}>{u.change} this week</div>
              </div>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
          <div style={{ fontWeight: 800, color: "#1a1a2e", fontSize: 16, marginBottom: 20 }}>🏅 Achievement Badges</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {BADGES.map((b, i) => (
              <div key={i} style={{ background: "#faf9ff", borderRadius: 14, padding: 16, border: "1.5px solid #f0ebff", textAlign: "center" }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: `${b.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 10px" }}>{b.icon}</div>
                <div style={{ fontWeight: 800, color: "#1a1a2e", fontSize: 13, marginBottom: 4 }}>{b.name}</div>
                <div style={{ fontSize: 11, color: "#888", marginBottom: 8 }}>{b.desc}</div>
                <div style={{ background: b.color, color: "#fff", borderRadius: 8, padding: "3px 10px", fontWeight: 700, fontSize: 12, display: "inline-block" }}>{b.count} users</div>
              </div>
            ))}
          </div>

          {/* Points display */}
          <div style={{ background: "linear-gradient(135deg,#8B5CF6,#5c29e7)", borderRadius: 16, padding: 20, marginTop: 16, color: "#fff" }}>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>Total Points in System</div>
            <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>48,230</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Distributed across 1,248 users</div>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "8px 14px", marginTop: 14, fontSize: 13, fontWeight: 600 }}>Average: 38.6 pts/user</div>
          </div>
        </div>
      </div>
    </div>
  );
}