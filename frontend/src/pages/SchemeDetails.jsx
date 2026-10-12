import React, {
  useEffect,
  useState
} from "react";

import {
  useParams,
  useNavigate
} from "react-router-dom";

import "../styles/schemes.css";


const SchemeDetails = () => {

  const { id } = useParams();

  const navigate = useNavigate();


  /* =========================================================
     STATE
  ========================================================= */

  const [
    scheme,
    setScheme
  ] = useState(null);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    message,
    setMessage
  ] = useState("");

  const [
    error,
    setError
  ] = useState("");


  /* =========================================================
     FETCH SCHEME DETAILS
  ========================================================= */

  useEffect(() => {

    const fetchScheme = async () => {

      try {

        setLoading(true);

        setError("");

        setMessage("");


        if (!id) {

          setError(
            "Scheme ID is missing."
          );

          return;
        }


        console.log(
          "Fetching Scheme ID:",
          id
        );


        const response =
          await fetch(
            `http://localhost:5000/api/schemes/${encodeURIComponent(
              id
            )}`
          );


        const data =
          await response.json();


        console.log(
          "Scheme Details Response:",
          data
        );


        if (!response.ok) {

          if (
            response.status === 404
          ) {

            setScheme(null);

            setError(
              "The requested scheme does not exist in the database."
            );

            return;
          }


          throw new Error(
            data.message ||
            `Server returned ${response.status}`
          );
        }


        setScheme(data);

      } catch (err) {

        console.error(
          "Error fetching scheme:",
          err
        );

        setError(
          "Unable to load scheme details."
        );

      } finally {

        setLoading(false);
      }
    };


    fetchScheme();

  }, [id]);


  /* =========================================================
     GET USER ID
  ========================================================= */

  const getUserId = () => {

    try {

      const loggedUser =
        JSON.parse(
          localStorage.getItem("user")
        );


      return (
        loggedUser?._id ||
        loggedUser?.id ||
        loggedUser?.userId ||
        null
      );

    } catch (err) {

      console.error(
        "Unable to read logged user:",
        err
      );

      return null;
    }
  };


  /* =========================================================
     SAVE SCHEME
  ========================================================= */

  const handleSave = async () => {

    try {

      setMessage("");


      const userId =
        getUserId();


      if (!userId) {

        setMessage(
          "⚠️ Please login again."
        );

        return;
      }


      if (!scheme?._id) {

        setMessage(
          "⚠️ Scheme information is missing."
        );

        return;
      }


      console.log(
        "Saving Scheme:",
        scheme._id
      );


      const response =
        await fetch(
          "http://localhost:5000/api/schemes/save",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              userId: userId,
              schemeId:
                scheme._id
            })
          }
        );


      const data =
        await response.json();


      console.log(
        "Save Response:",
        data
      );


      if (
        response.status === 409
      ) {

        setMessage(
          "⚠️ Scheme already saved."
        );

        return;
      }


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Unable to save scheme"
        );
      }


      setMessage(
        "✅ Scheme saved successfully."
      );

    } catch (err) {

      console.error(
        "Save Scheme Error:",
        err
      );

      setMessage(
        "❌ Unable to save scheme."
      );
    }
  };


  /* =========================================================
     APPLY SCHEME
  ========================================================= */

  const handleApply = async () => {

    try {

      setMessage("");


      const userId =
        getUserId();


      if (!userId) {

        setMessage(
          "⚠️ Please login again."
        );

        return;
      }


      if (!scheme?._id) {

        setMessage(
          "⚠️ Scheme information is missing."
        );

        return;
      }


      console.log(
        "Applying Scheme:",
        scheme._id
      );


      const response =
        await fetch(
          "http://localhost:5000/api/schemes/apply",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              userId: userId,
              schemeId:
                scheme._id
            })
          }
        );


      const data =
        await response.json();


      console.log(
        "Apply Response:",
        data
      );


      if (
        response.status === 409
      ) {

        setMessage(
          "⚠️ You have already applied for this scheme."
        );

      } else if (!response.ok) {

        throw new Error(
          data.message ||
          "Unable to apply"
        );

      } else {

        setMessage(
          "✅ Application recorded successfully."
        );
      }


      /*
        Open the official application
        portal if the Scheme contains
        applyLink.
      */

      if (
        scheme.applyLink
      ) {

        window.open(
          scheme.applyLink,
          "_blank",
          "noopener,noreferrer"
        );
      }

    } catch (err) {

      console.error(
        "Apply Scheme Error:",
        err
      );

      setMessage(
        "❌ Unable to submit application."
      );
    }
  };


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {

    return (
      <div className="page-container">

        <div className="back-container">

          <button
            className="btn btn-back"
            onClick={() =>
              navigate("/schemes")
            }
          >
            ← Back
          </button>

        </div>


        <div className="no-schemes-card">

          <h2>
            Loading Scheme...
          </h2>

          <p>
            Please wait while we load
            the scheme details.
          </p>

        </div>

      </div>
    );
  }


  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {

    return (
      <div className="page-container">

        <div className="back-container">

          <button
            className="btn btn-back"
            onClick={() =>
              navigate("/schemes")
            }
          >
            ← Back
          </button>

        </div>


        <div className="no-schemes-card">

          <h2>
            Scheme Not Found
          </h2>

          <p>
            {error}
          </p>

        </div>

      </div>
    );
  }


  /* =========================================================
     SAFETY CHECK
  ========================================================= */

  if (!scheme) {

    return (
      <div className="page-container">

        <div className="back-container">

          <button
            className="btn btn-back"
            onClick={() =>
              navigate("/schemes")
            }
          >
            ← Back
          </button>

        </div>


        <div className="no-schemes-card">

          <h2>
            Scheme Not Found
          </h2>

          <p>
            The requested scheme does not exist.
          </p>

        </div>

      </div>
    );
  }


  /* =========================================================
     MAIN DETAILS PAGE
  ========================================================= */

  return (
    <div className="page-container">

      {/* BACK BUTTON */}

      <div className="back-container">

        <button
          className="btn btn-back"
          onClick={() =>
            navigate("/schemes")
          }
        >
          ← Back
        </button>

      </div>


      {/* SCHEME CARD */}

      <div className="card detail-card">

        {/* DISABILITY TYPE */}

        <span className="scheme-type">

          {(
            scheme.disabilityType ||
            "all"
          ).toUpperCase()}

        </span>


        {/* TITLE */}

        <h1 className="detail-title">

          {scheme.title}

        </h1>


        {/* DESCRIPTION */}

        <p className="detail-description">

          {scheme.description}

        </p>


        {/* STATUS MESSAGE */}

        {message && (

          <div className="status-msg">

            {message}

          </div>

        )}


        <hr
          style={{
            width: "100%",
            border: "none",
            borderTop:
              "1px solid #e2e8f0",
            margin:
              "20px 0"
          }}
        />


        {/* ELIGIBILITY */}

        <h2 className="section-title">

          Eligibility

        </h2>


        <ul className="detail-list">

          {Array.isArray(
            scheme.eligibility
          ) ? (

            scheme.eligibility.map(
              (
                item,
                index
              ) => (

                <li
                  key={index}
                >
                  {item}
                </li>

              )
            )

          ) : (

            <li>
              Eligibility information
              not available.
            </li>

          )}

        </ul>


        {/* BENEFITS */}

        <h2 className="section-title">

          Benefits

        </h2>


        <p className="benefits-text">

          {scheme.benefits ||
            "Benefits information not available."}

        </p>


        {/* DOCUMENTS */}

        <h2 className="section-title">

          Required Documents

        </h2>


        <ul className="detail-list">

          {Array.isArray(
            scheme.documentsRequired
          ) ? (

            scheme.documentsRequired.map(
              (
                item,
                index
              ) => (

                <li
                  key={index}
                >
                  {item}
                </li>

              )
            )

          ) : (

            <li>
              Document information
              not available.
            </li>

          )}

        </ul>


        {/* BUTTONS */}

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