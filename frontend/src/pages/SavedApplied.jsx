import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/schemes.css";

const SavedApplied = () => {
  const navigate = useNavigate();

  const [savedSchemes, setSavedSchemes] = useState([]);
  const [appliedSchemes, setAppliedSchemes] = useState([]);

  useEffect(() => {
    loadSchemes();
  }, []);

  const loadSchemes = () => {
    const saved =
      JSON.parse(localStorage.getItem("savedSchemes")) || [];

    const applied =
      JSON.parse(localStorage.getItem("appliedSchemes")) || [];

    setSavedSchemes(saved);
    setAppliedSchemes(applied);
  };

  // Remove Saved Scheme
  const removeSaved = (id) => {
    const updated = savedSchemes.filter(
      (scheme) => scheme._id !== id
    );

    localStorage.setItem(
      "savedSchemes",
      JSON.stringify(updated)
    );

    setSavedSchemes(updated);
  };

  // Remove Applied Scheme
  const removeApplied = (id) => {
    const updated = appliedSchemes.filter(
      (scheme) => scheme._id !== id
    );

    localStorage.setItem(
      "appliedSchemes",
      JSON.stringify(updated)
    );

    setAppliedSchemes(updated);
  };

  return (
    <div className="page-container">

      {/* Back Button */}
      <div className="back-container">
        <button
          className="btn btn-back"
          onClick={() => navigate("/dashboard")}
        >
          ← Back
        </button>
      </div>

      <h1 className="page-title">
        My Saved & Applied Schemes
      </h1>

      {/* ===================== Saved Schemes ===================== */}

      <h2 className="section-title">
        Saved Schemes
      </h2>

      {savedSchemes.length === 0 ? (

        <div className="no-schemes-card">
          <h3>No Saved Schemes</h3>
          <p>
            You haven't saved any schemes yet.
          </p>
        </div>

      ) : (

        <div className="grid">

          {savedSchemes.map((scheme) => (

            <div
              className="card"
              key={scheme._id}
            >

              <span className="scheme-type">
                {scheme.disabilityType.toUpperCase()}
              </span>

              <h3>{scheme.title}</h3>

              <p>{scheme.description}</p>

              <div className="button-group">

                <Link
                  to={`/scheme/${scheme._id}`}
                  className="btn btn-view"
                >
                  View Details
                </Link>

                <button
                  className="btn btn-save"
                  onClick={() =>
                    removeSaved(scheme._id)
                  }
                >
                  Remove
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

      {/* ===================== Applied Schemes ===================== */}

      <h2
        className="section-title"
        style={{ marginTop: "50px" }}
      >
        Applied Schemes
      </h2>

      {appliedSchemes.length === 0 ? (

        <div className="no-schemes-card">
          <h3>No Applied Schemes</h3>
          <p>
            You haven't applied for any schemes yet.
          </p>
        </div>

      ) : (

        <div className="grid">

          {appliedSchemes.map((scheme) => (

            <div
              className="card"
              key={scheme._id}
            >

              <span className="scheme-type">
                {scheme.disabilityType.toUpperCase()}
              </span>

              <h3>{scheme.title}</h3>

              <p>{scheme.description}</p>

              <div className="button-group">

                <a
                  href={scheme.applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-apply"
                >
                  Open Portal
                </a>

                <button
                  className="btn btn-save"
                  onClick={() =>
                    removeApplied(scheme._id)
                  }
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
};

export default SavedApplied;