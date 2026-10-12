import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaFileAlt,
  FaRoute,
  FaCheckCircle,
  FaSnowflake,
  FaEdit,
  FaMapMarkedAlt,
  FaChartBar,
  FaFolderOpen,
  FaDesktop,
  FaMobileAlt,
  FaAward
} from "react-icons/fa";

import "../styles/schemes.css";

const getSchemeIcon = (title = "") => {
  const t = title.toLowerCase();

  if (t.includes("entry") || t.includes("project")) {
    return <FaFileAlt />;
  }

  if (t.includes("tracking") || t.includes("status")) {
    return <FaRoute />;
  }

  if (t.includes("approval") || t.includes("workflow")) {
    return <FaCheckCircle />;
  }

  if (t.includes("freeze") || t.includes("unfreeze")) {
    return <FaSnowflake />;
  }

  if (t.includes("revision") || t.includes("edit")) {
    return <FaEdit />;
  }

  if (t.includes("district") || t.includes("monitoring")) {
    return <FaMapMarkedAlt />;
  }

  if (t.includes("report") || t.includes("abstract")) {
    return <FaChartBar />;
  }

  if (t.includes("iec") || t.includes("material")) {
    return <FaFolderOpen />;
  }

  if (t.includes("dashboard")) {
    return <FaDesktop />;
  }

  if (t.includes("mobile") || t.includes("inspection")) {
    return <FaMobileAlt />;
  }

  return <FaAward />;
};

const Schemes = ({ user }) => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loggedUser =
    user ||
    JSON.parse(
      localStorage.getItem("user")
    );

  const disabilityType = (
    loggedUser?.disabilityType || "all"
  ).toLowerCase();

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:5000/api/schemes/recommended?disabilityType=${encodeURIComponent(
            disabilityType
          )}`
        );

        if (!response.ok) {
          throw new Error(
            `Server returned ${response.status}`
          );
        }

        const data = await response.json();

        console.log(
          "Schemes received from backend:",
          data
        );

        if (Array.isArray(data)) {
          setSchemes(data);
        } else if (
          Array.isArray(data.schemes)
        ) {
          setSchemes(data.schemes);
        } else if (
          Array.isArray(data.data)
        ) {
          setSchemes(data.data);
        } else {
          setSchemes([]);
        }

      } catch (err) {
        console.error(
          "Error fetching schemes:",
          err
        );

        setError(
          "Unable to load schemes. Please make sure the backend server is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();

  }, [disabilityType]);

  return (
    <div className="page-container">

      <h1 className="page-title">
        Government Recommended Schemes
      </h1>

      <p className="scheme-subtitle">
        Showing schemes for{" "}
        <strong>
          {disabilityType}
        </strong>
      </p>


      {/* ================= LOADING ================= */}

      {loading && (
        <div className="no-schemes-card">
          <h2>
            Loading Schemes...
          </h2>

          <p>
            Please wait while we fetch the
            recommended government schemes.
          </p>
        </div>
      )}


      {/* ================= ERROR ================= */}

      {!loading && error && (
        <div className="no-schemes-card">
          <h2>
            Unable to Load Schemes
          </h2>

          <p>
            {error}
          </p>
        </div>
      )}


      {/* ================= NO SCHEMES ================= */}

      {!loading &&
        !error &&
        schemes.length === 0 && (
          <div className="no-schemes-card">
            <h2>
              No Schemes Found
            </h2>

            <p>
              No schemes are available for
              this disability type.
            </p>
          </div>
        )}


      {/* ================= SCHEMES ================= */}

      {!loading &&
        !error &&
        schemes.length > 0 && (
          <div className="grid">

            {schemes.map(
              (scheme, index) => {

                const accents = [
                  "#2563eb",
                  "#10b981",
                  "#f59e0b",
                  "#8b5cf6",
                  "#06b6d4"
                ];

                const accentColor =
                  accents[
                    index %
                      accents.length
                  ];

                return (
                  <Link
                    to={`/scheme/${scheme._id}`}
                    key={scheme._id}
                    className="card scheme-card-ref"
                    style={{
                      "--accent-color":
                        accentColor
                    }}
                  >

                    <div className="scheme-icon-circle">
                      {getSchemeIcon(
                        scheme.title
                      )}
                    </div>

                    <span className="scheme-type">
                      {(
                        scheme.disabilityType ||
                        "all"
                      ).toUpperCase()}
                    </span>

                    <h3>
                      {scheme.title}
                    </h3>

                    <p>
                      {scheme.description}
                    </p>

                    <div
                      className="button-group"
                      style={{
                        width: "100%",
                        marginTop: "auto"
                      }}
                    >
                      <span
                        className="btn btn-view"
                        style={{
                          width: "100%"
                        }}
                      >
                        View Details
                      </span>
                    </div>

                  </Link>
                );
              }
            )}

          </div>
        )}

    </div>
  );
};

export default Schemes;