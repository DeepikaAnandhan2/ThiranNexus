// admin/Feedback.jsx
import { useState } from "react";

const TICKETS = [
  { id: 1, user: "Anu Priya", subject: "App not responding", category: "Bug", date: "Apr 24, 2024", status: "Open", avatar: "A", preview: "The application freezes after the 3rd level of the tongue twister exercise. This has happened multiple times." },
  { id: 2, name: "Ramesh K.", subject: "Need Tamil support", category: "Feature", date: "Apr 24, 2024", status: "In Progress", avatar: "R", preview: "It would be very helpful to have Tamil language support for the Math Questions module." },
  { id: 3, user: "Sneha M.", subject: "Voice not clear", category: "Audio", date: "Apr 23, 2024", status: "Open", avatar: "S", preview: "The text-to-speech audio quality is poor for some content items. Very difficult to understand." },
  { id: 4, user: "Arun Kumar", subject: "Great platform!", category: "Feedback", date: "Apr 23, 2024", status: "Resolved", avatar: "A", preview: "This platform has helped my child immensely. The visual exercises are top-notch. Thank you!" },
  { id: 5, user: "Divya P.", subject: "Cannot login", category: "Bug", date: "Apr 22, 2024", status: "Resolved", avatar: "D", preview: "I was unable to login yesterday. The OTP was not received on my registered email." },
];

const statusStyle = {
  Open: { bg: "#fef3c7", color: "#92400e" },
  "In Progress": { bg: "#dbeafe", color: "#1d4ed8" },
  Resolved: { bg: "#dcfce7", color: "#166534" },
};

const catStyle = {
  Bug: { bg: "#fee2e2", color: "#991b1b" },
  Feature: { bg: "#ede9fe", color: "#7c3aed" },
  Audio: { bg: "#fce7f3", color: "#be185d" },
  Feedback: { bg: "#dcfce7", color: "#166534" },
};

export default function Feedback() {
  const [selected, setSelected] = useState(TICKETS[0]);
  const [reply, setReply] = useState("");

  const stats = [
    { l: "Open Tickets", v: TICKETS.filter(t => t.status === "Open").length, color: "#f59e0b" },
    { l: "In Progress", v: TICKETS.filter(t => t.status === "In Progress").length, color: "#3b82f6" },
    { l: "Resolved", v: TICKETS.filter(t => t.status === "Resolved").length, color: "#10b981" },
    { l: "Satisfaction", v: "4.6/5", color: "#8B5CF6" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1a1a2e", margin: 0 }}>Feedback & Support</h1>
        <p style={{ color: "#8B5CF6", margin: "4px 0 0", fontSize: 14 }}>Manage feedback and support requests from users.</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "16px 20px", boxShadow: "0 2px 12px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.v}</div>
            <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 20 }}>
        {/* Ticket List */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
          <div style={{ fontWeight: 800, color: "#1a1a2e", fontSize: 15, marginBottom: 16 }}>All Tickets</div>
          {TICKETS.map((t, i) => (
            <div key={t.id} onClick={() => setSelected(t)} style={{
              padding: "14px", borderRadius: 12, marginBottom: 8, cursor: "pointer",
              background: selected?.id === t.id ? "#f0ebff" : "#faf9ff",
              border: `1.5px solid ${selected?.id === t.id ? "#8B5CF6" : "#f0ebff"}`,
              transition: "all 0.15s"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#8B5CF6,#5c29e7)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{t.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: "#1a1a2e", fontSize: 14 }}>{t.user || t.name}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>{t.date}</div>
                </div>
                <span style={{ ...statusStyle[t.status], borderRadius: 6, padding: "2px 8px", fontWeight: 700, fontSize: 11 }}>{t.status}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 4 }}>{t.subject}</div>
              <div style={{ fontSize: 12, color: "#aaa", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{t.preview}</div>
            </div>
          ))}
          <button style={{ width: "100%", marginTop: 8, padding: "10px 0", borderRadius: 10, border: "1.5px solid #e8e3ff", background: "#fff", color: "#8B5CF6", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>View All Tickets</button>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#1a1a2e" }}>{selected.subject}</div>
                <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>From: {selected.user || selected.name} · {selected.date}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ ...catStyle[selected.category], borderRadius: 8, padding: "4px 12px", fontWeight: 700, fontSize: 12 }}>{selected.category}</span>
                <span style={{ ...statusStyle[selected.status], borderRadius: 8, padding: "4px 12px", fontWeight: 700, fontSize: 12 }}>{selected.status}</span>
              </div>
            </div>

            <div style={{ background: "#faf9ff", borderRadius: 12, padding: 16, flex: 1, marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#8B5CF6,#5c29e7)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>{selected.avatar}</div>
                <div style={{ background: "#fff", borderRadius: "0 12px 12px 12px", padding: "12px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", flex: 1 }}>
                  <div style={{ fontSize: 14, color: "#333", lineHeight: 1.6 }}>{selected.preview}</div>
                  <div style={{ fontSize: 11, color: "#aaa", marginTop: 8 }}>{selected.date}</div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ background: "#ede9fe", borderRadius: "12px 0 12px 12px", padding: "12px 16px", maxWidth: "70%" }}>
                  <div style={{ fontSize: 14, color: "#7c3aed" }}>Thank you for reaching out! We're looking into this issue and will get back to you shortly.</div>
                  <div style={{ fontSize: 11, color: "#a78bfa", marginTop: 8, textAlign: "right" }}>Admin · Just now</div>
                </div>
              </div>
            </div>

            {/* Reply */}
            <div>
              <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your reply..." style={{ width: "100%", borderRadius: 12, border: "1.5px solid #e8e3ff", padding: "12px 16px", fontSize: 14, resize: "none", height: 80, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1.5px solid #e8e3ff", background: "#fff", color: "#888", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Mark Resolved</button>
                <button style={{ flex: 2, padding: "10px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#8B5CF6,#5c29e7)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Send Reply</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}