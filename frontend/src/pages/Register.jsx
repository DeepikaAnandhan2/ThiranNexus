import { useState } from "react";
import axios from "axios";
import "../styles/Register.css";
import userImg from "../assets/user.png";
import caregiverImg from "../assets/parent.png";

export default function Register({ onSwitchToLogin }) {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill all fields ⚠️");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match ❌");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/register", {
        name,
        email,
        password,
        role
      });

      console.log(res.data);

      alert("Registered successfully ✅");

      onSwitchToLogin();

    } catch (err) {
      alert(err.response?.data?.error || "Error ❌");
    }
  };

  return (
    <div className="register-container">

      {/* LEFT SIDE */}
      <div className="register-left">
        <div className="brand-box">
          <div className="logo-circle"></div>
          <h1 className="brand-title">Thiran Nexus</h1>
          <p className="brand-sub">Empowering Accessibility Through AI</p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="register-right">
        <form className="register-card" onSubmit={handleRegister}>
          <h2 className="register-title">Create Account</h2>

          <input
            type="text"
            placeholder="Full Name"
            className="register-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Email or Phone"
            className="register-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="register-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="register-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {/* ROLE SELECTION */}
          <div className="role-select">
            <p>Select Role:</p>

            <div className="role-options">

              <div
                className={role === "user" ? "role-card active" : "role-card"}
                onClick={() => setRole("user")}
              >
                <img src={userImg} alt="User" className="role-img" />
                <p>User</p>
              </div>

              <div
                className={role === "parent" ? "role-card active" : "role-card"}
                onClick={() => setRole("parent")}
              >
                <img src={caregiverImg} alt="Caregiver" className="role-img" />
                <p>Caregiver</p>
              </div>

            </div>
          </div>

          <button className="register-btn">Register</button>

          <p className="login-text">
            Already have an account?{" "}
            <span onClick={onSwitchToLogin}>Login</span>
          </p>
        </form>
      </div>
    </div>
  );
}