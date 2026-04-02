import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { schemesList } from "./Schemes"; // Import the data from the list above
import "../styles/schemes.css";

const SchemeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scheme, setScheme] = useState(null);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    // Convert the string ID from the URL to a Number for comparison
    const foundScheme = schemesList.find((s) => s.id === Number(id));
    setScheme(foundScheme);
  }, [id]);

  if (!scheme) {
    return (
      <div className="page-container">
        <div className="card text-center">
          <h2 style={{color: '#4a148c'}}>Scheme Not Found</h2>
          <p>The scheme ID you are looking for does not exist.</p>
          <button onClick={() => navigate("/schemes")} className="btn btn-view" style={{width: 'auto', display: 'inline-block'}}>
            Return to Schemes
          </button>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    const saved = JSON.parse(localStorage.getItem("savedSchemes") || "[]");
    if (!saved.find(s => s.id === scheme.id)) {
      // Standardize the object to ensure SavedApplied.jsx can read it
      saved.push({
        id: scheme.id,
        name: scheme.title, 
        description: scheme.description
      });
      localStorage.setItem("savedSchemes", JSON.stringify(saved));
      setSavedMessage("✅ Scheme saved to your profile!");
    } else {
      setSavedMessage("ℹ️ Scheme is already saved.");
    }
    setTimeout(() => setSavedMessage(""), 3000);
  };

  const handleApply = () => {
    window.open(scheme.link, "_blank");
  };

  return (
    <div className="page-container">
      <div className="card detail-card">
        <h1 className="detail-title">{scheme.title}</h1>
        
        {savedMessage && <p className="status-msg">{savedMessage}</p>}

        <p className="detail-description">{scheme.description}</p>

        <div className="section-title">Eligibility Criteria</div>
        <ul className="detail-list">
          {scheme.eligibility.map((item, idx) => <li key={idx}>{item}</li>)}
        </ul>

        <div className="section-title">Key Benefits</div>
        <ul className="detail-list">
          {scheme.benefits.map((item, idx) => <li key={idx}>{item}</li>)}
        </ul>

        <div className="button-group">
          <button onClick={() => navigate(-1)} className="btn btn-save" style={{background: '#eee', color: '#333', border: '1px solid #ccc'}}>
            Back
          </button>
          <button onClick={handleSave} className="btn btn-save">
            Save Scheme
          </button>
          <button onClick={handleApply} className="btn btn-apply">
            Apply Externally
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchemeDetails;