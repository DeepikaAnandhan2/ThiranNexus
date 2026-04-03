import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/schemes.css";

export default function SavedApplied() {
  const [savedSchemes, setSavedSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedSchemes = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user._id;
        
        if (!userId) {
          setSavedSchemes([]);
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/schemes/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setSavedSchemes(res.data || []);
      } catch (err) {
        console.error('Failed to fetch saved schemes:', err);
        // Fallback to localStorage
        const saved = JSON.parse(localStorage.getItem("savedSchemes") || "[]");
        setSavedSchemes(saved);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedSchemes();
  }, []);

  const removeScheme = async (userSchemeId) => {
    try {
      // Remove from backend - you'd need a delete endpoint
      // For now, just update local state
      const updated = savedSchemes.filter(s => s._id !== userSchemeId && s._id !== userSchemeId);
      setSavedSchemes(updated);
    } catch (err) {
      console.error('Failed to remove scheme:', err);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <h1 className="page-title" style={{color: 'white', marginBottom: '30px'}}>Your Saved Schemes</h1>
        <div className="card text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const schemes = savedSchemes.filter(s => s.status === 'saved');
  const applied = savedSchemes.filter(s => s.status === 'applied');

  return (
    <div className="page-container">
      <h1 className="page-title" style={{color: 'white', marginBottom: '30px'}}>Your Saved & Applied Schemes</h1>

      {savedSchemes.length === 0 ? (
        <div className="card text-center">
          <p>You haven't saved any schemes yet.</p>
          <Link to="/schemes" className="btn btn-view" style={{display: 'inline-block', width: 'auto', marginTop: '15px'}}>
             Browse Schemes
          </Link>
        </div>
      ) : (
        <>
          {schemes.length > 0 && (
            <>
              <h2 style={{color: 'white', marginBottom: '15px'}}>Saved Schemes</h2>
              <div className="grid">
                {schemes.map((item) => {
                  const scheme = item.schemeId || item;
                  return (
                    <div className="card" key={item._id || scheme._id || scheme.id}>
                      <h3>{scheme.title}</h3>
                      <p>{scheme.description}</p>
                      <span className="recommendation-badge" style={{background: '#10B981'}}>SAVED</span>
                      
                      <div className="button-group" style={{marginTop: '10px'}}>
                        <Link to={`/scheme/${scheme._id || scheme.id}`} className="btn btn-view" style={{flex: 1}}>
                          View Details
                        </Link>
                        <button 
                          onClick={() => removeScheme(item._id)} 
                          className="btn" 
                          style={{background: '#ff4d4d', color: 'white', flex: 1, border: 'none'}}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {applied.length > 0 && (
            <>
              <h2 style={{color: 'white', marginBottom: '15px', marginTop: '20px'}}>Applied Schemes</h2>
              <div className="grid">
                {applied.map((item) => {
                  const scheme = item.schemeId || item;
                  return (
                    <div className="card" key={item._id || scheme._id || scheme.id}>
                      <h3>{scheme.title}</h3>
                      <p>{scheme.description}</p>
                      <span className="recommendation-badge" style={{background: '#F97316'}}>APPLIED</span>
                      
                      <div className="button-group" style={{marginTop: '10px'}}>
                        <Link to={`/scheme/${scheme._id || scheme.id}`} className="btn btn-view" style={{flex: 1}}>
                          View Details
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}