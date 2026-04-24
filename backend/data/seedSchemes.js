const Scheme = require("../models/Scheme");

const seedSchemes = async () => {
  const count = await Scheme.countDocuments();
  if (count > 0) return;

  await Scheme.insertMany([
    {
      title: "Vision Assistance Scheme",
      description: "Support for visually impaired",
      disabilityType: "visual",
      eligibility: ["Visual impairment"],
      benefits: "Free glasses",
      documentsRequired: ["Aadhar"],
      applyLink: "https://www.nhp.gov.in/"
    },
    {
      title: "Hearing Aid Support",
      description: "Support for hearing impaired",
      disabilityType: "hearing",
      eligibility: ["Hearing disability"],
      benefits: "Free hearing aids",
      documentsRequired: ["Medical Certificate"],
      applyLink: "https://www.nhp.gov.in/"
    },
    {
      title: "Cognitive Support Program",
      description: "Support for cognitive disability",
      disabilityType: "cognitive",
      eligibility: ["Cognitive disability"],
      benefits: "Training + stipend",
      documentsRequired: ["Medical Certificate"],
      applyLink: "https://www.nhp.gov.in/"
    },
    {
      title: "National Scholarship",
      description: "For all disabilities",
      disabilityType: "all",
      eligibility: ["Students"],
      benefits: "Scholarship",
      documentsRequired: ["Aadhar"],
      applyLink: "https://scholarships.gov.in/"
    }
  ]);

  console.log("✅ Schemes seeded");
};

module.exports = seedSchemes;