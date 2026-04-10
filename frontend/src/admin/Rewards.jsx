// src/admin/Rewards.jsx — real data from /api/admin/rewards
import { useState, useEffect } from "react";
import { adminRewards } from "./adminApi";

const BADGE_META = {
  "first-win":   { icon: "🏆", name: "First Win",      desc: "Win first Scribble game",   color: "#f59e0b" },
  "streak-5":    { icon: "🔥", name: "5-Day Streak",   desc: "5 consecutive days",         color: "#ef4444" },
  "scribble-pro":{ icon: "🎨", name: "Scribble Pro",   desc: "Win 10 Scribble games",      color: "#8B5CF6" },
  "twister-pro": { icon: "🗣️", name: "Twister Master", desc: "20+ score in Twister",       color: "#10b981" },
  "math-genius": { icon: "🧮", name: "Math Genius",    desc: "50+ score in Math",          color: "#3b82f6" },
  "gamer":       { icon: "🕹️", name: "Game Addict",   desc: "Play 20 games total",        color: "#6366f1" },
  "high-scorer": { icon: "⚡", name: "High Scorer",    desc: "Score 300+ in one game",     color: "#ec4899" },
};

function Skel({ h = 60 }) {
  return <div style={{ height: h, background: "#f0ebff", borderRadius: 10, marginBottom: 8 }} />;
}

export default function Rewards() {
  const [lb,      setLb]      = useState(null);
  const [badges,  setBadges]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    Promise.all([adminRewards.getLeaderboard(20), adminRewards.getBadgeStats()])
      .then(([lbData, badgeData]) => { setLb(lbData); setBadges(badgeData); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const stats   = lb?.stats       || {};
  const leaders = lb?.leaderboard || [];
  const badgeC  = badges?.badgeCounts || {};

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1a1a2e", margin: 0 }}>Rewards & Motivation</h1>
        <p style={{ color: "#8B5CF6", margin: "4px 0 0", fontSize: 14 }}>Real leaderboard from Math, Twister, and Scribble scores.</p>
      </div>

      {error && <div style={{ background: "#fee2e2", borderRadius: 10, padding: "10px 16px", color: "#991b1b", marginBottom: 20, fontSize: 14 }}>⚠️ {error}</div>}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { l: "Total Points",   v: loading ? "—" : (stats.totalPoints  ?? 0).toLocaleString(), icon: "⭐", color: "#f59e0b" },
          { l: "Users Played",   v: loading ? "—" : stats.usersPlayed   ?? 0,                   icon: "🎮", color: "#8B5CF6" },
          { l: "Active Streaks", v: loading ? "—" : stats.activeStreaks  ?? 0,                   icon: "🔥", color: "#ef4444" },
          { l: "Top Score",      v: loading ? "—" : leaders[0]?.totalScore ?? 0,                 icon: "🏆", color: "#10b981" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 12px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.v}</div>
            <div style={{ fontSize: 13, color: "#888", marginTop: 3 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>
        {/* Leaderboard */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
          <div style={{ fontWeight: 800, color: "#1a1a2e", fontSize: 16, marginBottom: 20 }}>🏆 Leaderboard</div>

          {loading
            ? [1,2,3,4,5].map(i => <Skel key={i} />)
            : leaders.length === 0
              ? <p style={{ color: "#aaa", fontSize: 13 }}>No game scores yet. Users need to play Math, Twister, or Scribble games.</p>
              : <>
                  {/* Top 3 podium */}
                  {leaders.length >= 3 && (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 16, marginBottom: 24, padding: "0 20px" }}>
                      {[leaders[1], leaders[0], leaders[2]].filter(Boolean).map((u, i) => {
                        const heights = [80, 100, 70];
                        const colors  = ["#e5e7eb", "#f59e0b", "#d1d5db"];
                        const medals  = ["🥈","🥇","🥉"];
                        return (
                          <div key={u.userId} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#8B5CF6,#5c29e7)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
                              {(u.name||"U")[0]}
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a2e" }}>{(u.name||"").split(" ")[0]}</div>
                            <div style={{ fontSize: 11, color: "#8B5CF6", marginBottom: 6 }}>{(u.totalScore||0).toLocaleString()} pts</div>
                            <div style={{ width: "100%", height: heights[i], background: colors[i], borderRadius: "8px 8px 0 0", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 8 }}>
                              <span style={{ fontSize: 18 }}>{medals[i]}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {leaders.map((u, i) => (
                    <div key={u.userId || i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: i < leaders.length - 1 ? "1px solid #f5f3ff" : "none" }}>
                      <div style={{ width: 28, textAlign: "center", fontSize: i < 3 ? 18 : 14, fontWeight: 800, color: i < 3 ? "#f59e0b" : "#ccc" }}>
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i+1}`}
                      </div>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#8B5CF6,#5c29e7)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                        {(u.name||"U")[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: "#1a1a2e", fontSize: 14 }}>{u.name || "Unknown"}</div>
                        <div style={{ fontSize: 11, color: "#888" }}>{u.disabilityType} · {u.gamesPlayed} games · {u.wins} wins</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 800, color: "#8B5CF6", fontSize: 15 }}>{(u.totalScore||0).toLocaleString()}</div>
                        <div style={{ fontSize: 11, color: "#aaa" }}>pts</div>
                      </div>
                    </div>
                  ))}
                </>
          }
        </div>

        {/* Badges */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
          <div style={{ fontWeight: 800, color: "#1a1a2e", fontSize: 16, marginBottom: 20 }}>🏅 Badge Distribution</div>
          {loading
            ? [1,2,3,4,5,6,7].map(i => <Skel key={i} h={48} />)
            : <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {Object.entries(BADGE_META).map(([key, meta]) => (
                  <div key={key} style={{ background: "#faf9ff", borderRadius: 14, padding: 14, border: "1.5px solid #f0ebff", textAlign: "center" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${meta.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 8px" }}>{meta.icon}</div>
                    <div style={{ fontWeight: 800, color: "#1a1a2e", fontSize: 12, marginBottom: 3 }}>{meta.name}</div>
                    <div style={{ fontSize: 11, color: "#888", marginBottom: 8 }}>{meta.desc}</div>
                    <div style={{ background: meta.color, color: "#fff", borderRadius: 8, padding: "3px 10px", fontWeight: 700, fontSize: 12, display: "inline-block" }}>
                      {badgeC[key] ?? 0} earned
                    </div>
                  </div>
                ))}
              </div>
          }

          {/* Points summary card */}
          {!loading && stats.totalPoints != null && (
            <div style={{ background: "linear-gradient(135deg,#8B5CF6,#5c29e7)", borderRadius: 16, padding: 18, marginTop: 16, color: "#fff" }}>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Total Points in System</div>
              <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{(stats.totalPoints||0).toLocaleString()}</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>Across {stats.usersPlayed||0} active players</div>
              {stats.usersPlayed > 0 && (
                <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "6px 12px", marginTop: 10, fontSize: 12, fontWeight: 600 }}>
                  Avg: {Math.round((stats.totalPoints||0) / (stats.usersPlayed||1))} pts/player
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}