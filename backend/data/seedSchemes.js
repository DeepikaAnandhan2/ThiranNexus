const Scheme = require("../models/Scheme");

const seedSchemes = async () => {
  const count = await Scheme.countDocuments();
  if (count > 0) return;

  await Scheme.insertMany([
    // Visual Impairment (VIS/Visual)
    {
      title: "Vision Assistance Scheme",
      description: "Provides financial and medical support for visually impaired individuals. Helps in improving vision accessibility and daily life support.",
      disabilityType: "Visual",
      eligibility: ["Visual impairment", "Income below threshold"],
      benefits: "Free glasses and eye checkups",
      documentsRequired: ["Aadhar Card", "Education Certificate", "Disability Certificate"],
      startDate: "2026-04-01",
      lastDate: "2026-12-31",
      applyLink: "https://www.nhp.gov.in/"
    },
    {
      title: "National Scholarship for Visually Impaired",
      description: "Scholarship program for blind students pursuing school education.",
      disabilityType: "Visual",
      eligibility: ["Class 8-12", "Blind students"],
      benefits: "₹750-2000 per month",
      documentsRequired: ["Aadhar Card", "Disability Certificate", "School ID"],
      startDate: "2026-04-01",
      lastDate: "2026-10-31",
      applyLink: "https://www.scholarships.gov.in/"
    },
    {
      title: "Digital Accessibility Initiative",
      description: "Provides assistive technologies like screen readers and accessibility tools for visually impaired users.",
      disabilityType: "Visual",
      eligibility: ["Low vision", "Blind"],
      benefits: "Free software tools",
      documentsRequired: ["Aadhar Card", "Disability Certificate"],
      startDate: "2026-05-01",
      lastDate: "2026-11-15",
      applyLink: "https://www.digitalindia.gov.in/"
    },

    // Hearing Impairment (HEA/Hearing)
    {
      title: "Hearing Aid Support",
      description: "Offers financial assistance for purchasing hearing aids and improving communication ability.",
      disabilityType: "Hearing",
      eligibility: ["Hearing disability"],
      benefits: "Free hearing devices",
      documentsRequired: ["Aadhar Card", "Medical Certificate"],
      startDate: "2026-04-10",
      lastDate: "2026-12-01",
      applyLink: "https://www.nhp.gov.in/"
    },
    {
      title: "Speech Therapy Scheme",
      description: "Provides speech therapy sessions for individuals with hearing and speech impairments.",
      disabilityType: "Hearing",
      eligibility: ["Speech impairment", "Hearing impairment"],
      benefits: "Free therapy sessions",
      documentsRequired: ["Medical Report", "Disability Certificate"],
      startDate: "2026-02-01",
      lastDate: "2026-09-15",
      applyLink: "https://www.nhp.gov.in/"
    },
    {
      title: "Free Bus Pass - Disabled Students",
      description: "Free bus passes for hearing impaired students for commuting to educational institutions.",
      disabilityType: "Hearing",
      eligibility: ["TN Resident", "Student"],
      benefits: "Free bus travel",
      documentsRequired: ["Student ID", "Disability Certificate"],
      startDate: "2026-01-01",
      lastDate: "2026-12-31",
      applyLink: "https://www.tn.gov.in/"
    },

    // Cognitive Disability (COG/Cognitive)
    {
      title: "Cognitive Support Program",
      description: "Provides skill development and financial support for people with cognitive disabilities.",
      disabilityType: "Cognitive",
      eligibility: ["Cognitive disability"],
      benefits: "Training + stipend",
      documentsRequired: ["Aadhar Card", "Medical Certificate"],
      startDate: "2026-01-15",
      lastDate: "2026-08-10",
      applyLink: "https://www.nhp.gov.in/"
    },
    {
      title: "Autism Care Scheme",
      description: "Offers therapy and financial assistance for individuals with autism spectrum disorders.",
      disabilityType: "Cognitive",
      eligibility: ["Autism"],
      benefits: "Therapy support",
      documentsRequired: ["Doctor Report", "Disability Certificate"],
      startDate: "2026-03-01",
      lastDate: "2026-12-01",
      applyLink: "https://www.nhp.gov.in/"
    },
    {
      title: "Learning Disability Assistance",
      description: "Supports students with dyslexia and ADHD through special education programs.",
      disabilityType: "Cognitive",
      eligibility: ["Dyslexia", "ADHD"],
      benefits: "Education support",
      documentsRequired: ["School Certificate", "Medical Report"],
      startDate: "2026-04-01",
      lastDate: "2026-11-01",
      applyLink: "https://www.education.gov.in/"
    },

    // Physical Disability (PHY/Physical)
    {
      title: "Physical Disability Welfare Scheme",
      description: "Financial assistance for physically challenged individuals for mobility aids and daily needs.",
      disabilityType: "Physical",
      eligibility: ["Physical disability", "Orthopedic impairment"],
      benefits: "Monthly allowance + aids",
      documentsRequired: ["Aadhar Card", "Disability Certificate"],
      startDate: "2026-01-01",
      lastDate: "2026-12-31",
      applyLink: "https://www.nhp.gov.in/"
    },
    {
      title: "Assistive Technology Grant",
      description: "Grant for purchasing wheelchairs, prosthetics, and other mobility devices.",
      disabilityType: "Physical",
      eligibility: ["Mobility impairment"],
      benefits: "Up to ₹25,000",
      documentsRequired: ["Medical Certificate", "Aadhar Card"],
      startDate: "2026-04-01",
      lastDate: "2026-10-31",
      applyLink: "https://www.socialjustice.nic.in/"
    },

    // Multiple/General (All disabilities)
    {
      title: "National Scholarship for Disabled Students",
      description: "Central Government scholarship for students with disabilities.",
      disabilityType: "All",
      eligibility: ["Class 1 to PhD", "Income below threshold"],
      benefits: "₹1000-2500 per month",
      documentsRequired: ["Aadhar Card", "Income Certificate", "Disability Certificate"],
      startDate: "2026-04-01",
      lastDate: "2026-11-30",
      applyLink: "https://www.scholarships.gov.in/"
    },
    {
      title: "Tamil Nadu Disability Welfare Scheme",
      description: "State Government scheme for persons with disabilities in Tamil Nadu.",
      disabilityType: "All",
      eligibility: ["TN Resident", "Disability Certificate"],
      benefits: "Monthly pension + medical benefits",
      documentsRequired: ["Aadhar Card", "Disability Certificate", "Residence Proof"],
      startDate: "2026-01-01",
      lastDate: "2026-12-31",
      applyLink: "https://www.tn.gov.in/"
    },
    {
      title: "PG Scholarship for Disabled Students",
      description: "Scholarship for disabled students pursuing post-graduation.",
      disabilityType: "All",
      eligibility: ["Post-graduation", "Income below 2.5L"],
      benefits: "₹2000 per month",
      documentsRequired: ["Aadhar Card", "Income Certificate", "Disability Certificate"],
      startDate: "2026-06-01",
      lastDate: "2026-09-30",
      applyLink: "https://www.scholarships.gov.in/"
    }

  ]);

  console.log("✅ Schemes seeded successfully");
};

module.exports = seedSchemes;
