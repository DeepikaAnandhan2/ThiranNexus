// backend/seedSchemes.js

require("dotenv").config();
const mongoose = require("mongoose");
const Scheme = require("./models/Scheme");

const schemesData = [
  // ================= HEARING =================

  {
    title: "ADIP Scheme (Assistance to Disabled Persons)",
    description:
      "Provides assistive devices including hearing aids and other rehabilitation equipment to eligible persons with disabilities.",
    disabilityType: "hearing",
    eligibility: [
      "Indian Citizen",
      "Person with benchmark disability",
      "Valid Disability Certificate / UDID Card"
    ],
    benefits:
      "Free or subsidized assistive devices such as hearing aids and other rehabilitation equipment.",
    documentsRequired: [
      "UDID Card / Disability Certificate",
      "Income Certificate",
      "Aadhaar Card"
    ],
    applyLink: "https://depwd.gov.in/en/adip-scheme/"
  },

  {
    title: "Pre-Matric Scholarship for Students with Disabilities",
    description:
      "Scholarship support for students with disabilities studying in Classes IX and X.",
    disabilityType: "hearing",
    eligibility: [
      "Indian Citizen",
      "Student with benchmark disability",
      "40% or more disability",
      "Studying in Class IX or X"
    ],
    benefits:
      "Scholarship and educational support for eligible students.",
    documentsRequired: [
      "UDID Card / Disability Certificate",
      "Aadhaar Card",
      "Income Certificate",
      "Student ID"
    ],
    applyLink: "https://scholarships.gov.in/"
  },

  {
    title: "Post-Matric Scholarship for Students with Disabilities",
    description:
      "Scholarship support for students with disabilities studying from Class XI through postgraduate degree or diploma programmes.",
    disabilityType: "hearing",
    eligibility: [
      "Indian Citizen",
      "40% or more disability",
      "Class XI, XII, Diploma, Degree or Postgraduate student"
    ],
    benefits:
      "Tuition support, maintenance allowance and other educational assistance.",
    documentsRequired: [
      "UDID Card / Disability Certificate",
      "Aadhaar Card",
      "Income Certificate",
      "Previous Marksheet"
    ],
    applyLink: "https://depwd.gov.in/en/scholarship-post-matric/"
  },

  {
    title: "Top Class Education Scholarship for Students with Disabilities",
    description:
      "Scholarship support for students with disabilities pursuing higher education in notified institutes.",
    disabilityType: "hearing",
    eligibility: [
      "Indian Citizen",
      "40% or more disability",
      "Studying in a notified institute",
      "Graduate, Postgraduate or Diploma student"
    ],
    benefits:
      "Tuition fee, maintenance support, books, computer assistance and other educational support.",
    documentsRequired: [
      "UDID Card",
      "Aadhaar Card",
      "Income Certificate",
      "Admission Proof"
    ],
    applyLink: "https://depwd.gov.in/en/scholarship-top-class-fellowship/"
  },

  {
    title: "National Fellowship for Persons with Disabilities (NFPwD)",
    description:
      "Fellowship support for students with disabilities pursuing advanced research and doctoral studies in India.",
    disabilityType: "hearing",
    eligibility: [
      "Indian Citizen",
      "Student with benchmark disability",
      "Valid Disability Certificate / UDID",
      "Eligible for higher research studies"
    ],
    benefits:
      "Financial fellowship support for higher research and doctoral education.",
    documentsRequired: [
      "UDID Card / Disability Certificate",
      "Aadhaar Card",
      "Educational Certificates",
      "Admission / Research Documents"
    ],
    applyLink: "https://depwd.gov.in/en/scholarship/"
  },

  {
    title: "National Overseas Scholarship for Students with Disabilities",
    description:
      "Financial assistance for eligible students with disabilities pursuing higher studies at foreign universities.",
    disabilityType: "hearing",
    eligibility: [
      "Indian Citizen",
      "40% or more disability",
      "Eligible for Master's Degree or Ph.D.",
      "Valid Disability Certificate / UDID"
    ],
    benefits:
      "Financial assistance for higher education abroad.",
    documentsRequired: [
      "UDID Card / Disability Certificate",
      "Aadhaar Card",
      "Academic Certificates",
      "Admission / Offer Letter"
    ],
    applyLink: "https://depwd.gov.in/en/national-overseas-scholarship-2/"
  },

  {
    title: "Free Coaching for Students with Disabilities",
    description:
      "Provides coaching support for students with disabilities preparing for recruitment examinations and entrance examinations.",
    disabilityType: "hearing",
    eligibility: [
      "Indian Citizen",
      "Student with benchmark disability",
      "Valid Disability Certificate / UDID",
      "Eligible for competitive or entrance examinations"
    ],
    benefits:
      "Free coaching and examination preparation support.",
    documentsRequired: [
      "UDID Card / Disability Certificate",
      "Aadhaar Card",
      "Educational Certificates",
      "Income Certificate"
    ],
    applyLink: "https://depwd.gov.in/en/scholarship/"
  },

  {
    title: "National Action Plan for Skill Development of PwDs (NAP-SDP)",
    description:
      "Provides skill development and vocational training opportunities for persons with disabilities to improve employment opportunities.",
    disabilityType: "hearing",
    eligibility: [
      "Person with Disability",
      "Valid Disability Certificate / UDID",
      "Eligible for skill development training"
    ],
    benefits:
      "Skill training, vocational development and employment support.",
    documentsRequired: [
      "UDID Card / Disability Certificate",
      "Aadhaar Card",
      "Educational Certificates"
    ],
    applyLink: "https://depwd.gov.in/en/skill-development-of-pwds/"
  },

  {
    title: "Deendayal Divyangjan Rehabilitation Scheme (DDRS)",
    description:
      "Supports rehabilitation services for persons with disabilities through organizations and rehabilitation projects.",
    disabilityType: "hearing",
    eligibility: [
      "Persons with disabilities",
      "Eligible rehabilitation beneficiaries",
      "Valid Disability Certificate where applicable"
    ],
    benefits:
      "Rehabilitation, education, training and support services through approved organizations.",
    documentsRequired: [
      "Disability Certificate / UDID Card",
      "Aadhaar Card",
      "Relevant Educational or Medical Documents"
    ],
    applyLink: "https://depwd.gov.in/en/ddrs/"
  },


  // ================= VISUAL =================

  {
    title: "ADIP Scheme (Assistance to Disabled Persons)",
    description:
      "Provides assistive devices and appliances including visual aids, learning and communication equipment for persons with visual disabilities.",
    disabilityType: "visual",
    eligibility: [
      "Indian Citizen",
      "Person with benchmark disability",
      "Valid Disability Certificate / UDID Card"
    ],
    benefits:
      "Assistive devices, visual aids, learning and communication equipment.",
    documentsRequired: [
      "UDID Card / Disability Certificate",
      "Income Certificate",
      "Aadhaar Card"
    ],
    applyLink: "https://depwd.gov.in/en/adip-scheme/"
  },

  {
    title: "Pre-Matric Scholarship for Students with Disabilities",
    description:
      "Scholarship support for students with disabilities studying in Classes IX and X.",
    disabilityType: "visual",
    eligibility: [
      "Indian Citizen",
      "Student with benchmark disability",
      "40% or more disability",
      "Studying in Class IX or X"
    ],
    benefits:
      "Scholarship and educational support for eligible students.",
    documentsRequired: [
      "UDID Card / Disability Certificate",
      "Aadhaar Card",
      "Income Certificate",
      "Student ID"
    ],
    applyLink: "https://scholarships.gov.in/"
  },

  {
    title: "Post-Matric Scholarship for Students with Disabilities",
    description:
      "Scholarship support for students with disabilities studying from Class XI through postgraduate degree or diploma programmes.",
    disabilityType: "visual",
    eligibility: [
      "Indian Citizen",
      "40% or more disability",
      "Class XI, XII, Diploma, Degree or Postgraduate student"
    ],
    benefits:
      "Tuition support, maintenance allowance and educational assistance.",
    documentsRequired: [
      "UDID Card / Disability Certificate",
      "Aadhaar Card",
      "Income Certificate",
      "Previous Marksheet"
    ],
    applyLink: "https://depwd.gov.in/en/scholarship-post-matric/"
  },

  {
    title: "Top Class Education Scholarship for Students with Disabilities",
    description:
      "Scholarship support for students with disabilities pursuing higher education in notified institutes.",
    disabilityType: "visual",
    eligibility: [
      "Indian Citizen",
      "40% or more disability",
      "Studying in a notified institute",
      "Graduate, Postgraduate or Diploma student"
    ],
    benefits:
      "Tuition fee, maintenance support, books, computer assistance and educational support.",
    documentsRequired: [
      "UDID Card",
      "Aadhaar Card",
      "Income Certificate",
      "Admission Proof"
    ],
    applyLink: "https://depwd.gov.in/en/scholarship-top-class-fellowship/"
  },

  {
    title: "National Fellowship for Persons with Disabilities (NFPwD)",
    description:
      "Fellowship support for students with disabilities pursuing advanced research and doctoral studies in India.",
    disabilityType: "visual",
    eligibility: [
      "Indian Citizen",
      "Student with benchmark disability",
      "Valid Disability Certificate / UDID",
      "Eligible for higher research studies"
    ],
    benefits:
      "Financial fellowship support for higher research and doctoral education.",
    documentsRequired: [
      "UDID Card / Disability Certificate",
      "Aadhaar Card",
      "Educational Certificates",
      "Admission / Research Documents"
    ],
    applyLink: "https://depwd.gov.in/en/scholarship/"
  },

  {
    title: "National Overseas Scholarship for Students with Disabilities",
    description:
      "Financial assistance for eligible students with disabilities pursuing higher studies at foreign universities.",
    disabilityType: "visual",
    eligibility: [
      "Indian Citizen",
      "40% or more disability",
      "Eligible for Master's Degree or Ph.D.",
      "Valid Disability Certificate / UDID"
    ],
    benefits:
      "Financial assistance for higher education abroad.",
    documentsRequired: [
      "UDID Card / Disability Certificate",
      "Aadhaar Card",
      "Academic Certificates",
      "Admission / Offer Letter"
    ],
    applyLink: "https://depwd.gov.in/en/national-overseas-scholarship-2/"
  },

  {
    title: "Free Coaching for Students with Disabilities",
    description:
      "Provides coaching support for students with disabilities preparing for recruitment examinations and entrance examinations.",
    disabilityType: "visual",
    eligibility: [
      "Indian Citizen",
      "Student with benchmark disability",
      "Valid Disability Certificate / UDID",
      "Eligible for competitive or entrance examinations"
    ],
    benefits:
      "Free coaching and examination preparation support.",
    documentsRequired: [
      "UDID Card / Disability Certificate",
      "Aadhaar Card",
      "Educational Certificates",
      "Income Certificate"
    ],
    applyLink: "https://depwd.gov.in/en/scholarship/"
  },

  {
    title: "National Action Plan for Skill Development of PwDs (NAP-SDP)",
    description:
      "Provides skill development and vocational training opportunities for persons with disabilities to improve employment opportunities.",
    disabilityType: "visual",
    eligibility: [
      "Person with Disability",
      "Valid Disability Certificate / UDID",
      "Eligible for skill development training"
    ],
    benefits:
      "Skill training, vocational development and employment support.",
    documentsRequired: [
      "UDID Card / Disability Certificate",
      "Aadhaar Card",
      "Educational Certificates"
    ],
    applyLink: "https://depwd.gov.in/en/skill-development-of-pwds/"
  },

  {
    title: "Deendayal Divyangjan Rehabilitation Scheme (DDRS)",
    description:
      "Supports rehabilitation services for persons with disabilities through organizations and rehabilitation projects.",
    disabilityType: "visual",
    eligibility: [
      "Persons with disabilities",
      "Eligible rehabilitation beneficiaries",
      "Valid Disability Certificate where applicable"
    ],
    benefits:
      "Rehabilitation, education, training and support services through approved organizations.",
    documentsRequired: [
      "Disability Certificate / UDID Card",
      "Aadhaar Card",
      "Relevant Educational or Medical Documents"
    ],
    applyLink: "https://depwd.gov.in/en/ddrs/"
  },


  // ================= COGNITIVE =================

  {
    title: "Niramaya Health Insurance Scheme",
    description:
      "Provides affordable health insurance support for eligible persons covered under the National Trust Act.",
    disabilityType: "cognitive",
    eligibility: [
      "Person covered under the National Trust Act",
      "Eligible disability category",
      "Valid Disability Certificate"
    ],
    benefits:
      "Health insurance coverage including medical treatment, hospitalization and therapies.",
    documentsRequired: [
      "Disability Certificate",
      "Aadhaar Card",
      "Identity Proof",
      "National Trust Registration Documents"
    ],
    applyLink: "https://nationaltrust.nic.in/about-niramaya/"
  },

  {
    title: "Disha Scheme",
    description:
      "Early intervention and school readiness support for children with eligible developmental disabilities.",
    disabilityType: "cognitive",
    eligibility: [
      "Child with eligible National Trust disability",
      "Age generally up to 10 years",
      "Valid Disability Certificate"
    ],
    benefits:
      "Early intervention, therapy, training and school readiness support.",
    documentsRequired: [
      "Disability Certificate",
      "Birth Certificate",
      "Aadhaar Card",
      "Income / BPL Certificate where applicable"
    ],
    applyLink: "https://nationaltrust.nic.in/disha-scheme/"
  },

  {
    title: "Vikaas Scheme",
    description:
      "Day-care support for persons with eligible developmental disabilities focusing on interpersonal, vocational and functional skills.",
    disabilityType: "cognitive",
    eligibility: [
      "Person with eligible National Trust disability",
      "Valid Disability Certificate",
      "Eligible for Vikaas Centre services"
    ],
    benefits:
      "Day-care services, skill development, training and support.",
    documentsRequired: [
      "Disability Certificate",
      "Aadhaar Card",
      "Income / BPL Certificate where applicable",
      "Parent / Guardian ID"
    ],
    applyLink: "https://nationaltrust.nic.in/vikaas-scheme/"
  },

  {
    title: "Samarth Scheme",
    description:
      "Residential and respite care support for persons with eligible developmental disabilities.",
    disabilityType: "cognitive",
    eligibility: [
      "Person with eligible National Trust disability",
      "Valid Disability Certificate",
      "Eligible for Samarth Centre services"
    ],
    benefits:
      "Residential care, support services and a safe living environment.",
    documentsRequired: [
      "Disability Certificate",
      "Birth / Date of Birth Proof",
      "Aadhaar Card",
      "Income / BPL Certificate"
    ],
    applyLink: "https://nationaltrust.nic.in/samarth-scheme/"
  },

  {
    title: "Gharaunda Scheme",
    description:
      "Group home and lifelong care support for adults with eligible developmental disabilities.",
    disabilityType: "cognitive",
    eligibility: [
      "Adult with eligible National Trust disability",
      "Valid Disability Certificate",
      "Eligible for Gharaunda Centre services"
    ],
    benefits:
      "Residential care, lifelong shelter, vocational and pre-vocational support.",
    documentsRequired: [
      "Disability Certificate",
      "Birth / Date of Birth Proof",
      "Aadhaar Card",
      "Parent / Guardian ID"
    ],
    applyLink: "https://nationaltrust.nic.in/gharaunda-scheme/"
  },

  {
    title: "Local Level Committee (LLC) - Legal Guardianship",
    description:
      "Provides a legal framework and process for guardianship support for eligible persons under the National Trust Act.",
    disabilityType: "cognitive",
    eligibility: [
      "Person covered under eligible National Trust disabilities",
      "Valid Disability Certificate",
      "Guardianship requirement"
    ],
    benefits:
      "Legal guardianship support and assistance through the Local Level Committee.",
    documentsRequired: [
      "Disability Certificate",
      "Identity Proof",
      "Address Proof",
      "Required Guardianship Documents"
    ],
    applyLink: "https://nationaltrust.nic.in/local-level-committee-llc/"
  },

  {
    title: "ADIP Scheme - TLM and MSIED Kits",
    description:
      "Provides appropriate aids and appliances including teaching and learning material and support kits for eligible persons with disabilities.",
    disabilityType: "cognitive",
    eligibility: [
      "Person with eligible disability",
      "Valid Disability Certificate / UDID",
      "Meets applicable ADIP requirements"
    ],
    benefits:
      "Teaching and learning materials, assistive devices and educational support.",
    documentsRequired: [
      "UDID Card / Disability Certificate",
      "Aadhaar Card",
      "Income Certificate"
    ],
    applyLink: "https://depwd.gov.in/en/adip-scheme/"
  },

  {
    title: "Scholarship Scheme for Students with Disabilities",
    description:
      "Government scholarship support for eligible students with disabilities under the DEPwD scholarship framework.",
    disabilityType: "cognitive",
    eligibility: [
      "Indian Citizen",
      "Student with benchmark disability",
      "Valid Disability Certificate / UDID",
      "Meets the applicable scholarship requirements"
    ],
    benefits:
      "Financial assistance for education and related educational expenses.",
    documentsRequired: [
      "UDID Card / Disability Certificate",
      "Aadhaar Card",
      "Income Certificate",
      "Educational Certificates"
    ],
    applyLink: "https://depwd.gov.in/en/scholarship/"
  },

  {
    title: "Deendayal Divyangjan Rehabilitation Scheme (DDRS)",
    description:
      "Supports rehabilitation projects and services for persons with disabilities including intellectual, developmental, hearing and visual disabilities.",
    disabilityType: "cognitive",
    eligibility: [
      "Person with disability",
      "Eligible rehabilitation beneficiary",
      "Valid Disability Certificate where applicable"
    ],
    benefits:
      "Rehabilitation, education, training and support services through approved organizations.",
    documentsRequired: [
      "Disability Certificate / UDID Card",
      "Aadhaar Card",
      "Relevant Educational or Medical Documents"
    ],
    applyLink: "https://depwd.gov.in/en/ddrs/"
  },

  {
    title: "National Action Plan for Skill Development of PwDs (NAP-SDP)",
    description:
      "Provides skill development and vocational training opportunities for persons with disabilities.",
    disabilityType: "cognitive",
    eligibility: [
      "Person with Disability",
      "Valid Disability Certificate / UDID",
      "Eligible for skill development training"
    ],
    benefits:
      "Skill training, vocational development and employment support.",
    documentsRequired: [
      "UDID Card / Disability Certificate",
      "Aadhaar Card",
      "Educational Certificates"
    ],
    applyLink: "https://depwd.gov.in/en/skill-development-of-pwds/"
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
    applyLink: "https://depwd.gov.in/en/adip-scheme/"
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