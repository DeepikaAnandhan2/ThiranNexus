import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import "../styles/schemes.css";

// Shared data list (In a real app, this comes from your backend API)
export const schemesList = [
  {
    id: 1,
    title: 'Vision Assistance Scheme',
    description: 'Support for visually impaired individuals.',
    disabilityType: 'Visual',
    eligibility: ['Visual Impairment', 'Income below 2L per annum'],
    benefits: ['Free Glasses', 'Eye Checkup'],
    link: "https://www.inclusivetechindia.in/schemes"
  },
  {
    id: 2,
    title: 'Hearing Aid Support',
    description: 'Financial help for high-quality hearing aids.',
    disabilityType: 'Hearing',
    eligibility: ['Hearing Impairment', 'Medical Certificate'],
    benefits: ['Free Devices', 'Battery replacements'],
    link: "https://earmart.in/list-of-government-schemes-for-hearing-impaired-in-india/"
  },
];

const Schemes = ({ user }) => {
  const [recommendedSchemes, setRecommendedSchemes] = useState([]);

  useEffect(() => {
    // If user has a disability type, filter. Otherwise show all.
    if (user?.disabilityType) {
      const filtered = schemesList.filter((scheme) =>
        scheme.disabilityType.toLowerCase().includes(user.disabilityType.toLowerCase())
      );
      setRecommendedSchemes(filtered);
    } else {
      setRecommendedSchemes(schemesList);
    }
  }, [user]);

  return (
    <div className="page-container">
      <div className="ai-header">
        <span className="ai-icon">✨</span>
        <h1 className="page-title">AI Scheme Recommendations</h1>
        <p className="ai-subtitle">Tailored specifically for your profile</p>
      </div>

      <div className="grid">
        {recommendedSchemes.map((scheme) => (
          <div key={scheme.id} className="card">
            <div className="recommendation-badge">98% Match</div>
            <h3>{scheme.title}</h3>
            <p>{scheme.description}</p>
            
            <div className="section-title">Eligibility</div>
            <p className="small-text">{scheme.eligibility.join(', ')}</p>
            
            <Link to={`/scheme/${scheme.id}`} className="btn btn-view">
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schemes;