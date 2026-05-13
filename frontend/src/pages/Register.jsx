Register.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css";
import learningImg from "../assets/learning2.png";

export default function Register() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", role: "student",
    udid: "", linkedStudentUDID: "", state: "",
    disabilityType: "", disabilityDetails: "",
  });
  const [udidVerified, setUdidVerified] = useState(false);
  const [udidMsg, setUdidMsg] = useState('');
  const [childVerified, setChildVerified] = useState(false);
  const [childPreview, setChildPreview] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const set = (k, v) => setFormData(p => ({ ...p, [k]: v }));

  const getDisabilityLabel = (code) => {
    const prefix = code.substring(0, 3).toUpperCase();
    const map = {
      'HEA': 'Hearing Impaired',
      'VIS': 'Visually Impaired',
      'COG': 'Cognitive Disability'
    };
    return map[prefix] || 'Other Disability';
  };

  const verifyStudentUDID = async () => {
    const cleanUdid = formData.udid.trim().toUpperCase();
    if (!cleanUdid) return alert("Enter your UDID first");
    
    setVerifying(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/auth/verify-udid/${cleanUdid}`);
      if (res.data.valid) {
        const typeLabel = res.data.disabilityType || getDisabilityLabel(cleanUdid);
        setUdidVerified(true);
        setUdidMsg(`✅ Verified: ${typeLabel}`);
        set('disabilityType', typeLabel);
        set('disabilityDetails', res.data.disabilityDetails || `Registered UDID: ${cleanUdid}`);
      } else {
        setUdidVerified(false);
        setUdidMsg("❌ Invalid UDID format or not found.");
      }
    } catch (err) {
      setUdidVerified(false);
      setUdidMsg(`❌ ${err.response?.data?.error || "Verification failed"}`);
    } finally {
      setVerifying(false);
    }
  };

  const verifyChildUDID = async () => {
    if (!formData.linkedStudentUDID.trim()) return alert("Enter your child's UDID first");
    setVerifying(true); setChildPreview(null); setChildVerified(false);
    try {
      const res = await axios.get(`http://localhost:5000/api/auth/verify-udid/${formData.linkedStudentUDID.trim()}?mode=parent`);
      if (res.data.valid) { 
        setChildVerified(true); 
        setChildPreview({ name: res.data.studentName, disabilityType: res.data.disabilityType }); 
      }
    } catch (err) {
      alert(err.response?.data?.error || "No student found with that UDID");
    } finally { setVerifying(false); }
  };

  const handleRegister = async () => {
    if (formData.role === 'student' && !udidVerified)
      return alert("Please verify your UDID before registering.");

    if (formData.role === 'parent' && !childVerified)
      return alert("Please verify your child's UDID before registering.");

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        state: formData.state,
      };

      if (formData.role === 'student') {
        payload.udid = formData.udid;
        payload.disabilityType = formData.disabilityType;
        payload.disabilityDetails = formData.disabilityDetails;
      }

      if (formData.role === 'parent') {
        payload.linkedStudentUDID = formData.linkedStudentUDID;
      }

      const res = await axios.post("http://localhost:5000/api/auth/register", payload);

      if (res.data.success) {
        alert("Account created! 🚀 Please login.");
        navigate("/login");
      }
    } catch (err) {
      alert(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="reg-container">
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
          <img src={learningImg} alt="learning illustration" className="reg-hero-illustration" />
          <div className="reg-quote-box">
            <p className="reg-quote-text">Creating a world of limitless possibilities for every learner.</p>
          </div>
        </div>
      </div>

      <div className="reg-right">
        <div className="reg-card">
          <div className="brand-icon" aria-label="Thirannexus Logo">TN</div>
          <h2 className="reg-title">{step === 1 ? "Get Started" : "Complete Profile"}</h2>
          <p className="reg-subtitle">{step === 1 ? "Create your account." : formData.role === 'parent' ? "Link your child's account." : "Verify your UDID."}</p>

          <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
            {[1, 2].map(s => <div key={s} aria-label={`Step ${s}`} style={{ flex: 1, height: 4, borderRadius: 99, background: step >= s ? '#7c3aed' : '#e2e8f0' }} />)}
          </div>

          <div className="reg-form">
            {step === 1 && (<>
              <input 
                type="text" 
                placeholder="Full Name" 
                aria-label="Full Name"
                className="reg-input" 
                value={formData.name} 
                onChange={e => set('name', e.target.value)} 
              />
              <input 
                type="email" 
                placeholder="Email Address" 
                aria-label="Email Address"
                className="reg-input" 
                value={formData.email} 
                onChange={e => set('email', e.target.value)} 
              />
              <input 
                type="password" 
                placeholder="Password" 
                aria-label="Password"
                className="reg-input" 
                value={formData.password} 
                onChange={e => set('password', e.target.value)} 
              />

              <select 
                className="reg-input" 
                aria-label="Select User Role"
                value={formData.role} 
                onChange={e => {
                  set('role', e.target.value);
                  setUdidVerified(false);
                  setChildVerified(false);
                  setChildPreview(null);
                  setUdidMsg('');
                }}
              >
                <option value="student">👤 Student</option>
                <option value="parent">👨‍👩‍👧 Parent / Caregiver</option>
              </select>

              {formData.role === 'student' && (
                <p 
                  style={{ color: '#7c3aed', cursor: 'pointer', fontSize: 13, marginTop: -5 }} 
                  onClick={() => navigate('/udid-help')}
                  aria-label="Don't have an UDID? Click for help"
                >
                  ❓ Don't have an UDID?
                </p>
              )}

              <button 
                className="reg-btn" 
                aria-label="Continue to next step"
                onClick={() => {
                  if (!formData.name || !formData.email || !formData.password) return alert("Fill all fields");
                  if (formData.password.length < 6) return alert("Password must be 6+ characters");
                  setStep(2);
                }}
              >
                CONTINUE →
              </button>
            </>)}

            {step === 2 && formData.role === 'student' && (<>
              <div style={{ background: '#f5f3ff', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#6d28d9', marginBottom: 10 }}>
                UDID format: VIS101, HEA202, etc.
              </div>

              <div className="reg-udid-row">
                <input 
                  type="text" 
                  placeholder="Enter UDID"
                  aria-label="Enter your UDID number"
                  className="reg-input udid-field" 
                  value={formData.udid}
                  onChange={e => { set('udid', e.target.value.toUpperCase()); setUdidVerified(false); setUdidMsg(''); }} 
                />
                <button 
                  className="reg-verify-btn" 
                  aria-label="Verify UDID button"
                  onClick={verifyStudentUDID} 
                  disabled={verifying}
                >
                  {verifying ? "..." : "Verify"}
                </button>
              </div>

              {udidMsg && (
                <div 
                  aria-label={udidMsg}
                  style={{ 
                    marginTop: 10, padding: '10px', borderRadius: '8px', fontSize: '13px',
                    backgroundColor: udidVerified ? '#ecfdf5' : '#fef2f2',
                    color: udidVerified ? '#059669' : '#dc2626',
                    border: `1px solid ${udidVerified ? '#10b981' : '#f87171'}`
                  }}
                >
                  {udidMsg}
                </div>
              )}

              <div className="reg-action-row" style={{ marginTop: 20 }}>
                <button className="reg-secondary-btn" aria-label="Go back" onClick={() => setStep(1)}>← BACK</button>
                <button className="reg-btn" aria-label="Complete Registration" onClick={handleRegister} disabled={!udidVerified}>COMPLETE</button>
              </div>
            </>)}

            {step === 2 && formData.role === 'parent' && (<>
               <div className="reg-udid-row">
                <input 
                  type="text" 
                  placeholder="Child's UDID"
                  aria-label="Enter your child's UDID number"
                  className="reg-input udid-field" 
                  value={formData.linkedStudentUDID}
                  onChange={e => { set('linkedStudentUDID', e.target.value.toUpperCase()); setChildVerified(false); }} 
                />
                <button className="reg-verify-btn" aria-label="Verify child's UDID" onClick={verifyChildUDID} disabled={verifying}>
                  {verifying ? "..." : "Verify"}
                </button>
              </div>
              
              {childVerified && childPreview && (
                <div 
                  aria-label={`Student found: ${childPreview.name}`}
                  style={{ marginTop: 10, padding: 10, background: '#f0fdf4', borderRadius: 8, fontSize: 13, border: '1px solid #16a34a' }}
                >
                  ✅ Found Student: <strong>{childPreview.name}</strong> ({childPreview.disabilityType})
                </div>
              )}

              <div className="reg-action-row" style={{ marginTop: 20 }}>
                <button className="reg-secondary-btn" aria-label="Go back" onClick={() => setStep(1)}>← BACK</button>
                <button className="reg-btn" aria-label="Complete Registration" onClick={handleRegister} disabled={!childVerified}>COMPLETE</button>
              </div>
            </>)}
          </div>

          <p className="reg-switch">Already have an account? <span aria-label="Navigate to Login" onClick={() => navigate("/login")}>Login here</span></p>
        </div>
      </div>
    </div>
  );
}