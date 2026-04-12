import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // Reuse your existing CSS
import adminImg from "../assets/learning.png"; // Your admin image
import { useAuth } from "../context/AuthContext";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const handleAdminLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post("http://localhost:5000/api/admin/auth/login", { email, password });

    if (res.data.success) {
      // 1. Grab the admin object specifically
      const adminData = res.data.admin; 

      // 2. Double check the role from your MongoDB
      if (adminData.role === 'super_admin' || adminData.role === 'admin') {
        
        // 3. Update your AuthContext with the admin data
        await login(res.data.token, adminData); 
        
        // 4. Force the navigation to the Admin Dashboard
        navigate("/admin/dashboard"); 
      } else {
        alert("Not authorized as Admin ❌");
      }
    }
  } catch (err) {
    alert("Login failed ❌");
  }
};

  return (
    <div className="login-container">
      {/* LEFT SIDE: Reusing your visual style */}
      <div className="login-left" style={{ background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)' }}>
        <div className="floating-bg">
          <i className="fa-solid fa-shield-halved icon-1" style={{ color: '#0d9488' }}></i>
          <i className="fa-solid fa-user-gear icon-2" style={{ color: '#0d9488' }}></i>
          <i className="fa-solid fa-chart-line icon-3" style={{ color: '#0d9488' }}></i>
          <i className="fa-solid fa-database icon-4" style={{ color: '#0d9488' }}></i>
        </div>

        <div className="login-content">
          <h1 className="hero-text" style={{ color: '#134e4a' }}>Admin <br /><span style={{ color: '#0d9488' }}>Control Center</span></h1>
          <p className="hero-subtext" style={{ color: '#115e59' }}>"Managing inclusive learning systems for ThiranNexus."</p>
          <img src={adminImg} alt="admin illustration" className="hero-illustration" />
          <div className="impact-badges" style={{ color: '#0d9488' }}>
            <span>Secure</span> • <span>Centralized</span> • <span>Impactful</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: The Login Card */}
      <div className="login-right">
        <form className="login-card" onSubmit={handleAdminLogin}>
          <div className="brand-icon" style={{ background: '#0d9488' }}>TN</div>
          <h2 className="login-title">Admin Portal</h2>
          <p className="login-subtitle" style={{ color: '#0d9488' }}>Management Dashboard Access</p>

          <div className="input-group">
            <input 
              type="email" 
              placeholder="Admin Email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            <input 
              type="password" 
              placeholder="Admin Password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" /> Keep me signed in
            </label>
          </div>

          <button type="submit" className="login-btn" style={{ background: '#0d9488' }}>
            ENTER DASHBOARD
          </button>

          {/* Registration link removed for Admin page security */}
          <p className="join-text">
            ThiranNexus Technical Team Access Only
          </p>
        </form>
      </div>
    </div>
  );
}