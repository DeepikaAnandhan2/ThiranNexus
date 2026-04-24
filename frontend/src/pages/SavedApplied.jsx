import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../styles/schemes.css";

export default function SavedApplied() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user?._id) {
          setData([]);
          setLoading(false);
          return;
        }

        const res = await axios.get(`/api/schemes/user/${user._id}`);
        console.log("USER SCHEMES:", res.data);

        setData(res.data || []);
      } catch (err) {
        console.error("Error fetching saved schemes:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  const saved = data.filter((d) => d.status === "saved");
  const applied = data.filter((d) => d.status === "applied");

  if (loading) {
    return (
      <div className="page-container">
        <h2>Loading your schemes...</h2>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Your Schemes</h1>

      {/* ✅ SAVED SCHEMES */}
      <h2 style={{ marginTop: "20px" }}>Saved Schemes</h2>

      {saved.length === 0 ? (
        <p className="no-schemes">No saved schemes yet</p>
      ) : (
        <div className="grid">
          {saved.map((item) => {
            const scheme = item.schemeId;

            return (
              <div className="card" key={item._id}>
                <h3>{scheme?.title}</h3>
                <p>{scheme?.description}</p>

                <div className="button-group">
                  <Link
                    to={`/scheme/${scheme?._id}`}
                    className="btn btn-view"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ✅ APPLIED SCHEMES */}
      <h2 style={{ marginTop: "40px" }}>Applied Schemes</h2>

      {applied.length === 0 ? (
        <p className="no-schemes">No applied schemes yet</p>
      ) : (
        <div className="grid">
          {applied.map((item) => {
            const scheme = item.schemeId;

            return (
              <div className="card" key={item._id}>
                <h3>{scheme?.title}</h3>
                <p>{scheme?.description}</p>

                <div className="button-group">
                  <a
                    href={scheme?.applyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-apply"
                  >
                    Open Application
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}