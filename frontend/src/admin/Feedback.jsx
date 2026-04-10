
// src/admin/Feedback.jsx — real data from /api/admin/feedback
import { useState, useEffect, useCallback } from "react";
import { adminFeedback } from "./adminApi";

const statusStyle = {
  Open:         { bg: "#fef3c7", color: "#92400e" },
  "In Progress":{ bg: "#dbeafe", color: "#1d4ed8" },
  Resolved:     { bg: "#dcfce7", color: "#166534" },
};
const catStyle = {
  Bug:      { bg: "#fee2e2", color: "#991b1b" },
  Feature:  { bg: "#ede9fe", color: "#7c3aed" },
  Audio:    { bg: "#fce7f3", color: "#be185d" },
  Feedback: { bg: "#dcfce7", color: "#166534" },
  Other:    { bg: "#f1f5f9", color: "#475569" },
};

export default function Feedback() {
  const [data,     setData]     = useState({ items: [], counts: {}, satisfaction: "0.0" });
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [selected, setSelected] = useState(null);
  const [reply,    setReply]    = useState("");
  const [sending,  setSending]  = useState(false);

  const fetchFeedback = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await adminFeedback.getAll({ limit: 30 });
      setData(res);
      if (res.items?.length && !selected) setSelected(res.items[0]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => { fetchFeedback(); }, [fetchFeedback]);

  const handleReply = async () => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    try {
      await adminFeedback.reply(selected._id, reply);
      setReply("");
      fetchFeedback();
    } catch (e) {
      alert("Failed: " + e.message);
    } finally {
      setSending(false);
    }
  };

  const handleStatus = async (status) => {
    if (!selected) return;
    try {
      await adminFeedback.updateStatus(selected._id, status);
      fetchFeedback();
    } catch (e) {
      alert("Failed: " + e.message);
    }
  };

  const c = data.counts || {};
  const stats = [
    { l: "Open",         v: c.open       ?? 0, color: "#f59e0b" },
    { l: "In Progress",  v: c.inProgress ?? 0, color: "#3b82f6" },
    { l: "Resolved",     v: c.resolved   ?? 0, color: "#10b981" },
    { l: "Satisfaction", v: `${data.satisfaction}/5`, color: "#8B5CF6" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1a1a2e", margin: 0 }}>Feedback & Support</h1>
        <p style={{ color: "#8B5CF6", margin: "4px 0 0", fontSize: 14 }}>Real user-submitted tickets from your platform.</p>
      </div>

      {error && <div style={{ background: "#fee2e2", borderRadius: 10, padding: "10px 16px", color: "#991b1b", marginBottom: 20, fontSize: 14 }}>⚠️ {error}</div>}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "16px 20px", boxShadow: "0 2px 12px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{loading ? "—" : s.v}</div>
            <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 20 }}>
        {/* Ticket list */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
          <div style={{ fontWeight: 800, color: "#1a1a2e", fontSize: 15, marginBottom: 16 }}>All Tickets</div>
          {loading
            ? [1,2,3].map(i => <div key={i} style={{ height: 80, background: "#f0ebff", borderRadius: 12, marginBottom: 8 }} />)
            : data.items.length === 0
              ? <p style={{ color: "#aaa", fontSize: 13 }}>No feedback submitted yet. Users can submit via their portal.</p>
              : data.items.map((t) => {
                  const name = t.userId?.name || t.userName || "User";
                  return (
                    <div key={t._id} onClick={() => setSelected(t)}
                      style={{ padding: 14, borderRadius: 12, marginBottom: 8, cursor: "pointer", background: selected?._id === t._id ? "#f0ebff" : "#faf9ff", border: `1.5px solid ${selected?._id === t._id ? "#8B5CF6" : "#f0ebff"}`, transition: "all 0.15s" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#8B5CF6,#5c29e7)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{name[0]}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, color: "#1a1a2e", fontSize: 14 }}>{name}</div>
                          <div style={{ fontSize: 12, color: "#888" }}>{new Date(t.createdAt).toLocaleDateString()}</div>
                        </div>
                        <span style={{ ...statusStyle[t.status], borderRadius: 6, padding: "2px 8px", fontWeight: 700, fontSize: 11 }}>{t.status}</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 4 }}>{t.subject}</div>
                      <div style={{ fontSize: 12, color: "#aaa", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{t.message}</div>
                    </div>
                  );
                })
          }
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#1a1a2e" }}>{selected.subject}</div>
                <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>
                  From: {selected.userId?.name || selected.userName || "User"} · {new Date(selected.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ ...(catStyle[selected.category] || catStyle.Other), borderRadius: 8, padding: "4px 12px", fontWeight: 700, fontSize: 12 }}>{selected.category}</span>
                <span style={{ ...statusStyle[selected.status], borderRadius: 8, padding: "4px 12px", fontWeight: 700, fontSize: 12 }}>{selected.status}</span>
              </div>
            </div>

            <div style={{ background: "#faf9ff", borderRadius: 12, padding: 16, flex: 1, marginBottom: 16, overflowY: "auto", maxHeight: 300 }}>
              {/* Original message */}
              <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#8B5CF6,#5c29e7)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>
                  {(selected.userId?.name || selected.userName || "U")[0]}
                </div>
                <div style={{ background: "#fff", borderRadius: "0 12px 12px 12px", padding: "12px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", flex: 1 }}>
                  <div style={{ fontSize: 14, color: "#333", lineHeight: 1.6 }}>{selected.message}</div>
                  <div style={{ fontSize: 11, color: "#aaa", marginTop: 6 }}>{new Date(selected.createdAt).toLocaleString()}</div>
                </div>
              </div>

              {/* Replies */}
              {(selected.replies || []).map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: r.from === "admin" ? "flex-end" : "flex-start", marginBottom: 10 }}>
                  <div style={{ background: r.from === "admin" ? "#ede9fe" : "#fff", borderRadius: r.from === "admin" ? "12px 0 12px 12px" : "0 12px 12px 12px", padding: "10px 14px", maxWidth: "75%", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
                    <div style={{ fontSize: 13, color: r.from === "admin" ? "#7c3aed" : "#333" }}>{r.message}</div>
                    <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>{r.from} · {new Date(r.sentAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your reply…"
                style={{ width: "100%", borderRadius: 12, border: "1.5px solid #e8e3ff", padding: "12px 16px", fontSize: 14, resize: "none", height: 80, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button onClick={() => handleStatus("Resolved")}
                  style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1.5px solid #e8e3ff", background: "#fff", color: "#10b981", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  ✅ Mark Resolved
                </button>
                <button onClick={() => handleStatus("In Progress")}
                  style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1.5px solid #e8e3ff", background: "#fff", color: "#3b82f6", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  🔄 In Progress
                </button>
                <button onClick={handleReply} disabled={sending || !reply.trim()}
                  style={{ flex: 2, padding: "10px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#8B5CF6,#5c29e7)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: sending || !reply.trim() ? 0.7 : 1 }}>
                  {sending ? "Sending…" : "Send Reply"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}