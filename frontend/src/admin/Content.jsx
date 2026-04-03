// admin/Content.jsx
import { useState } from "react";

const INITIAL_CONTENT = [
  { id: 1, title: "She Sells Sea Shells", category: "Tongue Twisters", difficulty: "Easy", language: "English", status: "Active" },
  { id: 2, title: "Peter Piper", category: "Tongue Twisters", difficulty: "Medium", language: "English", status: "Active" },
  { id: 3, title: "Unique New York", category: "Tongue Twisters", difficulty: "Hard", language: "English", status: "Active" },
  { id: 4, title: "Red Lorry", category: "Tongue Twisters", difficulty: "Easy", language: "English", status: "Inactive" },
  { id: 5, title: "How Much Wood", category: "Tongue Twisters", difficulty: "Medium", language: "English", status: "Active" },
  { id: 6, title: "Addition Basics", category: "Math Questions", difficulty: "Easy", language: "Tamil", status: "Active" },
  { id: 7, title: "Fractions Level 2", category: "Math Questions", difficulty: "Medium", language: "English", status: "Active" },
  { id: 8, title: "Algebra Intro", category: "Math Questions", difficulty: "Hard", language: "English", status: "Inactive" },
];

const difficultyStyle = {
  Easy: { bg: "#dcfce7", color: "#166534" },
  Medium: { bg: "#fef3c7", color: "#92400e" },
  Hard: { bg: "#fee2e2", color: "#991b1b" },
};

const TABS = ["All", "Tongue Twisters", "Math Questions", "Categories"];

export default function Content() {
  const [tab, setTab] = useState("All");
  const [items, setItems] = useState(INITIAL_CONTENT);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", category: "Tongue Twisters", difficulty: "Easy", language: "English" });

  const filtered = tab === "All" ? items : items.filter(i => i.category === tab);

  const handleAdd = () => {
    if (!form.title.trim()) return;
    setItems(prev => [...prev, { id: Date.now(), ...form, status: "Active" }]);
    setForm({ title: "", category: "Tongue Twisters", difficulty: "Easy", language: "English" });
    setShowModal(false);
  };

  const handleDelete = (id) => setItems(prev => prev.filter(i => i.id !== id));

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1a1a2e", margin: 0 }}>Content Management</h1>
          <p style={{ color: "#8B5CF6", margin: "4px 0 0", fontSize: 14 }}>Create, edit and organize learning content.</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: "linear-gradient(135deg,#8B5CF6,#5c29e7)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(92,41,231,0.3)" }}>
          + Add Content
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "8px 18px", borderRadius: 10, border: "1.5px solid",
            borderColor: tab === t ? "#8B5CF6" : "#e8e3ff",
            background: tab === t ? "#8B5CF6" : "#fff",
            color: tab === t ? "#fff" : "#8B5CF6",
            fontWeight: 700, fontSize: 13, cursor: "pointer"
          }}>{t}</button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { l: "Total Content", v: items.length, color: "#8B5CF6" },
          { l: "Tongue Twisters", v: items.filter(i => i.category === "Tongue Twisters").length, color: "#3b82f6" },
          { l: "Math Questions", v: items.filter(i => i.category === "Math Questions").length, color: "#10b981" },
          { l: "Inactive", v: items.filter(i => i.status === "Inactive").length, color: "#ef4444" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "16px 20px", boxShadow: "0 2px 12px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.v}</div>
            <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(92,41,231,0.07)", border: "1.5px solid #f0ebff" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#faf9ff" }}>
              {["Title", "Category", "Difficulty", "Language", "Status", "Actions"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 14px", color: "#8B5CF6", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, i) => (
              <tr key={item.id} style={{ borderBottom: "1px solid #f5f3ff" }}
                onMouseEnter={e => e.currentTarget.style.background = "#faf9ff"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "13px 14px", fontWeight: 600, color: "#1a1a2e" }}>{item.title}</td>
                <td style={{ padding: "13px 14px" }}>
                  <span style={{ background: item.category === "Tongue Twisters" ? "#ede9fe" : "#dbeafe", color: item.category === "Tongue Twisters" ? "#7c3aed" : "#1d4ed8", borderRadius: 6, padding: "3px 10px", fontWeight: 600, fontSize: 12 }}>{item.category}</span>
                </td>
                <td style={{ padding: "13px 14px" }}>
                  <span style={{ ...difficultyStyle[item.difficulty], borderRadius: 6, padding: "3px 10px", fontWeight: 700, fontSize: 12 }}>{item.difficulty}</span>
                </td>
                <td style={{ padding: "13px 14px", color: "#555" }}>{item.language}</td>
                <td style={{ padding: "13px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.status === "Active" ? "#10b981" : "#ef4444" }} />
                    <span style={{ color: item.status === "Active" ? "#10b981" : "#ef4444", fontWeight: 600, fontSize: 13 }}>{item.status}</span>
                  </div>
                </td>
                <td style={{ padding: "13px 14px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["✏️", "🗑"].map((icon, j) => (
                      <button key={j} onClick={() => j === 1 && handleDelete(item.id)} style={{ background: j === 1 ? "#fff0f0" : "#f0ebff", border: "none", borderRadius: 7, width: 30, height: 30, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: "14px 14px 0", color: "#888", fontSize: 13 }}>Showing {filtered.length} items</div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 420, boxShadow: "0 20px 60px rgba(92,41,231,0.2)" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#1a1a2e", marginBottom: 20 }}>Add New Content</div>
            {[
              { label: "Title", key: "title", type: "text" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#555", display: "block", marginBottom: 6 }}>{f.label}</label>
                <input value={form[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e8e3ff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
            {[
              { label: "Category", key: "category", opts: ["Tongue Twisters", "Math Questions"] },
              { label: "Difficulty", key: "difficulty", opts: ["Easy", "Medium", "Hard"] },
              { label: "Language", key: "language", opts: ["English", "Tamil", "Hindi"] },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#555", display: "block", marginBottom: 6 }}>{f.label}</label>
                <select value={form[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e8e3ff", fontSize: 14, outline: "none" }}>
                  {f.opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1.5px solid #e8e3ff", background: "#fff", color: "#888", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Cancel</button>
              <button onClick={handleAdd} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#8B5CF6,#5c29e7)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Add Content</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}