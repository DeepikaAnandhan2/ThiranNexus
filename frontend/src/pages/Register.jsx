// frontend/src/pages/Register.jsx
import { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css";
import learningImg from "../assets/learning2.png";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import VoiceMicButton from "../components/VoiceMicButton";

export default function Register() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    udid: "",
    linkedStudentUDID: "",
    state: "",
    disabilityType: "",
    disabilityDetails: "",
  });

  const [udidVerified, setUdidVerified] = useState(false);
  const [udidMsg, setUdidMsg] = useState('');
  const [childVerified, setChildVerified] = useState(false);
  const [childPreview, setChildPreview] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const { listeningField, isSupported, startListening, stopListening } = useSpeechRecognition();

  // Refs
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const continueBtnRef = useRef(null);
  const udidRef = useRef(null);
  const verifyUdidBtnRef = useRef(null);
  const linkedStudentUdidRef = useRef(null);
  const verifyChildUdidBtnRef = useRef(null);
  const completeBtnRef = useRef(null);

  const set = (k, v) => setFormData(p => ({ ...p, [k]: v }));

  const getDisabilityLabel = (code) => {
    const prefix = code.substring(0, 3).toUpperCase();
    const map = { 'HEA': 'Hearing Impaired', 'VIS': 'Visually Impaired', 'COG': 'Cognitive Disability' };
    return map[prefix] || 'Other Disability';
  };

  const verifyStudentUDID = async () => {
    const cleanUdid = formData.udid.trim().toUpperCase();
    if (!cleanUdid) return alert("Enter your UDID first");
    setVerifying(true);
    try {
      const res = await axios.get(`https://thirannexus.onrender.com/api/auth/verify-udid/${cleanUdid}`);
      if (res.data.valid) {
        const typeLabel = res.data.disabilityType || getDisabilityLabel(cleanUdid);
        setUdidVerified(true);
        setUdidMsg(`✅ Verified: ${typeLabel}`);
        set('disabilityType', typeLabel);
        set('disabilityDetails', res.data.disabilityDetails || `Registered UDID: ${cleanUdid}`);
        setTimeout(() => { if (completeBtnRef.current) completeBtnRef.current.focus(); }, 1000);
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
      const res = await axios.get(`https://thirannexus.onrender.com/api/auth/verify-udid/${formData.linkedStudentUDID.trim()}?mode=parent`);
      if (res.data.valid) {
        setChildVerified(true);
        setChildPreview({ name: res.data.studentName, disabilityType: res.data.disabilityType });
        setTimeout(() => { if (completeBtnRef.current) completeBtnRef.current.focus(); }, 1000);
      }
    } catch (err) {
      alert(err.response?.data?.error || "No student found with that UDID");
    } finally {
      setVerifying(false);
    }
  };

  const handleRegister = async () => {
    if (formData.role === 'student' && !udidVerified) return alert("Please verify your UDID before registering.");
    if (formData.role === 'parent' && !childVerified) return alert("Please verify your child's UDID before registering.");
    try {
      const payload = {
        name: formData.name, email: formData.email, password: formData.password,
        role: formData.role, state: formData.state,
      };
      if (formData.role === 'student') {
        payload.udid = formData.udid;
        payload.disabilityType = formData.disabilityType;
        payload.disabilityDetails = formData.disabilityDetails;
      }
      if (formData.role === 'parent') {
        payload.linkedStudentUDID = formData.linkedStudentUDID;
      }
      const res = await axios.post("https://thirannexus.onrender.com/api/auth/register", payload);
      if (res.data.success) {
        alert("Account created! 🚀 Please login.");
        navigate("/login");
      }
    } catch (err) {
      alert(err.response?.data?.error || "Registration failed");
    }
  };

  const handleContinue = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      alert("Fill all fields ⚠️"); return;
    }
    if (formData.password.length < 6) { alert("Password must be 6+ characters ⚠️"); return; }
    if (formData.password !== formData.confirmPassword) { alert("Passwords do not match ⚠️"); return; }
    setStep(2);
  };

  /**
   * Toggle voice for a field.
   */
  const toggleVoice = (fieldLabel, fieldType, currentValue, setter, nextRef, onSubmit) => {
    if (listeningField === fieldLabel) {
      stopListening(nextRef);
    } else {
      startListening(fieldLabel, fieldType, currentValue, setter, nextRef, onSubmit);
    }
  };

  const VoiceHint = ({ text }) => (
    <span style={{ fontSize: 11, color: '#9ca3af', marginTop: -10, marginBottom: 4, display: 'block' }}>
      💡 {text}
    </span>
  );

  return (
    <div className="reg-container">
      {/* ── Left Panel ─────────────────────────────────────────────────────── */}
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

      {/* ── Right Panel ────────────────────────────────────────────────────── */}
      <div className="reg-right">
        <div className="reg-card">
          <div className="brand-icon" aria-label="Thirannexus Logo">TN</div>
          <h2 className="reg-title">{step === 1 ? "Get Started" : "Complete Profile"}</h2>
          <p className="reg-subtitle">
            {step === 1 ? "Create your account." : formData.role === 'parent' ? "Link your child's account." : "Verify your UDID."}
          </p>

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
            {[1, 2].map(s => (
              <div
                key={s}
                aria-label={`Step ${s}${step === s ? ', current' : step > s ? ', completed' : ''}`}
                style={{ flex: 1, height: 4, borderRadius: 99, background: step >= s ? '#7c3aed' : '#e2e8f0' }}
              />
            ))}
          </div>

          {/* Voice unsupported warning */}
          {!isSupported && (
            <div role="alert" style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#92400e', marginBottom: 12 }}>
              ⚠️ Voice input not supported. Please use Chrome or Edge.
            </div>
          )}

          {/* Voice active banner */}
          {listeningField && (
            <div role="status" aria-live="polite" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#dc2626', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fa-solid fa-microphone fa-beat-fade" aria-hidden="true" />
              Listening for <strong>{listeningField}</strong>… Speak letter by letter
            </div>
          )}

          <div className="reg-form">
            {/* ── STEP 1 ─────────────────────────────────────────────────── */}
            {step === 1 && (<>
              {/* Full Name */}
              <div style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '100%', marginBottom: '0.4rem' }}>
                <input
                  type="text" ref={nameRef} placeholder="Full Name" aria-label="Full Name"
                  className="reg-input" value={formData.name}
                  onChange={e => set('name', e.target.value)}
                  style={{ flex: 1, paddingRight: '48px', width: '100%', boxSizing: 'border-box', marginBottom: 0 }}
                />
                <VoiceMicButton
                  isListening={listeningField === 'Full Name'}
                  onClick={() => toggleVoice('Full Name', 'text', formData.name, v => set('name', v), emailRef)}
                  label="Voice input for full name"
                />
              </div>
              <VoiceHint />

              {/* Email */}
              <div style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '100%', marginBottom: '0.4rem' }}>
                <input
                  type="email" ref={emailRef} placeholder="Email Address" aria-label="Email Address"
                  autoComplete="email"
                  className="reg-input" value={formData.email}
                  onChange={e => set('email', e.target.value)}
                  style={{ flex: 1, paddingRight: '48px', width: '100%', boxSizing: 'border-box', marginBottom: 0 }}
                />
                <VoiceMicButton
                  isListening={listeningField === 'Email Address'}
                  onClick={() => toggleVoice('Email Address', 'email', formData.email, v => set('email', v), passwordRef)}
                  label="Voice input for email address"
                />
              </div>
              <VoiceHint  />

              {/* Password */}
              <div style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '100%', marginBottom: '0.4rem' }}>
                <input
                  type="password" ref={passwordRef} placeholder="Password" aria-label="Password"
                  autoComplete="new-password"
                  className="reg-input" value={formData.password}
                  onChange={e => set('password', e.target.value)}
                  style={{ flex: 1, paddingRight: '48px', width: '100%', boxSizing: 'border-box', marginBottom: 0 }}
                />
                <VoiceMicButton
                  isListening={listeningField === 'Password'}
                  onClick={() => toggleVoice('Password', 'password', formData.password, v => set('password', v), confirmPasswordRef)}
                  label="Voice input for password"
                />
              </div>
              <VoiceHint  />

              {/* Confirm Password */}
              <div style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '100%', marginBottom: '0.4rem' }}>
                <input
                  type="password" ref={confirmPasswordRef} placeholder="Confirm Password" aria-label="Confirm Password"
                  autoComplete="new-password"
                  className="reg-input" value={formData.confirmPassword}
                  onChange={e => set('confirmPassword', e.target.value)}
                  style={{ flex: 1, paddingRight: '48px', width: '100%', boxSizing: 'border-box', marginBottom: 0 }}
                />
                <VoiceMicButton
                  isListening={listeningField === 'Confirm Password'}
                  onClick={() => toggleVoice('Confirm Password', 'password', formData.confirmPassword, v => set('confirmPassword', v), continueBtnRef, handleContinue)}
                  label="Voice input for confirm password"
                />
              </div>
              <VoiceHint   />

              <select
                className="reg-input" aria-label="Select User Role"
                value={formData.role}
                onChange={e => {
                  set('role', e.target.value);
                  setUdidVerified(false); setChildVerified(false);
                  setChildPreview(null); setUdidMsg('');
                }}
              >
                <option value="student">👤 Student</option>
                <option value="parent">👨‍👩‍👧 Parent / Caregiver</option>
              </select>

              {formData.role === 'student' && (
                <p style={{ color: '#7c3aed', cursor: 'pointer', fontSize: 13, marginTop: -5 }}
                  onClick={() => navigate('/udid-help')} aria-label="Don't have an UDID? Click for help">
                  ❓ Don't have an UDID?
                </p>
              )}

              <button ref={continueBtnRef} className="reg-btn" aria-label="Continue to next step" onClick={handleContinue}>
                CONTINUE →
              </button>
            </>)}

            {/* ── STEP 2: Student UDID ────────────────────────────────────── */}
            {step === 2 && formData.role === 'student' && (<>
              <div style={{ background: '#f5f3ff', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#6d28d9', marginBottom: 10 }}>
                UDID format: VIS101, HEA202, etc. Say the letters one by one.
              </div>

              <div className="reg-udid-row">
                <div style={{ display: 'flex', alignItems: 'center', position: 'relative', flex: 1 }}>
                  <input
                    type="text" ref={udidRef} placeholder="Enter UDID"
                    aria-label="Enter your UDID number"
                    className="reg-input udid-field" value={formData.udid}
                    onChange={e => { set('udid', e.target.value.toUpperCase()); setUdidVerified(false); setUdidMsg(''); }}
                    style={{ paddingRight: '48px', width: '100%', boxSizing: 'border-box', marginBottom: 0 }}
                  />
                  <VoiceMicButton
                    isListening={listeningField === 'UDID'}
                    onClick={() => toggleVoice('UDID', 'udid', formData.udid, v => set('udid', v.toUpperCase()), verifyUdidBtnRef, verifyStudentUDID)}
                    label="Voice input for UDID"
                  />
                </div>
                <button ref={verifyUdidBtnRef} className="reg-verify-btn" aria-label="Verify UDID button"
                  onClick={verifyStudentUDID} disabled={verifying}>
                  {verifying ? "..." : "Verify"}
                </button>
              </div>

              {udidMsg && (
                <div aria-label={udidMsg} style={{ marginTop: 10, padding: '10px', borderRadius: '8px', fontSize: '13px', backgroundColor: udidVerified ? '#ecfdf5' : '#fef2f2', color: udidVerified ? '#059669' : '#dc2626', border: `1px solid ${udidVerified ? '#10b981' : '#f87171'}` }}>
                  {udidMsg}
                </div>
              )}

              <div className="reg-action-row" style={{ marginTop: 20 }}>
                <button className="reg-secondary-btn" aria-label="Go back" onClick={() => setStep(1)}>← BACK</button>
                <button ref={completeBtnRef} className="reg-btn" aria-label="Complete Registration" onClick={handleRegister} disabled={!udidVerified}>COMPLETE</button>
              </div>
            </>)}

            {/* ── STEP 2: Parent UDID ─────────────────────────────────────── */}
            {step === 2 && formData.role === 'parent' && (<>
              <div className="reg-udid-row">
                <div style={{ display: 'flex', alignItems: 'center', position: 'relative', flex: 1 }}>
                  <input
                    type="text" ref={linkedStudentUdidRef} placeholder="Child's UDID"
                    aria-label="Enter your child's UDID number"
                    className="reg-input udid-field" value={formData.linkedStudentUDID}
                    onChange={e => { set('linkedStudentUDID', e.target.value.toUpperCase()); setChildVerified(false); }}
                    style={{ paddingRight: '48px', width: '100%', boxSizing: 'border-box', marginBottom: 0 }}
                  />
                  <VoiceMicButton
                    isListening={listeningField === "Child's UDID"}
                    onClick={() => toggleVoice("Child's UDID", 'udid', formData.linkedStudentUDID, v => set('linkedStudentUDID', v.toUpperCase()), verifyChildUdidBtnRef, verifyChildUDID)}
                    label="Voice input for child's UDID"
                  />
                </div>
                <button ref={verifyChildUdidBtnRef} className="reg-verify-btn" aria-label="Verify child's UDID"
                  onClick={verifyChildUDID} disabled={verifying}>
                  {verifying ? "..." : "Verify"}
                </button>
              </div>

              {childVerified && childPreview && (
                <div aria-label={`Student found: ${childPreview.name}`} style={{ marginTop: 10, padding: 10, background: '#f0fdf4', borderRadius: 8, fontSize: 13, border: '1px solid #16a34a' }}>
                  ✅ Found Student: <strong>{childPreview.name}</strong> ({childPreview.disabilityType})
                </div>
              )}

              <div className="reg-action-row" style={{ marginTop: 20 }}>
                <button className="reg-secondary-btn" aria-label="Go back" onClick={() => setStep(1)}>← BACK</button>
                <button ref={completeBtnRef} className="reg-btn" aria-label="Complete Registration" onClick={handleRegister} disabled={!childVerified}>COMPLETE</button>
              </div>
            </>)}
          </div>

          <p className="reg-switch">
            Already have an account?{' '}
            <span aria-label="Navigate to Login" role="link" tabIndex={0}
              onClick={() => navigate("/login")}
              onKeyDown={e => e.key === 'Enter' && navigate("/login")}>
              Login here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}