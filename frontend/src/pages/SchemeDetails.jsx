import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/schemes.css";

const SchemeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    const fetchScheme = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`/api/schemes/${id}`, { headers });
        setScheme(res.data);
      } catch (err) {
        console.error('Failed to fetch scheme:', err);
        setScheme(null);
      } finally {
        setLoading(false);
      }
    };

    fetchScheme();
  }, [id]);

  const handleSave = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user._id;
      
      if (!userId) {
        setSavedMessage("Please login to save schemes");
        setTimeout(() => setSavedMessage(""), 3000);
        return;
      }

      const token = localStorage.getItem('token');
      await axios.post('/api/schemes/save', 
        { userId, schemeId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSavedMessage("✅ Scheme saved to your profile!");
    } catch (err) {
      console.error('Save failed:', err);
      setSavedMessage("ℹ️ Scheme is already saved.");
    }
    setTimeout(() => setSavedMessage(""), 3000);
  };

  const handleApply = () => {
    if (scheme?.applyLink) {
      window.open(scheme.applyLink, "_blank");
    } else if (scheme?.link) {
      window.open(scheme.link, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="card text-center">
          <p>Loading scheme details...</p>
        </div>
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="page-container">
        <div className="card text-center">
          <h2 style={{color: '#4a148c'}}>Scheme Not Found</h2>
          <p>The scheme you are looking for does not exist.</p>
          <button onClick={() => navigate("/schemes")} className="btn btn-view" style={{width: 'auto', display: 'inline-block'}}>
            Return to Schemes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="card detail-card">
        <h1 className="detail-title">{scheme.title}</h1>
        
        {savedMessage && <p className="status-msg">{savedMessage}</p>}

        <p className="detail-description">{scheme.description}</p>

        <div className="section-title">Eligibility Criteria</div>
        <ul className="detail-list">
          {Array.isArray(scheme.eligibility) 
            ? scheme.eligibility.map((item, idx) => <li key={idx}>{item}</li>)
            : <li>{scheme.eligibility}</li>
          }
        </ul>

        {scheme.benefits && (
          <>
            <div className="section-title">Key Benefits</div>
            <ul className="detail-list">
              {Array.isArray(scheme.benefits) 
                ? scheme.benefits.map((item, idx) => <li key={idx}>{item}</li>)
                : <li>{scheme.benefits}</li>
              }
            </ul>
          </>
        )}

        {scheme.documentsRequired && (
          <>
            <div className="section-title">Documents Required</div>
            <ul className="detail-list">
              {Array.isArray(scheme.documentsRequired) 
                ? scheme.documentsRequired.map((item, idx) => <li key={idx}>{item}</li>)
                : <li>{scheme.documentsRequired}</li>
              }
            </ul>
          </>
        )}

        {scheme.lastDate && (
          <p className="last-date">📅 Last Date: {scheme.lastDate}</p>
        )}

        <div className="button-group">
          <button onClick={() => navigate(-1)} className="btn btn-save" style={{background: '#eee', color: '#333', border: '1px solid #ccc'}}>
            Back
          </button>
          <button onClick={handleSave} className="btn btn-save">
            Save Scheme
          </button>
          <button onClick={handleApply} className="btn btn-apply">
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchemeDetails;