import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css";
import learningImg from "../assets/learning2.png"; // Your hero image

export default function Register() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    udid: "",
    linkedStudentUDID: "",
    state: "",
  });

  const handleRegister = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", formData);
      if (res.data.success) {
        alert("Account Created Successfully! 🚀");
        navigate("/login");
      }
    } catch (err) {
      alert(err.response?.data?.error || "Registration Error");
    }
  };

  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = async () => {
  if (!formData.udid) return alert("Please enter a UDID first");

  try {
    const res = await axios.get(`http://localhost:5000/api/auth/verify-udid/${formData.udid}`);
    
    if (res.data.valid) {
      alert(`Verified: ${res.data.disabilityDetails}`);
      setIsVerified(true);
      // Automatically update the formData with the type returned from backend
      setFormData(prev => ({ 
        ...prev, 
        disabilityType: res.data.disabilityType,
        disabilityDetails: res.data.disabilityDetails 
      }));
    }
  } catch (err) {
    setIsVerified(false);
    alert(err.response?.data?.error || "Verification failed");
  }
};

  return (
    <div className="reg-container">
      {/* LEFT SIDE: Floating Icons + Hero Image */}
      <div className="reg-left">
        <div className="floating-bg">
          <i className="fa-solid fa-book-open icon-1"></i>
          <i className="fa-solid fa-graduation-cap icon-2"></i>
          <i className="fa-solid fa-brain icon-3"></i>
          <i className="fa-solid fa-landmark icon-4"></i>
          <i className="fa-solid fa-lightbulb icon-5"></i>
        </div>

        <div className="reg-content">
          <h1 className="reg-hero-text">Join the <br /><span>Mission</span></h1>
          <p className="reg-hero-subtext">"Empowering lives through accessible technology."</p>
          
          {/* Mocked Hero Illustration */}
          <img src={learningImg} alt="learning" className="reg-hero-illustration" />
          
          <div className="reg-quote-box">
            <p className="reg-quote-text">Creating a world of limitless possibilities for every learner.</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: The Card */}
      <div className="reg-right">
        <div className="reg-card">
          <div className="brand-icon">TN</div>
          <h2 className="reg-title">{step === 1 ? "Get Started" : "Almost There"}</h2>
          <p className="reg-subtitle">{step === 1 ? "Create your account to begin." : "Tell us about your details."}</p>

          <div className="reg-form">
            {step === 1 ? (
              <>
                <input type="text" placeholder="Full Name" className="reg-input" 
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} />
                <input type="email" placeholder="Email Address" className="reg-input" 
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} />
                <input type="password" placeholder="Password" className="reg-input" 
                  onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))} />
                <select className="reg-input" value={formData.role} 
                  onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))}>
                  <option value="student">Student</option>
                  <option value="parent">Parent</option>
                </select>
                <button className="reg-btn" onClick={() => setStep(2)}>CONTINUE</button>
              </>
            ) : (
              <>
                {formData.role === "student" ? (
                  <div className="reg-udid-row">
                    <input type="text" placeholder="UDID (e.g. VIS101)" className="reg-input udid-field" 
                      onChange={(e) => setFormData((p) => ({ ...p, udid: e.target.value }))} />
                    <button 
                      type="button" 
                      className="reg-verify-btn" 
                      onClick={handleVerify}
                      style={{ backgroundColor: isVerified ? '#4CAF50' : '' }}
                    >
                      {isVerified ? "Verified ✅" : "Verify"}
                    </button>

                  </div>
                ) : (
                  <input type="text" placeholder="Enter Student UDID" className="reg-input" 
                    onChange={(e) => setFormData((p) => ({ ...p, linkedStudentUDID: e.target.value }))} />
                )}
                <select className="reg-input" onChange={(e) => setFormData((p) => ({ ...p, state: e.target.value }))}>
                  <option value="">Select your State</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Delhi">Delhi</option>
                </select>
                
                {/* FIXED: Balanced Button Row */}
                <div className="reg-action-row">
                  <button className="reg-secondary-btn" onClick={() => setStep(1)}>BACK</button>
                  <button className="reg-btn" onClick={handleRegister}>COMPLETE</button>
                </div>
              </>
            )}
          </div>
          
          <p className="reg-switch">
            Already have an account? <span onClick={() => navigate("/login")}>Login</span>
          </p>
        </div>
      </div>
    </div>
  );
}