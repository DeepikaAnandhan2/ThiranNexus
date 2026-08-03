// backend/seedSchemes.js

require("dotenv").config();
const mongoose = require("mongoose");
const Scheme = require("./models/Scheme");

const schemesData = [
  // ================= HEARING =================
  {
    title: "ADIP Scheme (Assistance to Disabled Persons)",
    description:
      "Provides durable and scientifically manufactured assistive devices including hearing aids, wheelchairs, tricycles and other rehabilitation equipment.",
    disabilityType: "hearing",
    eligibility: [
      "Indian Citizen",
      "40% or more disability",
      "Monthly income below ₹30,000"
    ],
    benefits:
      "Free or subsidized assistive devices with maintenance support.",
    documentsRequired: [
      "UDID Card / Disability Certificate",
      "Income Certificate",
      "Aadhaar Card"
    ],
    applyLink: "https://adipscheme.almimco.in/"
  },

  {
    title: "Digital Hearing Aid Support",
    description:
      "Provides digital hearing aids and assistive listening devices for hearing impaired students and individuals.",
    disabilityType: "hearing",
    eligibility: [
      "Certified Hearing Disability",
      "Student or Job Seeker"
    ],
    benefits:
      "Digital Hearing Aid with maintenance and battery support.",
    documentsRequired: [
      "Audiogram Report",
      "UDID Card",
      "Aadhaar Card"
    ],
    applyLink: "https://depwd.gov.in/"
  },

  // ================= VISUAL =================

  {
    title: "Braille Books Assistance",
    description:
      "Free Braille books, tactile learning material and assistive technology for visually impaired students.",
    disabilityType: "visual",
    eligibility: [
      "Visual Disability",
      "School or College Student"
    ],
    benefits:
      "Braille books, talking software, screen reader support.",
    documentsRequired: [
      "Student ID",
      "UDID Card"
    ],
    applyLink: "https://depwd.gov.in/"
  },

  {
    title: "Accessible Reading Device Scheme",
    description:
      "Government support for screen readers, Daisy players and smart reading devices.",
    disabilityType: "visual",
    eligibility: [
      "Visual Disability Certificate"
    ],
    benefits:
      "Free Assistive Reading Devices",
    documentsRequired: [
      "UDID Card",
      "Identity Proof"
    ],
    applyLink: "https://depwd.gov.in/"
  },

  // ================= PHYSICAL =================

  {
    title: "Motorized Wheelchair Assistance",
    description:
      "Financial support for motorized wheelchairs and mobility devices.",
    disabilityType: "physical",
    eligibility: [
      "Physical Disability above 40%"
    ],
    benefits:
      "Motorized Wheelchair",
    documentsRequired: [
      "UDID Card",
      "Medical Certificate"
    ],
    applyLink: "https://depwd.gov.in/"
  },

  {
    title: "Mobility Support Scheme",
    description:
      "Provides crutches, walkers, prosthetic limbs and mobility equipment.",
    disabilityType: "physical",
    eligibility: [
      "Physical Disability Certificate"
    ],
    benefits:
      "Free Mobility Equipment",
    documentsRequired: [
      "Disability Certificate",
      "Identity Proof"
    ],
    applyLink: "https://adipscheme.almimco.in/"
  },

  // ================= COGNITIVE =================

  {
    title: "Skill Development Programme",
    description:
      "Government sponsored vocational training and employment support for persons with intellectual and cognitive disabilities.",
    disabilityType: "cognitive",
    eligibility: [
      "Registered PwD",
      "18-45 Years"
    ],
    benefits:
      "Free Skill Training and Placement Assistance",
    documentsRequired: [
      "UDID Card",
      "Educational Certificates"
    ],
    applyLink: "https://www.ncs.gov.in/"
  },

  {
    title: "Special Education Support",
    description:
      "Financial support for children with intellectual disabilities enrolled in special schools.",
    disabilityType: "cognitive",
    eligibility: [
      "Certified Intellectual Disability"
    ],
    benefits:
      "Education Assistance",
    documentsRequired: [
      "Medical Certificate",
      "School Certificate"
    ],
    applyLink: "https://depwd.gov.in/"
  },

  // ================= ALL =================

  {
    title: "National Scholarship for Persons with Disabilities",
    description:
      "Scholarship for school and college students with disabilities.",
    disabilityType: "all",
    eligibility: [
      "40% Disability",
      "Recognized Educational Institution"
    ],
    benefits:
      "Scholarship and Maintenance Allowance",
    documentsRequired: [
      "Income Certificate",
      "UDID Card",
      "Previous Marksheet"
    ],
    applyLink: "https://scholarships.gov.in/"
  },

  {
    title: "NHFDC Loan Scheme",
    description:
      "Low interest loans for education, self-employment and entrepreneurship.",
    disabilityType: "all",
    eligibility: [
      "Any Disability",
      "18 Years or Above"
    ],
    benefits:
      "Loan up to ₹25 Lakhs",
    documentsRequired: [
      "UDID Card",
      "PAN Card",
      "Aadhaar Card"
    ],
    applyLink: "https://nhfdc.nic.in/"
  }
];

async function seedSchemes() {
  try {

    const mongoUri =
      process.env.MONGO_URI ||
      process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI not found in .env");
    }

    await mongoose.connect(mongoUri);

    console.log("✅ MongoDB Connected");

    await Scheme.deleteMany({});

    console.log("🗑 Existing Schemes Deleted");

    await Scheme.insertMany(schemesData);

    console.log("✅ Schemes Seeded Successfully");
  } catch (err) {
    console.log(err);
  }
}

module.exports = seedSchemes;