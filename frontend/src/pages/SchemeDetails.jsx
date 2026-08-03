import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import schemesData from "../data/schemesData";
import "../styles/schemes.css";

const SchemeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [message, setMessage] = useState("");

  // Find the selected scheme
  const scheme = schemesData.find((item) => item._id === id);

  if (!scheme) {
    return (
      <div className="page-container">

        <div className="back-container">
          <button
            className="btn btn-back"
            onClick={() => navigate("/schemes")}
          >
            ← Back
          </button>
        </div>

        <div className="no-schemes-card">
          <h2>Scheme Not Found</h2>
          <p>The requested scheme does not exist.</p>
        </div>

      </div>
    );
  }

  // Save Scheme
  const handleSave = () => {
    const saved =
      JSON.parse(localStorage.getItem("savedSchemes")) || [];

    const exists = saved.some(
      (item) => item._id === scheme._id
    );

    if (exists) {
      setMessage("⚠️ Scheme already saved.");
      return;
    }

    saved.push(scheme);

    localStorage.setItem(
      "savedSchemes",
      JSON.stringify(saved)
    );

    setMessage("✅ Scheme saved successfully.");
  };

  // Apply Scheme
  const handleApply = () => {
    const applied =
      JSON.parse(localStorage.getItem("appliedSchemes")) || [];

    const exists = applied.some(
      (item) => item._id === scheme._id
    );

    if (!exists) {
      applied.push(scheme);

      localStorage.setItem(
        "appliedSchemes",
        JSON.stringify(applied)
      );
    }

    setMessage("✅ Redirecting to the application portal...");

    if (scheme.applyLink) {
      window.open(scheme.applyLink, "_blank");
    }
  };

  return (
    <div className="page-container">

      {/* Back Button */}

      <div className="back-container">
        <button
          className="btn btn-back"
          onClick={() => navigate("/schemes")}
        >
          ← Back
        </button>
      </div>

      {/* Card */}

      <div className="card detail-card">

        <span className="scheme-type">
          {scheme.disabilityType.toUpperCase()}
        </span>

        <h1 className="detail-title">
          {scheme.title}
        </h1>

        <p className="detail-description">
          {scheme.description}
        </p>

        {message && (
          <div className="status-msg">
            {message}
          </div>
        )}

        <hr />

        <h2 className="section-title">
          Eligibility
        </h2>

        <ul className="detail-list">
          {scheme.eligibility.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

        <h2 className="section-title">
          Benefits
        </h2>

        <p className="benefits-text">
          {scheme.benefits}
        </p>

        <h2 className="section-title">
          Required Documents
        </h2>

        <ul className="detail-list">
          {scheme.documentsRequired.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

        <div className="button-group">

          <button
            className="btn btn-save"
            onClick={handleSave}
          >
            Save Scheme
          </button>

          <button
            className="btn btn-apply"
            onClick={handleApply}
          >
            Apply Now
          </button>

        </div>

      </div>

    </div>
  );
};

export default SchemeDetails;