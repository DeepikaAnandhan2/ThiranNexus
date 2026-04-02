import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/schemes.css";

export default function SavedApplied() {
  const [savedSchemes, setSavedSchemes] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedSchemes") || "[]");
    setSavedSchemes(saved);
  }, []);

  const removeScheme = (id) => {
    const updated = savedSchemes.filter(s => s.id !== id);
    setSavedSchemes(updated);
    localStorage.setItem("savedSchemes", JSON.stringify(updated));
  };

  return (
    <div className="page-container">
      <h1 className="page-title" style={{color: 'white', marginBottom: '30px'}}>Your Saved Schemes</h1>

      {savedSchemes.length === 0 ? (
        <div className="card text-center">
          <p>You haven't saved any schemes yet.</p>
          <Link to="/schemes" className="btn btn-view" style={{display: 'inline-block', width: 'auto', marginTop: '15px'}}>
             Browse Schemes
          </Link>
        </div>
      ) : (
        <div className="grid">
          {savedSchemes.map((scheme) => (
            <div className="card" key={scheme.id}>
              <h3>{scheme.name}</h3>
              <p>{scheme.description}</p>
              
              <div className="button-group">
                <Link to={`/scheme/${scheme.id}`} className="btn btn-view" style={{flex: 1}}>
                  View Details
                </Link>
                <button 
                  onClick={() => removeScheme(scheme.id)} 
                  className="btn" 
                  style={{background: '#ff4d4d', color: 'white', flex: 1, border: 'none'}}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}