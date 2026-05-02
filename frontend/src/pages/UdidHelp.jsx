import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/UDIDHelp.css";

const videoGuides = [
  {
    id: 1,
    title: "How to Apply for UDID Card (Full Process)",
    url: "https://www.youtube.com/embed/UEKdpNi9K-c",
  },
  {
    id: 2,
    title: "Documents Required & Eligibility",
    url: "https://www.youtube.com/embed/VQFv8Ukk2RA",
  },
  {
    id: 3,
    title: "Tracking your UDID Status",
    url: "https://www.youtube.com/embed/7hyd5CWXFDo",
  }
];

export default function UDIDHelp() {
  const navigate = useNavigate();

  return (
    <div className="help-page-wrapper">
      <header className="help-header">
        <button className="back-to-reg" onClick={() => navigate("/register")}>
          ← Back to Registration
        </button>
        <h1 className="help-title">UDID Enrollment Guidance</h1>
        <p className="help-subtitle">Follow these steps to obtain your Unique Disability ID.</p>
      </header>

      <main className="help-content-container">
        {/* STEP BY STEP SECTION */}
        <section className="white-box-section help-steps">
          <h3 className="box-title-accent">Quick Application Steps</h3>
          <div className="steps-grid">
            <div className="step-card">
              <span className="step-num">01</span>
              <p>Visit the official Swavlamban Card portal.</p>
            </div>
            <div className="step-card">
              <span className="step-num">02</span>
              <p>Register and fill out the personal & disability details.</p>
            </div>
            <div className="step-card">
              <span className="step-num">03</span>
              <p>Upload required documents (Photo, ID, Disability Cert).</p>
            </div>
            <div className="step-card">
              <span className="step-num">04</span>
              <p>Submit and note down your Enrollment Number.</p>
            </div>
          </div>
          <div className="portal-action">
            <a href="https://www.swavlambancard.gov.in/" target="_blank" rel="noreferrer" className="portal-btn">
              Open Official Government Portal
            </a>
          </div>
        </section>

        {/* VIDEO TUTORIALS SECTION */}
        <section className="white-box-section help-videos">
          <h3 className="box-title-accent">Video Tutorials</h3>
          <div className="video-grid">
            {videoGuides.map((video) => (
              <div key={video.id} className="video-card">
                <div className="video-responsive">
                  <iframe
                    width="100%"
                    height="200"
                    src={video.url}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="video-info">
                  <h4>{video.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}