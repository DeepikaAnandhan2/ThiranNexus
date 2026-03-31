import { useState } from "react";
import axios from "axios";
import "../styles/Login.css";

export default function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter email and password ⚠️");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        email,
        password,
      });

      alert("Login success ✅");
      console.log(res.data);

      onLoginSuccess();

    } catch (err) {
      alert(err.response?.data?.error || "Login failed ❌");
    }
  };

  return (
    <div className="login-container">

      {/* LEFT SIDE */}
      <div className="login-left">
        <div className="brand-box">
          <div className="logo-circle"></div>
          <h1 className="brand-title">Thiran Nexus</h1>
          <p className="brand-sub">
            Empowering abilities through smart assistance
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="login-right">
        <div className="login-card">
          <h2 className="login-title">Welcome Back</h2>

          <input
            type="text"
            placeholder="Email or Phone"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <p className="forgot-text">Forgot Password?</p>

          <button className="login-btn" onClick={handleLogin}>
            Login
          </button>

          <p className="otp-text">Or Login with OTP</p>

          <p className="register-text">
            New user?{" "}
            <span onClick={onSwitchToRegister}>Register</span>
          </p>
        </div>
      </div>
    </div>
  );
}