const Scheme = require("../models/Scheme");

const seedSchemes = async () => {
  const count = await Scheme.countDocuments();
  if (count > 0) return;

  await Scheme.insertMany([

    // VIS (3 schemes)
    {
      title: "Vision Assistance Scheme",
      description: "Provides financial and medical support for visually impaired individuals. Helps in improving vision accessibility and daily life support.",
      disabilityType: "VIS",
      eligibility: ["Visual impairment"],
      benefits: "Free glasses and eye checkups",
      documentsRequired: ["Aadhar Card", "Education Certificate", "Disability Certificate"],
      startDate: "2026-04-01",
      lastDate: "2026-12-31",
      applyLink: "https://www.inclusivetechindia.in/schemes"
    },
    {
      title: "Braille Education Program",
      description: "Supports blind students by providing Braille learning materials and training programs to enhance education opportunities.",
      disabilityType: "VIS",
      eligibility: ["Blind students"],
      benefits: "Free Braille books",
      documentsRequired: ["Aadhar Card", "Student ID", "Disability Certificate"],
      startDate: "2026-03-01",
      lastDate: "2026-10-30",
      applyLink: "https://www.inclusivetechindia.in/visual-impairment"
    },
    {
      title: "Digital Accessibility Initiative",
      description: "Provides assistive technologies like screen readers and accessibility tools for visually impaired users.",
      disabilityType: "VIS",
      eligibility: ["Low vision"],
      benefits: "Free software tools",
      documentsRequired: ["Aadhar Card", "Disability Certificate"],
      startDate: "2026-05-01",
      lastDate: "2026-11-15",
      applyLink: "https://www.inclusivetechindia.in/schemes/accessible-india"
    },

    // HEA (3 schemes)
    {
      title: "Hearing Aid Support",
      description: "Offers financial assistance for purchasing hearing aids and improving communication ability.",
      disabilityType: "HEA",
      eligibility: ["Hearing disability"],
      benefits: "Free hearing devices",
      documentsRequired: ["Aadhar Card", "Medical Certificate"],
      startDate: "2026-04-10",
      lastDate: "2026-12-01",
      applyLink: "https://earmart.in/list-of-government-schemes-for-hearing-impaired-in-india/"
    },
    {
      title: "Speech Therapy Scheme",
      description: "Provides speech therapy sessions for individuals with hearing and speech impairments.",
      disabilityType: "HEA",
      eligibility: ["Speech impairment"],
      benefits: "Free therapy",
      documentsRequired: ["Medical Report"],
      startDate: "2026-02-01",
      lastDate: "2026-09-15",
      applyLink: "https://earmart.in/list-of-government-schemes-for-hearing-impaired-in-india/"
    },
    {
      title: "Assistive Listening Devices",
      description: "Supports individuals with advanced hearing devices to improve communication and daily activities.",
      disabilityType: "HEA",
      eligibility: ["Hearing loss"],
      benefits: "Subsidized equipment",
      documentsRequired: ["Aadhar Card", "Medical Certificate"],
      startDate: "2026-06-01",
      lastDate: "2026-12-20",
      applyLink: "https://delhi.nalsa.gov.in/schemes-for-the-welfare-of-children-with-disabilities-run-by-department-of-social-welfare-gnctd/"
    },

    // COG (3 schemes)
    {
      title: "Cognitive Support Program",
      description: "Provides skill development and financial support for people with cognitive disabilities.",
      disabilityType: "COG",
      eligibility: ["Cognitive disability"],
      benefits: "Training + stipend",
      documentsRequired: ["Aadhar Card", "Medical Certificate"],
      startDate: "2026-01-15",
      lastDate: "2026-08-10",
      applyLink: "https://downsyndrome.in/government-schemes-for-persons-with-intellectual-disabilities/"
    },
    {
      title: "Autism Care Scheme",
      description: "Offers therapy and financial assistance for individuals with autism spectrum disorders.",
      disabilityType: "COG",
      eligibility: ["Autism"],
      benefits: "Therapy support",
      documentsRequired: ["Doctor Report"],
      startDate: "2026-03-01",
      lastDate: "2026-12-01",
      applyLink: "https://www.inclusivetechindia.in/schemes/accessible-india"
    },
    {
      title: "Learning Disability Assistance",
      description: "Supports students with dyslexia and ADHD through special education programs.",
      disabilityType: "COG",
      eligibility: ["Dyslexia", "ADHD"],
      benefits: "Education support",
      documentsRequired: ["School Certificate"],
      startDate: "2026-04-01",
      lastDate: "2026-11-01",
      applyLink: "https://downsyndrome.in/government-schemes-for-persons-with-intellectual-disabilities/"
    }

  ]);

  console.log("✅ Schemes inserted");
};

module.exports = seedSchemes;