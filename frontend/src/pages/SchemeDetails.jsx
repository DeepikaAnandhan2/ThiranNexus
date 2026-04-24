import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/schemes.css";

const SchemeDetails = () => {
  const { id } = useParams();
  const [scheme, setScheme] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`/api/schemes/${id}`);
        console.log("SCHEME:", res.data);
        setScheme(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, [id]);

  const handleSave = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      await axios.post("/api/schemes/save", {
        userId: user._id,
        schemeId: id
      });

      setMsg("✅ Saved successfully");
    } catch {
      setMsg("⚠️ Already saved");
    }
  };

  const handleApply = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      await axios.post("/api/schemes/apply", {
        userId: user._id,
        schemeId: id
      });

      // ✅ FIXED LINK
      const link = scheme?.applyLink || scheme?.link;

      if (link && link.startsWith("http")) {
        window.open(link, "_blank");
      } else {
        setMsg("❌ No valid apply link");
      }

    } catch (err) {
      console.error(err);
      setMsg("❌ Apply failed");
    }
  };

  if (!scheme) return <p className="page-container">Loading...</p>;

  return (
    <div className="page-container">
      <div className="card detail-card">

        <h1 className="detail-title">{scheme.title}</h1>
        <p>{scheme.description}</p>

        {msg && <p className="status-msg">{msg}</p>}

        <div className="section-title">Eligibility</div>
        <ul className="detail-list">
          {scheme.eligibility?.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>

        <div className="section-title">Documents</div>
        <ul className="detail-list">
          {scheme.documentsRequired?.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>

        <div className="button-group">
          <button onClick={handleSave} className="btn btn-save">
            Save
          </button>

          <button onClick={handleApply} className="btn btn-apply">
            Apply
          </button>
        </div>

      </div>
    </div>
  );
};

export default SchemeDetails;