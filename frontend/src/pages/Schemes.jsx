import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import "../styles/schemes.css";

const Schemes = ({ user }) => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");

        const disabilityType = user?.disabilityType || "none";

        console.log("USER TYPE:", disabilityType);

        const res = await axios.get(
          `/api/schemes/recommended?disabilityType=${disabilityType}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        console.log("SCHEMES:", res.data);

        setSchemes(res.data || []);
      } catch (err) {
        console.error("Error fetching schemes:", err);
        setSchemes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, [user]);

  if (loading) {
    return (
      <div className="page-container">
        <h2>Loading schemes...</h2>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Recommended Schemes</h1>

      <p>
        Showing schemes for <b>{user?.disabilityType || "none"}</b> disability
      </p>

      <div className="grid">
        {schemes.length === 0 ? (
          <p className="no-schemes">No schemes found</p>
        ) : (
          schemes.map((scheme) => (
            <div className="card" key={scheme._id}>
              <h3>{scheme.title}</h3>
              <p>{scheme.description}</p>

              <Link to={`/scheme/${scheme._id}`} className="btn btn-view">
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