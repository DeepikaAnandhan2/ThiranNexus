const mongoose = require("mongoose");

const Scheme = require("../models/Scheme");
const UserScheme = require("../models/UserScheme");


/* =========================================================
   NORMALIZE DISABILITY TYPE
========================================================= */

const normalize = (type) => {
  if (!type) {
    return "all";
  }

  const t = type
    .toString()
    .trim()
    .toLowerCase();

  if (
    t.includes("visual") ||
    t.includes("vision") ||
    t.includes("vis")
  ) {
    return "visual";
  }

  if (
    t.includes("hearing") ||
    t.includes("hear") ||
    t.includes("hea")
  ) {
    return "hearing";
  }

  if (
    t.includes("physical") ||
    t.includes("phy")
  ) {
    return "physical";
  }

  if (
    t.includes("cognitive") ||
    t.includes("cog")
  ) {
    return "cognitive";
  }

  if (t === "all") {
    return "all";
  }

  return "all";
};


/* =========================================================
   GET RECOMMENDED SCHEMES

   GET
   /api/schemes/recommended?disabilityType=visual
========================================================= */

exports.getRecommendedSchemes = async (req, res) => {
  try {
    const requestedType =
      req.query.disabilityType;

    const disabilityType =
      normalize(requestedType);

    console.log(
      "======================================="
    );

    console.log(
      "Requested Disability :",
      requestedType
    );

    console.log(
      "Normalized Type      :",
      disabilityType
    );


    const schemes = await Scheme.find({
      $or: [
        {
          disabilityType:
            disabilityType
        },
        {
          disabilityType: "all"
        }
      ]
    }).sort({
      createdAt: -1
    });


    console.log(
      "Matched Schemes :",
      schemes.length
    );

    console.log(
      "Scheme Names :",
      schemes.map(
        (scheme) => scheme.title
      )
    );

    console.log(
      "======================================="
    );


    return res.status(200).json(
      schemes
    );

  } catch (err) {

    console.error(
      "Get Recommended Schemes Error:",
      err
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch schemes"
    });
  }
};


/* =========================================================
   GET SINGLE SCHEME

   GET /api/schemes/:id
========================================================= */

exports.getSchemeById = async (
  req,
  res
) => {

  try {

    const { id } = req.params;


    console.log(
      "Requested Scheme ID:",
      id
    );


    /* Check valid MongoDB ObjectId */

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid scheme ID"
      });
    }


    const scheme =
      await Scheme.findById(id);


    if (!scheme) {

      console.log(
        "Scheme not found:",
        id
      );

      return res.status(404).json({
        success: false,
        message:
          "Scheme not found"
      });
    }


    console.log(
      "Scheme found:",
      scheme.title
    );


    return res.status(200).json(
      scheme
    );

  } catch (err) {

    console.error(
      "Get Scheme By ID Error:",
      err
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch scheme"
    });
  }
};


/* =========================================================
   SAVE SCHEME

   POST /api/schemes/save

   Body:
   {
      userId: "1",
      schemeId: "..."
   }
========================================================= */

exports.saveScheme = async (
  req,
  res
) => {

  try {

    const {
      userId,
      schemeId
    } = req.body;


    console.log(
      "======================================="
    );

    console.log(
      "SAVE SCHEME"
    );

    console.log(
      "User ID:",
      userId
    );

    console.log(
      "Scheme ID:",
      schemeId
    );


    /* Validate input */

    if (!userId || !schemeId) {

      return res.status(400).json({
        success: false,
        message:
          "Missing userId or schemeId"
      });
    }


    /* Validate Scheme ObjectId */

    if (
      !mongoose.Types.ObjectId.isValid(
        schemeId
      )
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid schemeId"
      });
    }


    /* Make sure scheme exists */

    const scheme =
      await Scheme.findById(
        schemeId
      );


    if (!scheme) {

      return res.status(404).json({
        success: false,
        message:
          "Scheme does not exist"
      });
    }


    /* Check already saved */

    const alreadySaved =
      await UserScheme.findOne({
        userId: userId,
        schemeId: schemeId,
        status: "saved"
      });


    if (alreadySaved) {

      return res.status(409).json({
        success: false,
        message:
          "Scheme already saved"
      });
    }


    /* Create saved record */

    const savedScheme =
      await UserScheme.create({
        userId: userId,
        schemeId: schemeId,
        status: "saved"
      });


    console.log(
      "Scheme saved successfully"
    );


    console.log(
      "======================================="
    );


    return res.status(201).json({
      success: true,
      message:
        "Scheme saved successfully",
      data: savedScheme
    });

  } catch (err) {

    console.error(
      "Save Scheme Error:",
      err
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to save scheme"
    });
  }
};


