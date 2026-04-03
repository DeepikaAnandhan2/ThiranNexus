import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter email and password ⚠️");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        // Changed from /dashboard to /home to match App.jsx routes
        navigate("/dashboard");
      }
    } catch (err) {
      alert(err.response?.data?.error || "Login failed ❌");
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo">✨</div>
          <h1 className="login-brand-title">Thiran Nexus</h1>
          <div className="login-quote-box">
            <p className="login-quote-text">"A space where everyone can learn. Creating a world of limitless possibilities."</p>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Please enter your details to sign in.</p>

          <input type="email" placeholder="Email Address" className="login-input" 
            value={email} onChange={(e) => setEmail(e.target.value)} />
          
          <input type="password" placeholder="Password" className="login-input" 
            value={password} onChange={(e) => setPassword(e.target.value)} />

          <div className="login-extra">
            <label><input type="checkbox" /> Remember me</label>
            <span className="login-forgot">Forgot Password?</span>
          </div>

          <button className="login-btn" onClick={handleLogin}>Sign In</button>

          <div className="login-footer">
            <p>New user? <span onClick={() => navigate("/register")}>Register</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}