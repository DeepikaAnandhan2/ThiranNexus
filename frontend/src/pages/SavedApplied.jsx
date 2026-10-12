import React, {
  useEffect,
  useState
} from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import {
  FaFileAlt,
  FaAward
} from "react-icons/fa";

import "../styles/schemes.css";


const SavedApplied = () => {

  const navigate = useNavigate();


  /* =========================================================
     STATE
  ========================================================= */

  const [
    savedSchemes,
    setSavedSchemes
  ] = useState([]);

  const [
    appliedSchemes,
    setAppliedSchemes
  ] = useState([]);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    error,
    setError
  ] = useState("");


  /* =========================================================
     LOGGED USER
  ========================================================= */

  let loggedUser = null;

  try {

    loggedUser =
      JSON.parse(
        localStorage.getItem("user")
      );

  } catch (err) {

    console.error(
      "Unable to read user:",
      err
    );
  }


  const userId =
    loggedUser?._id ||
    loggedUser?.id ||
    loggedUser?.userId;


  /* =========================================================
     LOAD USER SCHEMES
  ========================================================= */

  useEffect(() => {

    loadSchemes();

  }, [userId]);


  const loadSchemes = async () => {

    try {

      setLoading(true);

      setError("");


      if (!userId) {

        setError(
          "User information not found. Please login again."
        );

        setLoading(false);

        return;
      }


      console.log(
        "Loading schemes for user:",
        userId
      );


      const response =
        await fetch(
          `http://localhost:5000/api/schemes/user/${encodeURIComponent(
            userId
          )}`
        );


      const data =
        await response.json();


      console.log(
        "User schemes response:",
        data
      );


      if (!response.ok) {

        throw new Error(
          data.message ||
          `Server returned ${response.status}`
        );
      }


      const saved = [];
      const applied = [];


      if (Array.isArray(data)) {

        data.forEach(
          (item) => {

            /*
              IMPORTANT:

              item.schemeId is the
              actual populated Scheme.

              Example:

              item.schemeId = {
                _id: "...",
                title: "...",
                description: "...",
                disabilityType: "...",
                ...
              }
            */

            if (
              !item ||
              !item.schemeId
            ) {

              return;
            }


            const scheme = {

              ...item.schemeId,

              /*
                This is the ID of the
                UserScheme document.

                Used for DELETE.
              */

              userSchemeId:
                item._id,

              userSchemeStatus:
                item.status

            };


            if (
              item.status === "saved"
            ) {

              saved.push(
                scheme
              );
            }


            if (
              item.status === "applied"
            ) {

              applied.push(
                scheme
              );
            }

          }
        );
      }


      console.log(
        "Saved schemes:",
        saved
      );

      console.log(
        "Applied schemes:",
        applied
      );


      setSavedSchemes(saved);

      setAppliedSchemes(applied);


    } catch (err) {

      console.error(
        "Error loading user schemes:",
        err
      );

      setError(
        "Unable to load your saved and applied schemes."
      );

    } finally {

      setLoading(false);
    }
  };


  /* =========================================================
     REMOVE SAVED SCHEME
  ========================================================= */

  const removeSaved = async (
    userSchemeId
  ) => {

    try {

      const response =
        await fetch(
          `http://localhost:5000/api/schemes/user/${userSchemeId}`,
          {
            method: "DELETE"
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Unable to remove saved scheme"
        );
      }


      setSavedSchemes(
        (previous) =>
          previous.filter(
            (scheme) =>
              scheme.userSchemeId !==
              userSchemeId
          )
      );


    } catch (err) {

      console.error(
        "Remove saved scheme error:",
        err
      );

      alert(
        "Unable to remove saved scheme."
      );
    }
  };


  /* =========================================================
     REMOVE APPLIED SCHEME
  ========================================================= */

  const removeApplied = async (
    userSchemeId
  ) => {

    try {

      const response =
        await fetch(
          `http://localhost:5000/api/schemes/user/${userSchemeId}`,
          {
            method: "DELETE"
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Unable to remove applied scheme"
        );
      }


      setAppliedSchemes(
        (previous) =>
          previous.filter(
            (scheme) =>
              scheme.userSchemeId !==
              userSchemeId
          )
      );


    } catch (err) {

      console.error(
        "Remove applied scheme error:",
        err
      );

      alert(
        "Unable to remove applied scheme."
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
              navigate("/dashboard")
            }
          >
            ← Back
          </button>

        </div>


        <h1 className="page-title">
          My Saved & Applied Schemes
        </h1>


        <div className="no-schemes-card">

          <h3>
            Loading...
          </h3>

          <p>
            Please wait while we load
            your schemes.
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
              navigate("/dashboard")
            }
          >
            ← Back
          </button>

        </div>


        <h1 className="page-title">
          My Saved & Applied Schemes
        </h1>


        <div className="no-schemes-card">

          <h3>
            Unable to Load Schemes
          </h3>

          <p>
            {error}
          </p>

        </div>

      </div>
    );
  }


  /* =========================================================
     MAIN
  ========================================================= */

  return (
    <div className="page-container">

      {/* BACK */}

      <div className="back-container">

        <button
          className="btn btn-back"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Back
        </button>

      </div>


      {/* TITLE */}

      <h1 className="page-title">
        My Saved & Applied Schemes
      </h1>


      {/* =====================================================
          SAVED SCHEMES
      ===================================================== */}

      <h2 className="section-title">
        Saved Schemes
      </h2>


      {savedSchemes.length === 0 ? (

        <div className="no-schemes-card">

          <h3>
            No Saved Schemes
          </h3>

          <p>
            You haven't saved any
            schemes yet.
          </p>

        </div>

      ) : (

        <div className="grid">

          {savedSchemes.map(
            (scheme, index) => {

              const accents = [
                "#2563eb",
                "#10b981",
                "#f59e0b",
                "#8b5cf6",
                "#06b6d4"
              ];


              return (
                <div
                  key={
                    scheme.userSchemeId
                  }
                  className="card scheme-card-ref"
                  style={{
                    "--accent-color":
                      accents[
                        index %
                        accents.length
                      ]
                  }}
                >

                  <div className="scheme-icon-circle">

                    <FaAward />

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
                      marginTop: "auto"
                    }}
                  >

                    <Link
                      to={`/scheme/${scheme._id}`}
                      className="btn btn-view"
                    >
                      View Details
                    </Link>


                    <button
                      className="btn btn-save"
                      onClick={() =>
                        removeSaved(
                          scheme.userSchemeId
                        )
                      }
                    >
                      Remove
                    </button>

                  </div>

                </div>
              );

            }
          )}

        </div>

      )}


      {/* =====================================================
          APPLIED SCHEMES
      ===================================================== */}

      <h2
        className="section-title"
        style={{
          marginTop: "50px"
        }}
      >
        Applied Schemes
      </h2>


      {appliedSchemes.length === 0 ? (

        <div className="no-schemes-card">

          <h3>
            No Applied Schemes
          </h3>

          <p>
            You haven't applied for
            any schemes yet.
          </p>

        </div>

      ) : (

        <div className="grid">

          {appliedSchemes.map(
            (scheme, index) => {

              const accents = [
                "#10b981",
                "#2563eb",
                "#f59e0b",
                "#8b5cf6",
                "#06b6d4"
              ];


              return (
                <div
                  key={
                    scheme.userSchemeId
                  }
                  className="card scheme-card-ref"
                  style={{
                    "--accent-color":
                      accents[
                        index %
                        accents.length
                      ]
                  }}
                >

                  <div className="scheme-icon-circle">

                    <FaFileAlt />

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
                      marginTop: "auto"
                    }}
                  >

                    <Link
                      to={`/scheme/${scheme._id}`}
                      className="btn btn-view"
                    >
                      View Details
                    </Link>


                    {scheme.applyLink && (

                      <a
                        href={
                          scheme.applyLink
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-apply"
                      >
                        Open Portal
                      </a>

                    )}


                    <button
                      className="btn btn-save"
                      onClick={() =>
                        removeApplied(
                          scheme.userSchemeId
                        )
                      }
                    >
                      Remove
                    </button>

                  </div>

                </div>
              );

            }
          )}

        </div>

      )}

    </div>
  );
};


export default SavedApplied;