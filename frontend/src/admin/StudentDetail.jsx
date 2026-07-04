import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { adminUsers } from "./adminApi";

const BASE = import.meta.env.VITE_API_URL || "https://thirannexus.onrender.com";

const DISABILITY_COLORS = {
  visual:    { bg: "#ede9fe", color: "#7c3aed" },
  hearing:   { bg: "#fce7f3", color: "#be185d" },
  cognitive: { bg: "#dbeafe", color: "#1d4ed8" },
  motor:     { bg: "#fef3c7", color: "#92400e" },
  speech:    { bg: "#f0fdf4", color: "#166534" },
  multiple:  { bg: "#fee2e2", color: "#991b1b" },
  other:     { bg: "#f5f3ff", color: "#5b21b6" },
  none:      { bg: "#f1f5f9", color: "#475569" },
};

export default function StudentDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sendingReport, setSendingReport] = useState(false);
  const [notifyingSchemes, setNotifyingSchemes] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await adminUsers.getById(id);
        setData(res);
        
        if (res.user && res.user.disabilityType) {
          const schemeRes = await fetch(`${BASE}/api/schemes/recommended?disabilityType=${res.user.disabilityType}`);
          if (schemeRes.ok) {
            const schemeData = await schemeRes.json();
            setSchemes(schemeData);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleSendReport = async () => {
    setSendingReport(true);
    try {
      await adminUsers.sendReport(id);
      setToast("Monthly progress report sent successfully!");
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      alert("Failed to send report: " + err.message);
    } finally {
      setSendingReport(false);
    }
  };

  const handleNotifySchemes = async () => {
    setNotifyingSchemes(true);
    try {
      await adminUsers.notifySchemes(id, { schemes });
      setToast("Eligible schemes notification sent successfully!");
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      alert("Failed to notify schemes: " + err.message);
    } finally {
      setNotifyingSchemes(false);
    }
  };

  if (loading) return <div style={{ padding: 40, color: "#8B5CF6", fontWeight: 600 }}>Loading student details...</div>;
  if (error) return <div style={{ padding: 40, color: "red" }}>Error: {error}</div>;
  if (!data || !data.user) return <div style={{ padding: 40 }}>User not found.</div>;

  const { user, scribble, games } = data;
  const dColor = DISABILITY_COLORS[user.disabilityType] || DISABILITY_COLORS.none;

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Header / Nav */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
        <Link to="/admin/users" style={{ color: "#8B5CF6", textDecoration: "none", fontWeight: 700 }}>← Back to Users</Link>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1a1a2e", margin: 0 }}>Student Detail</h1>
      </div>

      {toast && (
        <div style={{ background: "#10b981", color: "#fff", padding: "12px 20px", borderRadius: 8, marginBottom: 20, fontWeight: 600 }}>
          ✓ {toast}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* 1. Student Information */}
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1a1a2e", marginTop: 0, marginBottom: 20 }}>Personal Information</h2>
            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#8B5CF6,#5c29e7)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 32, flexShrink: 0 }}>
                {(user.name || "U")[0]}
              </div>
              <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Name</div>
                  <div style={{ fontWeight: 600, color: "#1a1a2e" }}>{user.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Email</div>
                  <div style={{ fontWeight: 600, color: "#1a1a2e" }}>{user.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Department / Class</div>
                  <div style={{ fontWeight: 600, color: "#1a1a2e" }}>{user.course || user.className || "N/A"}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Disability Type</div>
                  <span style={{ ...dColor, borderRadius: 6, padding: "3px 10px", fontWeight: 600, fontSize: 12 }}>{user.disabilityType || "none"}</span>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>UDID</div>
                  <div style={{ fontWeight: 600, color: "#1a1a2e" }}>{user.udid || "Not Provided"}</div>
                </div>
              </div>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #f0ebff", margin: "24px 0" }} />

            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e", marginTop: 0, marginBottom: 16 }}>Parent / Guardian Information</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Parent Name</div>
                <div style={{ fontWeight: 600, color: "#1a1a2e" }}>{user.parentName || "N/A"}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Parent Email</div>
                <div style={{ fontWeight: 600, color: "#1a1a2e" }}>{user.parentEmail || "N/A"}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Parent Mobile</div>
                <div style={{ fontWeight: 600, color: "#1a1a2e" }}>{user.parentMobile || "N/A"}</div>
              </div>
            </div>
          </div>

          {/* 2 & 3. Performance (Educational & Cognitive) */}
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1a1a2e", marginTop: 0, marginBottom: 20 }}>Performance Analytics</h2>
            
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#555", marginBottom: 12 }}>Cognitive Games Recent Scores</h3>
            {games && games.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {games.map((g, i) => (
                  <div key={i} style={{ background: "#faf9ff", padding: "12px 16px", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 600, color: "#1a1a2e", fontSize: 14 }}>{g.gameType || "Cognitive Game"}</div>
                      <div style={{ fontSize: 12, color: "#888" }}>{new Date(g.playedAt).toLocaleDateString()}</div>
                    </div>
                    <div style={{ fontWeight: 800, color: "#8B5CF6", fontSize: 16 }}>{g.score} / 100</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#aaa", fontSize: 14, margin: 0 }}>No cognitive game data available.</p>
            )}

            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#555", marginTop: 24, marginBottom: 12 }}>Scribble Activity (Educational)</h3>
            {scribble && scribble.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {scribble.map((s, i) => (
                  <div key={i} style={{ background: "#faf9ff", padding: "12px 16px", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 600, color: "#1a1a2e", fontSize: 14 }}>Letter/Word: {s.letter || "?"}</div>
                      <div style={{ fontSize: 12, color: "#888" }}>{new Date(s.playedAt).toLocaleDateString()}</div>
                    </div>
                    <div style={{ fontWeight: 800, color: "#10b981", fontSize: 16 }}>Score: {s.score}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#aaa", fontSize: 14, margin: 0 }}>No scribble data available.</p>
            )}
          </div>

        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* 4. Parent Communication Module */}
          <div style={{ background: "linear-gradient(135deg, #8B5CF6, #5c29e7)", borderRadius: 12, padding: 24, color: "#fff", boxShadow: "0 4px 20px rgba(139, 92, 246, 0.3)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginTop: 0, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span>✉️</span> Parent Communication
            </h2>
            <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 20 }}>
              Easily communicate student progress and relevant government schemes with their registered parent/guardian.
            </p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button 
                onClick={handleSendReport} 
                disabled={sendingReport || !user.parentEmail}
                style={{ background: "#fff", color: "#5c29e7", border: "none", padding: "12px 16px", borderRadius: 10, fontWeight: 700, cursor: (sendingReport || !user.parentEmail) ? "not-allowed" : "pointer", opacity: (sendingReport || !user.parentEmail) ? 0.7 : 1, transition: "0.2s" }}
              >
                {sendingReport ? "Sending..." : "📄 Send Monthly Progress Report"}
              </button>
              
              <button 
                onClick={handleNotifySchemes} 
                disabled={notifyingSchemes || !user.parentEmail || schemes.length === 0}
                style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", padding: "12px 16px", borderRadius: 10, fontWeight: 700, cursor: (notifyingSchemes || !user.parentEmail || schemes.length === 0) ? "not-allowed" : "pointer", opacity: (notifyingSchemes || !user.parentEmail || schemes.length === 0) ? 0.5 : 1, transition: "0.2s" }}
              >
                {notifyingSchemes ? "Sending..." : "🏛 Notify Eligible Schemes"}
              </button>
            </div>
            {!user.parentEmail && (
              <p style={{ fontSize: 12, marginTop: 12, color: "#ffcccc" }}>* Parent email is missing for this student.</p>
            )}
            {schemes.length === 0 && user.parentEmail && (
              <p style={{ fontSize: 12, marginTop: 12, color: "#e0d4ff" }}>* No eligible schemes to notify.</p>
            )}
          </div>

          {/* 5. Government Scheme Eligibility */}
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1a1a2e", marginTop: 0, marginBottom: 16 }}>Eligible Schemes</h2>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>Based on UDID / {user.disabilityType} disability type.</p>
            
            {schemes && schemes.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {schemes.map(s => (
                  <div key={s._id} style={{ borderLeft: "4px solid #10b981", background: "#f0fdf4", padding: "14px 16px", borderRadius: "0 10px 10px 0" }}>
                    <div style={{ fontWeight: 700, color: "#166534", fontSize: 14, marginBottom: 4 }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: "#14532d", marginBottom: 8 }}>{s.benefits}</div>
                    {s.link && (
                      <a href={s.link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#10b981", fontWeight: 600, textDecoration: "none" }}>Official Link →</a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: 20, textAlign: "center", background: "#faf9ff", borderRadius: 10, color: "#888", fontSize: 14 }}>
                No specific schemes found for this disability type.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
