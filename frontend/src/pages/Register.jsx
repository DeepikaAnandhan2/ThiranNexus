import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css";

export default function Register() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", udid: "", 
    state: "", educationLevel: "school", 
    disabilityType: "none", disabilityDetails: ""
  });

  const handleVerifyUDID = async () => {
    if (formData.udid.length < 3) return alert("Enter valid UDID");
    try {
      const res = await axios.get(`http://localhost:5000/api/auth/verify-udid/${formData.udid}`);
      setFormData(prev => ({ 
        ...prev, 
        disabilityType: res.data.disabilityType, 
        disabilityDetails: res.data.disabilityDetails 
      }));
      alert(`Verified: ${res.data.disabilityDetails} ✅`);
    } catch (err) {
      alert("UDID Verification Failed");
    }
  };

  const handleRegister = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", formData);
      if(res.data.success) {
        alert("Account Created Successfully! 🚀");
        navigate("/");
      }
    } catch (err) {
      alert(err.response?.data?.error || "Registration Error");
    }
  };

  return (
    <div className="reg-container">
      <div className="reg-left">
        <div className="reg-brand">
          <div className="reg-logo">✨</div>
          <h1 className="reg-brand-title">Thiran Nexus</h1>
          <div className="reg-quote-box">
            <p className="reg-quote-text">
              "A space where everyone can learn. Creating a world of limitless possibilities."
            </p>
          </div>
        </div>
      </div>

      <div className="reg-right">
        <div className="reg-card">
          <h2 className="reg-title">{step === 1 ? "Get Started" : "Almost There"}</h2>
          <p className="reg-subtitle">{step === 1 ? "Create your account to begin." : "Tell us about your accessibility needs."}</p>

          {step === 1 ? (
            <div className="reg-form">
              <input type="text" placeholder="Full Name" className="reg-input" 
                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} />
              <input type="email" placeholder="Email Address" className="reg-input" 
                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} />
              <input type="password" placeholder="Password" className="reg-input" 
                onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))} />
              <button className="reg-btn" onClick={() => setStep(2)}>Continue</button>
            </div>
          ) : (
            <div className="reg-form">
              <div className="reg-udid-input-row">
                <input type="text" placeholder="UDID (e.g. VIS101)" className="reg-input" 
                  onChange={(e) => setFormData(p => ({ ...p, udid: e.target.value }))} />
                <button type="button" className="reg-verify-btn" onClick={handleVerifyUDID}>Verify</button>
              </div>

              <select className="reg-input" onChange={(e) => setFormData(p => ({ ...p, state: e.target.value }))}>
                <option value="">Select your State</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Delhi">Delhi</option>
              </select>

              <div className="reg-nav-btns">
                <button className="reg-back-btn" onClick={() => setStep(1)}>Back</button>
                <button className="reg-btn" onClick={handleRegister}>Complete</button>
              </div>
            </div>
          )}
          
          <p className="reg-switch" style={{textAlign: 'center', marginTop: '20px'}}>
            Already have an account? <span onClick={() => navigate("/")}>Login</span>
          </p>
        </div>
      </div>
    </div>
  );
}