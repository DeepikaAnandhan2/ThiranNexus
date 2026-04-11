import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import learningImg from "../assets/learning.png";
import { useAuth } from "../context/AuthContext";

// ... existing imports

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  
  // 1. Pull the login function from your context
  const { login } = useAuth(); 

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password ⚠️");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      
      if (res.data.success) {
        // 2. CRITICAL CHANGE: Use the context login function!
        // This updates the 'user' state so ProtectedRoute allows you in.
        // Usually, you pass the token and the user object returned by your API.
        login(res.data.user, res.data.token); 
        
        console.log("Login Successful!");
        navigate("/dashboard"); 
      }
    } catch (err) {
      console.error("Login Error:", err.response?.data);
      alert(err.response?.data?.error || "Login failed ❌");
    }
  };

  // ... rest of your return code remains the same

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="floating-bg">
          <i className="fa-solid fa-book-open icon-1"></i>
          <i className="fa-solid fa-graduation-cap icon-2"></i>
          <i className="fa-solid fa-brain icon-3"></i>
          <i className="fa-solid fa-landmark icon-4"></i>
          <i className="fa-solid fa-lightbulb icon-5"></i>
        </div>

        <div className="login-content">
          <h1 className="hero-text">Empowering <br /><span>Every Ability</span></h1>
          <p className="hero-subtext">"Unlocking potential through inclusive smart learning."</p>
          <img src={learningImg} alt="learning illustration" className="hero-illustration" />
          <div className="impact-badges">
            <span>Inclusive</span> • <span>Intelligent</span> • <span>Impactful</span>
          </div>
        </div>
      </div>

      <div className="login-right">
        {/* Wrap in a form to handle "Enter" key support and prevent refresh */}
        <form className="login-card" onSubmit={handleLogin}>
          <div className="brand-icon">TN</div>
          <h2 className="login-title">ThiranNexus</h2>
          <p className="login-subtitle">Login to your learning dashboard</p>

          <div className="input-group">
            <input 
              type="email" 
              placeholder="Email Address"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            <input 
              type="password" 
              placeholder="Password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" /> Remember me
            </label>
            <span className="forgot-link">Forgot Password?</span>
          </div>

          {/* Type="submit" ensures handleLogin triggers correctly */}
          <button type="submit" className="login-btn">LOGIN</button>

          <p className="join-text">
            New to the mission? <span onClick={() => navigate("/register")}>Join the cause</span>
          </p>
        </form>
      </div>
    </div>
  );
}