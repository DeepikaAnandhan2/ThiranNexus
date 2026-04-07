// src/admin/Content.jsx
// FIX: replaced all mock/static data with real API calls via adminContent + adminAnalytics

import { useState, useEffect, useCallback } from "react";
import { adminContent } from "./adminApi";

// ── Difficulty tag colours ────────────────────────────────────
const difficultyStyle = {
  easy:   { bg: "#dcfce7", color: "#166534" },
  medium: { bg: "#fef3c7", color: "#92400e" },
  hard:   { bg: "#fee2e2", color: "#991b1b" },
  // keep capitalised variants for any legacy data
  Easy:   { bg: "#dcfce7", color: "#166534" },
  Medium: { bg: "#fef3c7", color: "#92400e" },
  Hard:   { bg: "#fee2e2", color: "#991b1b" },
};

const catColor = {
  twister:  { bg: "#ede9fe", color: "#7c3aed" },
  math:     { bg: "#dbeafe", color: "#1d4ed8" },
  speech:   { bg: "#fce7f3", color: "#be185d" },
  default:  { bg: "#f1f5f9", color: "#475569" },
};

function catLabel(type) {
  const map = {
    twister: "Tongue Twister",
    math:    "Math Question",
    speech:  "Speech",
    phonetics: "Phonetics",
    reading:   "Reading",
  };
  return map[type] || type || "—";
}

// ── Skeleton loader ───────────────────────────────────────────
function Skel() {
  return (
    <tr>
      {[1,2,3,4,5,6].map(j => (
        <td key={j} style={{ padding: "12px 14px" }}>
          <div style={{ height: 16, background: "#f0ebff", borderRadius: 6 }} />
        </td>
      ))}
    </tr>
  );
}

