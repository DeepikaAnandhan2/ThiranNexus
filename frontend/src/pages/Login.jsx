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
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");

  const emailRef    = useRef(null);
  const passwordRef = useRef(null);
  const submitRef   = useRef(null);

  const navigate = useNavigate();
  const { login } = useAuth();
  const { listeningField, isSupported, startListening, stopListening } = useSpeechRecognition();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) { alert("Please enter email and password ⚠️"); return; }
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      if (res.data.success) {
        await login(res.data.token, res.data.user);
        navigate(res.data.user?.role === 'parent' ? "/parent-dashboard" : "/dashboard");
      }
    } catch (err) {
      alert(err.response?.data?.error || "Login failed ❌");
    }
  };

  /**
   * Toggle logic — uses listeningField (React state) to know current state.
   * The 600ms cooldown in the hook prevents double-fire on same click.
   */
  const handleEmailMic = () => {
    if (listeningField === 'Email Address') stopListening(passwordRef);
    else startListening('Email Address', 'email', email, setEmail, passwordRef);
  };

  const handlePasswordMic = () => {
    if (listeningField === 'Password') stopListening(submitRef);
    else startListening('Password', 'password', password, setPassword, submitRef, handleLogin);
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
        <form className="login-card" onSubmit={handleLogin} aria-label="Login form">
          <div className="brand-icon" aria-hidden="true">TN</div>
          <h2 className="login-title">ThiranNexus</h2>
          <p className="login-subtitle">Login to your learning dashboard</p>

          {/* Unsupported browser warning */}
          {!isSupported && (
            <div role="alert" style={{ background:'#fef3c7', border:'1px solid #f59e0b', borderRadius:8, padding:'8px 12px', fontSize:13, color:'#92400e', marginBottom:12 }}>
              ⚠️ Voice input requires Chrome or Edge browser.
            </div>
          )}

          {/* Active listening banner */}
          {listeningField && (
            <div role="status" aria-live="polite" style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, padding:'8px 12px', fontSize:13, color:'#dc2626', marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
              <i className="fa-solid fa-microphone fa-beat-fade" aria-hidden="true" />
              Listening for <strong>{listeningField}</strong> — speak one letter at a time
            </div>
          )}

          <div className="input-group">
            {/* Email */}
            <div style={{ position:'relative', width:'100%' }}>
              <input
                type="email" ref={emailRef}
                placeholder="Email Address" aria-label="Email Address"
                autoComplete="email"
                className="login-input" value={email}
                onChange={e => setEmail(e.target.value)} required
                style={{ width:'100%', paddingRight:48, boxSizing:'border-box' }}
              />
              <VoiceMicButton
                isListening={listeningField === 'Email Address'}
                onClick={handleEmailMic}
                label="Voice input for email"
              />
            </div>
            <p style={{ fontSize:11, color:'#9ca3af', margin:'2px 0 10px' }}>
            </p>

            {/* Password */}
            <div style={{ position:'relative', width:'100%' }}>
              <input
                type="password" ref={passwordRef}
                placeholder="Password" aria-label="Password"
                autoComplete="current-password"
                className="login-input" value={password}
                onChange={e => setPassword(e.target.value)} required
                style={{ width:'100%', paddingRight:48, boxSizing:'border-box' }}
              />
              <VoiceMicButton
                isListening={listeningField === 'Password'}
                onClick={handlePasswordMic}
                label="Voice input for password"
              />
            </div>
            <p style={{ fontSize:11, color:'#9ca3af', margin:'2px 0 10px' }}>
             
            </p>
          </div>

          <div className="login-options">
            <label className="remember-me"><input type="checkbox" /> Remember me</label>
            <span className="forgot-link">Forgot Password?</span>
          </div>

          <button type="submit" ref={submitRef} className="login-btn">LOGIN</button>
          <p className="join-text">
            New to the mission?{' '}
            <span onClick={() => navigate("/register")} role="link" tabIndex={0} onKeyDown={e => e.key==='Enter' && navigate("/register")}>
              Join the cause
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}