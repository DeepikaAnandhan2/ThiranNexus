import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import "../styles/schemes.css";

const Schemes = ({ user }) => {
  const [recommendedSchemes, setRecommendedSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchemes = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const disabilityParam = user?.disabilityType 
          ? `&disabilityType=${encodeURIComponent(user.disabilityType)}`
          : '';
        
        const res = await axios.get(`/api/schemes/recommended?${disabilityParam}`, { headers });
        setRecommendedSchemes(res.data || []);
      } catch (err) {
        console.error('Failed to fetch schemes:', err);
        setError('Failed to load schemes');
        // Fallback to local data
        setRecommendedSchemes([
          {
            id: 1,
            title: 'National Scholarship for Disabled Students',
            description: 'Central Government scholarship for students with disabilities.',
            disabilityType: 'All',
            eligibility: ['Class 8-12', 'Income below threshold'],
            benefits: 'Financial support for education',
            applyLink: '#'
          },
          {
            id: 2,
            title: 'Tamil Nadu Disability Welfare Scheme',
            description: 'State Government scheme for persons with disabilities.',
            disabilityType: 'All',
            eligibility: ['TN Resident', 'Disability Certificate'],
            benefits: 'Monthly allowance',
            applyLink: '#'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, [user?.disabilityType]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="ai-header">
          <span className="ai-icon">✨</span>
          <h1 className="page-title">AI Scheme Recommendations</h1>
          <p className="ai-subtitle">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="ai-header">
        <span className="ai-icon">✨</span>
        <h1 className="page-title">AI Scheme Recommendations</h1>
        <p className="ai-subtitle">
          {user?.disabilityType 
            ? `Tailored for ${user.disabilityType} disability` 
            : 'Tailored specifically for your profile'}
        </p>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="grid">
        {recommendedSchemes.length === 0 ? (
          <p className="no-schemes">No schemes found for your disability type.</p>
        ) : (
          recommendedSchemes.map((scheme) => (
            <div key={scheme._id || scheme.id} className="card">
              <div className="recommendation-badge">98% Match</div>
              <h3>{scheme.title}</h3>
              <p>{scheme.description}</p>
              
              <div className="section-title">Eligibility</div>
              <p className="small-text">
                {Array.isArray(scheme.eligibility) 
                  ? scheme.eligibility.join(', ') 
                  : scheme.eligibility}
              </p>
              
              {scheme.benefits && (
                <>
                  <div className="section-title">Benefits</div>
                  <p className="small-text">{scheme.benefits}</p>
                </>
              )}
              
              <Link to={`/scheme/${scheme._id || scheme.id}`} className="btn btn-view">
                View Details
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Schemes;