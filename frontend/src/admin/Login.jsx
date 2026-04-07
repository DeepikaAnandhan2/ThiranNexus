// admin/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

const handleLogin = async () => {
  const data = await adminAuth.login(email, password);
  localStorage.setItem("admin_token", data.token);
  localStorage.setItem("admin_user", JSON.stringify(data.admin));
  navigate("/admin");
};

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #ddd6fe 100%)",
      display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Nunito', sans-serif",
      position: "relative", overflow: "hidden"
    }}>
      {/* Background decoration */}
      <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "rgba(139,92,246,0.12)" }} />
      <div style={{ position: "absolute", bottom: -150, left: -100, width: 500, height: 500, borderRadius: "50%", background: "rgba(92,41,231,0.08)" }} />
      <div style={{ position: "absolute", top: "20%", left: "10%", width: 200, height: 200, borderRadius: "50%", background: "rgba(139,92,246,0.06)" }} />

      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 420, padding: "0 20px" }}>
        {/* Card */}
        <div style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(20px)", borderRadius: 24, padding: "44px 40px", boxShadow: "0 20px 60px rgba(92,41,231,0.15), 0 4px 20px rgba(0,0,0,0.08)", border: "1.5px solid rgba(255,255,255,0.7)" }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg,#8B5CF6,#5c29e7)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 28, boxShadow: "0 8px 24px rgba(92,41,231,0.3)" }}>✦</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#1a1a2e", letterSpacing: 0.5 }}>ThiranNexus</div>
            <div style={{ fontSize: 14, color: "#8B5CF6", marginTop: 4, fontWeight: 600 }}>Admin Dashboard</div>
          </div>

          <div style={{ fontSize: 20, fontWeight: 800, color: "#1a1a2e", marginBottom: 6 }}>Welcome back</div>
          <div style={{ fontSize: 14, color: "#888", marginBottom: 28 }}>Sign in to your admin account</div>

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: "#555", display: "block", marginBottom: 7 }}>Email Address</label>
            <div style={{ position: "relative" }}>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@thirannnexus.com"
                style={{ width: "100%", padding: "12px 16px 12px 42px", borderRadius: 12, border: "1.5px solid #e8e3ff", background: "#faf9ff", fontSize: 14, outline: "none", boxSizing: "border-box", color: "#333", transition: "border 0.2s" }}
                onFocus={e => e.target.style.borderColor = "#8B5CF6"}
                onBlur={e => e.target.style.borderColor = "#e8e3ff"}
              />
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#8B5CF6", fontSize: 16 }}>✉</span>
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: "#555", display: "block", marginBottom: 7 }}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: "100%", padding: "12px 42px 12px 42px", borderRadius: 12, border: "1.5px solid #e8e3ff", background: "#faf9ff", fontSize: 14, outline: "none", boxSizing: "border-box", color: "#333", transition: "border 0.2s" }}
                onFocus={e => e.target.style.borderColor = "#8B5CF6"}
                onBlur={e => e.target.style.borderColor = "#e8e3ff"}
              />
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#8B5CF6", fontSize: 16 }}>🔒</span>
              <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#8B5CF6", fontSize: 16 }}>{showPass ? "🙈" : "👁"}</button>
            </div>
          </div>

          {/* Forgot */}
          <div style={{ textAlign: "right", marginBottom: 24 }}>
            <span style={{ color: "#8B5CF6", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Forgot Password?</span>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            style={{
              width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
              background: loading ? "#c4b5fd" : "linear-gradient(135deg,#8B5CF6,#5c29e7)",
              color: "#fff", fontWeight: 800, fontSize: 16, cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 6px 20px rgba(92,41,231,0.3)", transition: "all 0.2s",
              fontFamily: "inherit"
            }}
          >
            {loading ? "Signing in..." : "Sign In →"}
          </button>

          <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "#bbb" }}>
            ThiranNexus Admin v2.4.1 · Secure Access
          </div>
        </div>
      </div>
    </div>
  );
}