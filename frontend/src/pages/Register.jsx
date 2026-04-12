// frontend/src/pages/Register.jsx  ← REPLACE ENTIRE FILE
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css";
import learningImg from "../assets/learning2.png";

export default function Register() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name:"", email:"", password:"", role:"student",
    udid:"", linkedStudentUDID:"", state:"",
    disabilityType:"", disabilityDetails:"",
  });
  const [udidVerified,  setUdidVerified]  = useState(false);
  const [udidMsg,       setUdidMsg]       = useState('');
  const [childVerified, setChildVerified] = useState(false);
  const [childPreview,  setChildPreview]  = useState(null);
  const [verifying,     setVerifying]     = useState(false);

  const set = (k,v) => setFormData(p=>({...p,[k]:v}));

  const verifyStudentUDID = async () => {
    if (!formData.udid.trim()) return alert("Enter your UDID first");
    try {
      const res = await axios.get(`http://localhost:5000/api/auth/verify-udid/${formData.udid.trim()}`);
      if (res.data.valid) {
        setUdidVerified(true);
        setUdidMsg(`✅ Verified: ${res.data.disabilityDetails}`);
        set('disabilityType', res.data.disabilityType);
        set('disabilityDetails', res.data.disabilityDetails);
      }
    } catch (err) {
      setUdidVerified(false);
      setUdidMsg(`❌ ${err.response?.data?.error || "Verification failed"}`);
    }
  };

  const verifyChildUDID = async () => {
    if (!formData.linkedStudentUDID.trim()) return alert("Enter your child's UDID first");
    setVerifying(true); setChildPreview(null); setChildVerified(false);
    try {
      const res = await axios.get(`http://localhost:5000/api/auth/verify-udid/${formData.linkedStudentUDID.trim()}?mode=parent`);
      if (res.data.valid) { setChildVerified(true); setChildPreview({ name: res.data.studentName, disabilityType: res.data.disabilityType }); }
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

    // ✅ ONLY for student
    if (formData.role === 'student') {
      payload.udid = formData.udid;
      payload.disabilityType = formData.disabilityType;
      payload.disabilityDetails = formData.disabilityDetails;
    }

    // ✅ ONLY for parent
    if (formData.role === 'parent') {
      payload.linkedStudentUDID = formData.linkedStudentUDID;
    }

    const res = await axios.post(
      "http://localhost:5000/api/auth/register",
      payload
    );

    if (res.data.success) {
      alert("Account created! 🚀 Please login.");
      navigate("/login");
    }
  } catch (err) {
    alert(err.response?.data?.error || "Registration failed");
  }
};

  const STATES = ["Tamil Nadu","Karnataka","Maharashtra","Delhi","Kerala","Andhra Pradesh","Telangana","Rajasthan","Gujarat","Uttar Pradesh","Other"];

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
          <img src={learningImg} alt="learning" className="reg-hero-illustration" />
          <div className="reg-quote-box">
            <p className="reg-quote-text">Creating a world of limitless possibilities for every learner.</p>
          </div>
        </div>
      </div>

      <div className="reg-right">
        <div className="reg-card">
          <div className="brand-icon">TN</div>
          <h2 className="reg-title">{step===1 ? "Get Started" : "Complete Profile"}</h2>
          <p className="reg-subtitle">{step===1 ? "Create your account." : formData.role==='parent' ? "Link your child's account." : "Verify your UDID."}</p>

          <div style={{display:'flex',gap:6,marginBottom:20}}>
            {[1,2].map(s=><div key={s} style={{flex:1,height:4,borderRadius:99,background:step>=s?'#7c3aed':'#e2e8f0',transition:'background .3s'}}/>)}
          </div>

          <div className="reg-form">
            {step===1 && (<>
              <input type="text"     placeholder="Full Name"    className="reg-input" value={formData.name}     onChange={e=>set('name',e.target.value)}/>
              <input type="email"    placeholder="Email Address" className="reg-input" value={formData.email}    onChange={e=>set('email',e.target.value)}/>
              <input type="password" placeholder="Password"     className="reg-input" value={formData.password} onChange={e=>set('password',e.target.value)}/>
              <select className="reg-input" value={formData.role} onChange={e=>{ set('role',e.target.value); setUdidVerified(false); setChildVerified(false); setChildPreview(null); setUdidMsg(''); }}>
                <option value="student">👤 Student</option>
                <option value="parent">👨‍👩‍👧 Parent / Caregiver</option>
              </select>
              {formData.role==='parent' && (
                <div style={{background:'#f5f3ff',border:'1.5px solid #ddd6fe',borderRadius:10,padding:'10px 14px',fontSize:13,color:'#6d28d9'}}>
                  ℹ️ You will link to your child's account using their UDID in the next step.
                </div>
              )}
              <button className="reg-btn" onClick={()=>{ if(!formData.name||!formData.email||!formData.password) return alert("Fill all fields"); if(formData.password.length<6) return alert("Password must be 6+ characters"); setStep(2); }}>CONTINUE →</button>
            </>)}

            {step===2 && formData.role==='student' && (<>
              <div style={{background:'#f5f3ff',borderRadius:10,padding:'10px 14px',fontSize:12,color:'#6d28d9',marginBottom:8}}>
                UDID format: VIS101 (visual), HEA202 (hearing), COG303 (cognitive), PHY404 (physical), SPE505 (speech)
              </div>
              <div className="reg-udid-row">
                <input type="text" placeholder="Your UDID (e.g. VIS101)" className="reg-input udid-field" value={formData.udid}
                  onChange={e=>{ set('udid',e.target.value.toUpperCase()); setUdidVerified(false); setUdidMsg(''); }}/>
                <button className="reg-verify-btn" onClick={verifyStudentUDID} style={{background:udidVerified?'#10b981':'#7c3aed'}}>
                  {udidVerified?"✅":"Verify"}
                </button>
              </div>
              {udidMsg && <p style={{fontSize:12,color:udidVerified?'#059669':'#dc2626',margin:'4px 0 8px'}}>{udidMsg}</p>}
              <select className="reg-input" value={formData.state} onChange={e=>set('state',e.target.value)}>
                <option value="">Select your State</option>
                {STATES.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
              <div className="reg-action-row">
                <button className="reg-secondary-btn" onClick={()=>setStep(1)}>← BACK</button>
                <button className="reg-btn" onClick={handleRegister} disabled={!udidVerified}>COMPLETE</button>
              </div>
            </>)}

            {step===2 && formData.role==='parent' && (<>
              <div style={{fontWeight:700,color:'#1a1a2e',fontSize:14,marginBottom:4}}>Enter your child's UDID</div>
              <div style={{fontSize:12,color:'#888',marginBottom:12}}>This is the UDID your child used when registering as a student.</div>
              <div className="reg-udid-row">
                <input type="text" placeholder="Child's UDID (e.g. VIS101)" className="reg-input udid-field" value={formData.linkedStudentUDID}
                  onChange={e=>{ set('linkedStudentUDID',e.target.value.toUpperCase()); setChildVerified(false); setChildPreview(null); }}/>
                <button className="reg-verify-btn" onClick={verifyChildUDID} disabled={verifying} style={{background:childVerified?'#10b981':'#7c3aed'}}>
                  {verifying?'…':childVerified?'✅':'Verify'}
                </button>
              </div>
              {childPreview && (
                <div style={{background:'#dcfce7',border:'1.5px solid #86efac',borderRadius:10,padding:'12px 14px',marginTop:8,fontSize:13}}>
                  <div style={{fontWeight:700,color:'#166534'}}>✅ Student found!</div>
                  <div style={{color:'#555',marginTop:4}}>Name: <strong>{childPreview.name}</strong></div>
                  <div style={{color:'#555'}}>Disability: <strong>{childPreview.disabilityType}</strong></div>
                </div>
              )}
              <select className="reg-input" value={formData.state} onChange={e=>set('state',e.target.value)} style={{marginTop:8}}>
                <option value="">Select your State</option>
                {STATES.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
              <div className="reg-action-row">
                <button className="reg-secondary-btn" onClick={()=>setStep(1)}>← BACK</button>
                <button className="reg-btn" onClick={handleRegister} disabled={!childVerified}>REGISTER</button>
              </div>
            </>)}
          </div>

          <p className="reg-switch">Already have an account? <span onClick={()=>navigate("/login")}>Login here</span></p>
        </div>
      </div>
    </div>
  );
}