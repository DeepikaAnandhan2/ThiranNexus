// src/pages/FeedbackPage.jsx
// FIX: "Not authorized, token failed"
//
// ROOT CAUSE (line 12 in the old file):
//   localStorage.getItem("tn_token") || localStorage.getItem("tn_token")
//   ← copy-paste bug: reads the SAME key twice, never reads "token"
//
// YOUR AUTH CHAIN:
//   Login.jsx  saves → localStorage.setItem("token", ...)  AND  localStorage.setItem("tn_token", ...)
//   AuthContext saves → localStorage.setItem("tn_token", ...)
// So both keys exist, but the old code only ever tried tn_token (twice) and if
// that was somehow missing the headers object was empty → 401.
//
// FIX: try all possible key names in order.

import { useState, useEffect } from "react";
import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Reads whichever token key is present ──────────────────
const getToken = () =>
  localStorage.getItem("tn_token") ||   // set by AuthContext
  localStorage.getItem("token")    ||   // set by Login.jsx axios handler
  null;

const getHeaders = () => {
  const token = getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

const CATEGORIES = ["Bug", "Feature", "Audio", "Feedback", "Other"];

const catColors = {
  Bug:      { bg: "#fee2e2", color: "#991b1b" },
  Feature:  { bg: "#ede9fe", color: "#7c3aed" },
  Audio:    { bg: "#fce7f3", color: "#be185d" },
  Feedback: { bg: "#dcfce7", color: "#166534" },
  Other:    { bg: "#f1f5f9", color: "#475569" },
};
const statusColors = {
  Open:          { bg: "#fef3c7", color: "#92400e" },
  "In Progress": { bg: "#dbeafe", color: "#1d4ed8" },
  Resolved:      { bg: "#dcfce7", color: "#166534" },
};

export default function FeedbackPage() {
  const [tickets,    setTickets]    = useState([]);
  const [selected,   setSelected]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState({ subject: "", message: "", category: "Bug" });
  const [formError,  setFormError]  = useState("");
  const [success,    setSuccess]    = useState("");

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE}/api/feedback/my-tickets`, { headers: getHeaders() });
      const list = res.data.tickets || [];
      setTickets(list);
      if (list.length > 0 && !selected) setSelected(list[0]);
    } catch (e) {
      console.error("Fetch tickets:", e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []); // eslint-disable-line

  const handleSubmit = async () => {
    if (!form.subject.trim() || !form.message.trim()) {
      setFormError("Subject and message are required.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const res = await axios.post(`${BASE}/api/feedback/submit`, form, { headers: getHeaders() });
      setSuccess("Ticket submitted! The admin will reply shortly.");
      setForm({ subject: "", message: "", category: "Bug" });
      setShowForm(false);
      // Refresh list and auto-select the new ticket
      const updated = await axios.get(`${BASE}/api/feedback/my-tickets`, { headers: getHeaders() });
      const list = updated.data.tickets || [];
      setTickets(list);
      if (res.data.item) setSelected(res.data.item);
      else if (list.length) setSelected(list[0]);
    } catch (e) {
      setFormError(e.response?.data?.error || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Display name — tries AuthContext key first, then Login.jsx key
  const userName = (() => {
    try {
      const u1 = JSON.parse(localStorage.getItem("tn_user") || "{}");
      if (u1?.name) return u1.name;
      const u2 = JSON.parse(localStorage.getItem("user") || "{}");
      return u2?.name || "You";
    } catch { return "You"; }
  })();

  return (
    <div style={{ padding: 24, fontFamily: "'Nunito', sans-serif", maxWidth: 1100, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1a1a2e", margin: 0 }}>Help & Support</h1>
          <p style={{ color: "#8B5CF6", margin: "4px 0 0", fontSize: 14 }}>
            Submit a ticket and get a reply from the admin team.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setSuccess(""); setFormError(""); }}
          style={{ background: "linear-gradient(135deg,#8B5CF6,#5c29e7)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
        >
          {showForm ? "✕ Cancel" : "+ New Ticket"}
        </button>
      </div>

      {/* Success banner */}
      {success && (
        <div style={{ background: "#dcfce7", borderRadius: 10, padding: "12px 16px", color: "#166534", fontWeight: 600, fontSize: 14, marginBottom: 20, border: "1.5px solid #86efac" }}>
          ✅ {success}
        </div>
      )}

      {/* New ticket form */}
      {showForm && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff", marginBottom: 24 }}>
          <div style={{ fontWeight: 800, color: "#1a1a2e", fontSize: 16, marginBottom: 16 }}>Submit New Ticket</div>

          {formError && (
            <div style={{ background: "#fee2e2", borderRadius: 8, padding: "8px 12px", color: "#991b1b", fontSize: 13, marginBottom: 12 }}>
              ⚠️ {formError}
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: "#555", display: "block", marginBottom: 6 }}>Category</label>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e8e3ff", fontSize: 14, outline: "none" }}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: "#555", display: "block", marginBottom: 6 }}>Subject</label>
            <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
              placeholder="e.g. App freezes on tongue twister level 3"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e8e3ff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: "#555", display: "block", marginBottom: 6 }}>Message</label>
            <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              placeholder="Describe the issue or your request in detail…"
              rows={4}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e8e3ff", fontSize: 14, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
          </div>

          <button onClick={handleSubmit} disabled={submitting}
            style={{ background: "linear-gradient(135deg,#8B5CF6,#5c29e7)", color: "#fff", border: "none", borderRadius: 10, padding: "11px 24px", fontWeight: 700, fontSize: 14, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}>
            {submitting ? "Submitting…" : "Submit Ticket"}
          </button>
        </div>
      )}

      {/* Tickets + thread */}
      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20, minHeight: 500 }}>

        {/* Ticket list */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
          <div style={{ fontWeight: 800, color: "#1a1a2e", fontSize: 15, marginBottom: 12 }}>
            Your Tickets ({tickets.length})
          </div>
          {loading ? (
            [1,2].map(i => <div key={i} style={{ height: 70, background: "#f0ebff", borderRadius: 10, marginBottom: 8 }} />)
          ) : tickets.length === 0 ? (
            <div style={{ textAlign: "center", padding: 32 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
              <div style={{ color: "#888", fontSize: 14 }}>No tickets yet.</div>
              <div style={{ color: "#aaa", fontSize: 13 }}>Click "+ New Ticket" above to get help.</div>
            </div>
          ) : (
            tickets.map(t => (
              <div key={t._id} onClick={() => setSelected(t)}
                style={{ padding: 14, borderRadius: 12, marginBottom: 8, cursor: "pointer", background: selected?._id === t._id ? "#f0ebff" : "#faf9ff", border: `1.5px solid ${selected?._id === t._id ? "#8B5CF6" : "#f0ebff"}`, transition: "all 0.15s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: "#1a1a2e", fontSize: 14 }}>{t.subject}</span>
                  <span style={{ ...statusColors[t.status], borderRadius: 6, padding: "2px 8px", fontWeight: 700, fontSize: 11 }}>{t.status}</span>
                </div>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>
                  <span style={{ ...catColors[t.category], borderRadius: 4, padding: "1px 6px", fontWeight: 600, fontSize: 11 }}>{t.category}</span>
                  {" · "}{new Date(t.createdAt).toLocaleDateString()}
                </div>
                <div style={{ fontSize: 12, color: "#aaa", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.message}</div>
                {t.replies?.length > 0 && (
                  <div style={{ fontSize: 11, color: "#8B5CF6", fontWeight: 700, marginTop: 4 }}>
                    💬 {t.replies.length} admin {t.replies.length === 1 ? "reply" : "replies"}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Thread panel */}
        {selected ? (
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #f0ebff" }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#1a1a2e" }}>{selected.subject}</div>
                <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>
                  <span style={{ ...catColors[selected.category], borderRadius: 4, padding: "2px 8px", fontWeight: 600, fontSize: 12 }}>{selected.category}</span>
                  {" · Opened "}{new Date(selected.createdAt).toLocaleDateString()}
                </div>
              </div>
              <span style={{ ...statusColors[selected.status], borderRadius: 8, padding: "5px 14px", fontWeight: 700, fontSize: 13 }}>{selected.status}</span>
            </div>

            <div style={{ flex: 1, overflowY: "auto", maxHeight: 400, display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
              {/* Original message */}
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#8B5CF6,#5c29e7)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                  {userName[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "#aaa", marginBottom: 4 }}>
                    {userName} (You) · {new Date(selected.createdAt).toLocaleString()}
                  </div>
                  <div style={{ background: "#faf9ff", borderRadius: "0 12px 12px 12px", padding: "12px 16px", fontSize: 14, color: "#333", lineHeight: 1.6, border: "1.5px solid #f0ebff" }}>
                    {selected.message}
                  </div>
                </div>
              </div>

              {/* Replies */}
              {(selected.replies || []).length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 0", color: "#aaa", fontSize: 13 }}>⏳ Waiting for admin reply…</div>
              ) : (
                (selected.replies || []).map((r, i) =>
                  r.from === "admin" ? (
                    <div key={i} style={{ display: "flex", justifyContent: "flex-end" }}>
                      <div style={{ maxWidth: "75%" }}>
                        <div style={{ fontSize: 12, color: "#aaa", marginBottom: 4, textAlign: "right" }}>
                          ThiranNexus Admin · {new Date(r.sentAt).toLocaleString()}
                        </div>
                        <div style={{ background: "#ede9fe", borderRadius: "12px 0 12px 12px", padding: "12px 16px", fontSize: 14, color: "#5b21b6", lineHeight: 1.6 }}>
                          {r.message}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={i} style={{ display: "flex", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#8B5CF6,#5c29e7)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                        {userName[0].toUpperCase()}
                      </div>
                      <div style={{ background: "#faf9ff", borderRadius: "0 12px 12px 12px", padding: "12px 16px", fontSize: 14, color: "#333", lineHeight: 1.6, maxWidth: "75%", border: "1.5px solid #f0ebff" }}>
                        {r.message}
                      </div>
                    </div>
                  )
                )
              )}
            </div>

            {selected.status === "Resolved" ? (
              <div style={{ background: "#dcfce7", borderRadius: 10, padding: "10px 16px", fontSize: 13, color: "#166634", fontWeight: 600 }}>
                ✅ This ticket has been resolved. Open a new ticket if you need more help.
              </div>
            ) : (
              <div style={{ background: "#f5f3ff", borderRadius: 10, padding: "10px 16px", fontSize: 13, color: "#5b21b6" }}>
                💬 The admin team will reply here. You'll also get a notification.
              </div>
            )}
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 16, padding: 48, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
            <div style={{ fontWeight: 700, color: "#1a1a2e", fontSize: 16 }}>Select a ticket to view the conversation</div>
            <div style={{ color: "#aaa", fontSize: 14, marginTop: 6 }}>or create a new one above</div>
          </div>
        )}
      </div>
    </div>
  );
}