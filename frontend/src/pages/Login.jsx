// frontend/src/pages/Login.jsx
import { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import learningImg from "../assets/learning.png";
import { useAuth } from "../context/AuthContext";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import VoiceMicButton from "../components/VoiceMicButton";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const submitRef = useRef(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const { listeningField, startListening, stopListening } = useSpeechRecognition();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) { alert("Please enter email and password ⚠️"); return; }
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      if (res.data.success) {
        await login(res.data.token, res.data.user);
        // Role-based redirect
        if (res.data.user?.role === 'parent') {
          navigate("/parent-dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      alert(err.response?.data?.error || "Login failed ❌");
    }
  };

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
          <div className="impact-badges"><span>Inclusive</span> • <span>Intelligent</span> • <span>Impactful</span></div>
        </div>
      </div>
      <div className="login-right">
        <form className="login-card" onSubmit={handleLogin}>
          <div className="brand-icon">TN</div>
          <h2 className="login-title">ThiranNexus</h2>
          <p className="login-subtitle">Login to your learning dashboard</p>
          <div className="input-group">
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '100%' }}>
              <input 
                type="email" 
                ref={emailRef} 
                placeholder="Email Address" 
                className="login-input" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                style={{ flex: 1, paddingRight: '45px', width: '100%', boxSizing: 'border-box' }} 
              />
              <VoiceMicButton 
                isListening={listeningField === 'email'}
                onClick={() => listeningField === 'email' ? stopListening(passwordRef) : startListening('email', 'email', email, setEmail, passwordRef)}
                label="Voice input for email"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '100%' }}>
              <input 
                type="password" 
                ref={passwordRef} 
                placeholder="Password" 
                className="login-input" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                style={{ flex: 1, paddingRight: '45px', width: '100%', boxSizing: 'border-box' }} 
              />
              <VoiceMicButton 
                isListening={listeningField === 'password'}
                onClick={() => listeningField === 'password' ? stopListening(submitRef) : startListening('password', 'password', password, setPassword, submitRef, handleLogin)}
                label="Voice input for password"
              />
            </div>
          </div>
          <div className="login-options">
            <label className="remember-me"><input type="checkbox" /> Remember me</label>
            <span className="forgot-link">Forgot Password?</span>
          </div>
          <button type="submit" ref={submitRef} className="login-btn">LOGIN</button>
          <p className="join-text">New to the mission? <span onClick={() => navigate("/register")}>Join the cause</span></p>
        </form>
      </div>
    </div>
  );
}