// ── Add-scheme modal ──────────────────────────────────────────
function AddSchemeModal({ onClose, onCreated }) {
  const [form, setForm]     = useState({
    title: "", description: "", disabilityType: "visual",
    eligibility: "", benefits: "", applyLink: "",
  });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");

  const handleCreate = async () => {
    if (!form.title || !form.disabilityType) {
      setErr("Title and disability type are required.");
      return;
    }
    setSaving(true); setErr("");
    try {
      const res = await adminContent.createScheme({
        ...form,
        eligibility: form.eligibility.split(",").map(s => s.trim()).filter(Boolean),
      });
      if (res?.success) { onCreated(); onClose(); }
      else setErr(res?.error || "Failed to create scheme.");
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 460, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(92,41,231,0.2)" }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#1a1a2e", marginBottom: 20 }}>Add New Scheme</div>
        {err && <div style={{ background: "#fee2e2", borderRadius: 8, padding: "8px 12px", color: "#991b1b", fontSize: 13, marginBottom: 12 }}>⚠️ {err}</div>}

        {[
          { label: "Title *",       key: "title",       type: "text" },
          { label: "Description",   key: "description", type: "text" },
          { label: "Eligibility (comma-separated)", key: "eligibility", type: "text" },
          { label: "Benefits",      key: "benefits",    type: "text" },
          { label: "Apply Link",    key: "applyLink",   type: "url" },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: "#555", display: "block", marginBottom: 6 }}>{f.label}</label>
            <input
              type={f.type}
              value={form[f.key]}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e8e3ff", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>
        ))}

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: "#555", display: "block", marginBottom: 6 }}>Disability Type *</label>
          <select
            value={form.disabilityType}
            onChange={e => setForm(p => ({ ...p, disabilityType: e.target.value }))}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e8e3ff", fontSize: 14, outline: "none" }}
          >
            {["visual","speech","cognitive","physical","hearing","other"].map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1.5px solid #e8e3ff", background: "#fff", color: "#888", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Cancel</button>
          <button onClick={handleCreate} disabled={saving} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#8B5CF6,#5c29e7)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, opacity: saving ? 0.7 : 1 }}>
            {saving ? "Creating…" : "Add Scheme"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Content screen ───────────────────────────────────────
export default function Content() {
  const [tab,         setTab]         = useState("Schemes");
  const [schemes,     setSchemes]     = useState([]);
  const [gameStats,   setGameStats]   = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [showModal,   setShowModal]   = useState(false);
  const [search,      setSearch]      = useState("");
  const [disability,  setDisability]  = useState("");
  const [page,        setPage]        = useState(1);
  const [total,       setTotal]       = useState(0);
  const LIMIT = 15;

  // ── Fetch schemes ─────────────────────────────────────────
  const fetchSchemes = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = { page, limit: LIMIT };
      if (search)     params.search     = search;
      if (disability) params.disability = disability;

      const res = await adminContent.getSchemes(params);
      if (res?.success) {
        setSchemes(res.items || []);
        setTotal(res.total  || 0);
      } else {
        setError(res?.error || "Failed to load schemes.");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, disability]);

  // ── Fetch game content stats ──────────────────────────────
  const fetchGameStats = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await adminContent.getGameStats();
      if (res?.success) setGameStats(res);
      else setError(res?.error || "Failed to load game stats.");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "Schemes")    fetchSchemes();
    if (tab === "Game Stats") fetchGameStats();
  }, [tab, fetchSchemes, fetchGameStats]);

  // ── Delete scheme ─────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this scheme? This cannot be undone.")) return;
    try {
      await adminContent.deleteScheme(id);
      fetchSchemes();
    } catch (e) {
      alert("Delete failed: " + e.message);
    }
  };

  const pages = Math.ceil(total / LIMIT);

  return (
    <div>
      {showModal && (
        <AddSchemeModal
          onClose={() => setShowModal(false)}
          onCreated={fetchSchemes}
        />
      )}

      {/* Header */}
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1a1a2e", margin: 0 }}>Content Management</h1>
          <p style={{ color: "#8B5CF6", margin: "4px 0 0", fontSize: 14 }}>Manage government schemes and game content stats from real data.</p>
        </div>
        {tab === "Schemes" && (
          <button
            onClick={() => setShowModal(true)}
            style={{ background: "linear-gradient(135deg,#8B5CF6,#5c29e7)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(92,41,231,0.3)" }}
          >
            + Add Scheme
          </button>
        )}
      </div>

      {error && (
        <div style={{ background: "#fee2e2", borderRadius: 10, padding: "10px 16px", color: "#991b1b", marginBottom: 20, fontSize: 14 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["Schemes", "Game Stats"].map(t => (
          <button key={t} onClick={() => { setTab(t); setPage(1); }} style={{
            padding: "8px 18px", borderRadius: 10, border: "1.5px solid",
            borderColor: tab === t ? "#8B5CF6" : "#e8e3ff",
            background:  tab === t ? "#8B5CF6" : "#fff",
            color:       tab === t ? "#fff"    : "#8B5CF6",
            fontWeight: 700, fontSize: 13, cursor: "pointer"
          }}>{t}</button>
        ))}
      </div>

      {/* ── SCHEMES TAB ─────────────────────────────────────── */}
      {tab === "Schemes" && (
        <>
          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 20 }}>
            {[
              { l: "Total Schemes", v: total,                                          color: "#8B5CF6" },
              { l: "Visual",        v: schemes.filter(s => s.disabilityType === "visual").length,  color: "#3b82f6" },
              { l: "Speech",        v: schemes.filter(s => s.disabilityType === "speech").length,  color: "#10b981" },
            ].map((s, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "16px 20px", boxShadow: "0 2px 12px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{loading ? "—" : s.v}</div>
                <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <input
              placeholder="Search schemes…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ padding: "9px 14px", borderRadius: 10, border: "1.5px solid #e8e3ff", fontSize: 14, outline: "none", minWidth: 220 }}
            />
            <select
              value={disability}
              onChange={e => { setDisability(e.target.value); setPage(1); }}
              style={{ padding: "9px 14px", borderRadius: 10, border: "1.5px solid #e8e3ff", fontSize: 14, outline: "none" }}
            >
              <option value="">All Disabilities</option>
              {["visual","speech","cognitive","physical","hearing","other"].map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            <button
              onClick={() => { setSearch(""); setDisability(""); setPage(1); }}
              style={{ padding: "9px 16px", borderRadius: 10, border: "1.5px solid #e8e3ff", background: "#fff", color: "#8B5CF6", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              Clear
            </button>
          </div>

          {/* Table */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "#faf9ff" }}>
                    {["Title", "Disability", "Eligibility", "Last Date", "Link", "Actions"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 14px", color: "#8B5CF6", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? [1,2,3,4,5].map(i => <Skel key={i} />)
                    : schemes.length === 0
                      ? (
                        <tr>
                          <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#aaa" }}>
                            No schemes found.{" "}
                            <span
                              style={{ color: "#8B5CF6", cursor: "pointer", fontWeight: 700 }}
                              onClick={() => setShowModal(true)}
                            >
                              Add the first one →
                            </span>
                          </td>
                        </tr>
                      )
                      : schemes.map((s) => (
                        <tr
                          key={s._id}
                          style={{ borderBottom: "1px solid #f5f3ff" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#faf9ff"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <td style={{ padding: "13px 14px", fontWeight: 600, color: "#1a1a2e", maxWidth: 220 }}>
                            <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                            {s.description && (
                              <div style={{ fontSize: 11, color: "#aaa", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.description}</div>
                            )}
                          </td>
                          <td style={{ padding: "13px 14px" }}>
                            <span style={{ background: "#ede9fe", color: "#7c3aed", borderRadius: 6, padding: "3px 10px", fontWeight: 600, fontSize: 12 }}>{s.disabilityType}</span>
                          </td>
                          <td style={{ padding: "13px 14px", color: "#555", fontSize: 12 }}>
                            {(s.eligibility || []).slice(0, 2).join(", ") || "—"}
                          </td>
                          <td style={{ padding: "13px 14px", color: "#888", fontSize: 12 }}>
                            {s.lastDate ? new Date(s.lastDate).toLocaleDateString() : "—"}
                          </td>
                          <td style={{ padding: "13px 14px" }}>
                            {s.applyLink
                              ? <a href={s.applyLink} target="_blank" rel="noopener noreferrer" style={{ color: "#8B5CF6", fontSize: 12, fontWeight: 600 }}>Apply ↗</a>
                              : <span style={{ color: "#ccc", fontSize: 12 }}>—</span>
                            }
                          </td>
                          <td style={{ padding: "13px 14px" }}>
                            <button
                              onClick={() => handleDelete(s._id)}
                              style={{ background: "#fff0f0", border: "none", borderRadius: 7, width: 30, height: 30, cursor: "pointer", fontSize: 14, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                            >🗑</button>
                          </td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid #e8e3ff", background: "#fff", color: "#8B5CF6", fontWeight: 700, fontSize: 13, cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.5 : 1 }}>← Prev</button>
                <span style={{ padding: "6px 12px", fontSize: 13, color: "#888" }}>Page {page} of {pages}</span>
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                  style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid #e8e3ff", background: "#fff", color: "#8B5CF6", fontWeight: 700, fontSize: 13, cursor: page === pages ? "not-allowed" : "pointer", opacity: page === pages ? 0.5 : 1 }}>Next →</button>
              </div>
            )}

            <div style={{ padding: "12px 14px 0", color: "#888", fontSize: 13 }}>
              Showing {schemes.length} of {total} schemes
            </div>
          </div>
        </>
      )}

      {/* ── GAME STATS TAB ──────────────────────────────────── */}
      {tab === "Game Stats" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {loading
            ? [1,2].map(i => <div key={i} style={{ height: 180, background: "#f0ebff", borderRadius: 16 }} />)
            : gameStats
              ? [
                  { key: "tonguetwister", label: "Tongue Twister", icon: "🗣️", color: "#8B5CF6" },
                  { key: "math",          label: "Math Questions",  icon: "🧮", color: "#3b82f6" },
                ].map(g => {
                  const d = gameStats[g.key] || {};
                  return (
                    <div key={g.key} style={{ background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                        <div style={{ width: 52, height: 52, borderRadius: 14, background: `${g.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{g.icon}</div>
                        <div style={{ fontWeight: 800, color: "#1a1a2e", fontSize: 18 }}>{g.label}</div>
                      </div>
                      {[
                        { l: "Total Sessions", v: (d.total   || 0).toLocaleString() },
                        { l: "Avg Score",      v: d.avgScore ?? "—" },
                        { l: "Top Score",      v: d.maxScore ?? "—" },
                      ].map(s => (
                        <div key={s.l} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f5f3ff" }}>
                          <span style={{ color: "#888", fontSize: 14 }}>{s.l}</span>
                          <span style={{ fontWeight: 700, color: g.color, fontSize: 16 }}>{s.v}</span>
                        </div>
                      ))}
                    </div>
                  );
                })
              : <p style={{ color: "#aaa", fontSize: 14 }}>No game stats available. Users need to play games first.</p>
          }
        </div>
      )}
    </div>
  );
}