/* =========================================================
   APPLY SCHEME

   POST /api/schemes/apply

   Body:
   {
      userId: "1",
      schemeId: "..."
   }
========================================================= */

exports.applyScheme = async (
  req,
  res
) => {

  try {

    const {
      userId,
      schemeId
    } = req.body;


    console.log(
      "======================================="
    );

    console.log(
      "APPLY SCHEME"
    );

    console.log(
      "User ID:",
      userId
    );

    console.log(
      "Scheme ID:",
      schemeId
    );


    /* Validate input */

    if (!userId || !schemeId) {

      return res.status(400).json({
        success: false,
        message:
          "Missing userId or schemeId"
      });
    }


    /* Validate ObjectId */

    if (
      !mongoose.Types.ObjectId.isValid(
        schemeId
      )
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid schemeId"
      });
    }


    /* Check scheme exists */

    const scheme =
      await Scheme.findById(
        schemeId
      );


    if (!scheme) {

      return res.status(404).json({
        success: false,
        message:
          "Scheme does not exist"
      });
    }


    /* Check already applied */

    const alreadyApplied =
      await UserScheme.findOne({
        userId: userId,
        schemeId: schemeId,
        status: "applied"
      });


    if (alreadyApplied) {

      return res.status(409).json({
        success: false,
        message:
          "Already applied"
      });
    }


    /* Create application */

    const appliedScheme =
      await UserScheme.create({
        userId: userId,
        schemeId: schemeId,
        status: "applied"
      });


    console.log(
      "Application recorded successfully"
    );


    console.log(
      "======================================="
    );


    return res.status(201).json({
      success: true,
      message:
        "Application submitted",
      data: appliedScheme
    });

  } catch (err) {

    console.error(
      "Apply Scheme Error:",
      err
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to apply"
    });
  }
};


/* =========================================================
   GET USER SAVED + APPLIED SCHEMES

   GET /api/schemes/user/:userId
========================================================= */

exports.getUserSchemes = async (
  req,
  res
) => {

  try {

    const {
      userId
    } = req.params;


    console.log(
      "======================================="
    );

    console.log(
      "GET USER SCHEMES"
    );

    console.log(
      "User ID:",
      userId
    );


    if (!userId) {

      return res.status(400).json({
        success: false,
        message:
          "User ID is required"
      });
    }


    /*
      Populate the actual Scheme document.

      Example result:

      {
        _id: "...",
        userId: "1",
        schemeId: {
          _id: "...",
          title: "...",
          description: "..."
        },
        status: "saved"
      }
    */

    const userSchemes =
      await UserScheme.find({
        userId: userId
      })
        .populate("schemeId")
        .sort({
          createdAt: -1
        });


    console.log(
      "Total UserScheme records:",
      userSchemes.length
    );


    /*
      If schemeId is null, it means the
      referenced Scheme no longer exists.

      We don't send those broken records
      to the frontend.
    */

    const validUserSchemes =
      userSchemes.filter(
        (item) =>
          item.schemeId !== null
      );


    console.log(
      "Valid UserScheme records:",
      validUserSchemes.length
    );


    console.log(
      "======================================="
    );


    return res.status(200).json(
      validUserSchemes
    );

  } catch (err) {

    console.error(
      "Get User Schemes Error:",
      err
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch user schemes"
    });
  }
};


/* =========================================================
   DELETE SAVED/APPLIED RECORD

   DELETE
   /api/schemes/user/:userSchemeId
========================================================= */

exports.deleteUserScheme = async (
  req,
  res
) => {

  try {

    const {
      userSchemeId
    } = req.params;


    if (
      !mongoose.Types.ObjectId.isValid(
        userSchemeId
      )
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid UserScheme ID"
      });
    }


    const deleted =
      await UserScheme.findByIdAndDelete(
        userSchemeId
      );


    if (!deleted) {

      return res.status(404).json({
        success: false,
        message:
          "Scheme record not found"
      });
    }


    return res.status(200).json({
      success: true,
      message:
        "Scheme removed successfully"
    });

  } catch (err) {

    console.error(
      "Delete User Scheme Error:",
      err
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to remove scheme"
    });
  }
};