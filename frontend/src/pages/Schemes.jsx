import React from "react";
import { Link } from "react-router-dom";
import schemesData from "../data/schemesData";
import "../styles/schemes.css";

const Schemes = ({ user }) => {
  // Get logged-in user
  const loggedUser =
    user || JSON.parse(localStorage.getItem("user"));

  // Get disability type
  const disabilityType = (
    loggedUser?.disabilityType || "all"
  ).toLowerCase();

  // Filter schemes
  const filteredSchemes = schemesData.filter((scheme) => {
    return (
      scheme.disabilityType.toLowerCase() === disabilityType ||
      scheme.disabilityType.toLowerCase() === "all"
    );
  });

  return (
    <div className="page-container">

      <h1 className="page-title">
        Government Recommended Schemes
      </h1>

      <p className="scheme-subtitle">
        Showing schemes for{" "}
        <strong>{disabilityType}</strong>
      </p>

      {filteredSchemes.length === 0 ? (

        <div className="no-schemes-card">
          <h2>No Schemes Found</h2>

          <p>
            No schemes are available for this disability type.
          </p>
        </div>

      ) : (

        <div className="grid">

          {filteredSchemes.map((scheme) => (

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

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
};

export default Schemes;