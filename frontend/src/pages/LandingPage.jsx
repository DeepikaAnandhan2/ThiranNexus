import React from 'react';
import Navbar from '../components/Navbar';
import '../styles/LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      <Navbar />
      
      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Digital Transformation for Future Learners</h1>
          <p>
            Bridging the gap between education and industry. Register today to access 
            exclusive government-backed schemes and skill development programs.
          </p>
        </div>
      </header>

      {/* Services Grid */}
      <section className="services-section">
        <div className="section-title">
          <h2>Available Services</h2>
          <div className="underline"></div>
        </div>
        
        <div className="services-grid">
          <div className="service-card">
            <div className="icon-box">🎓</div>
            <h3>Skill Development</h3>
            <p>Access advanced modules in Java, React, and Full-stack development.</p>
          </div>
          <div className="service-card">
            <div className="icon-box">💰</div>
            <h3>Innovation Grants</h3>
            <p>Apply for funding for your tech projects and educational goals.</p>
          </div>
          <div className="service-card">
            <div className="icon-box">📊</div>
            <h3>Progress Tracking</h3>
            <p>Real-time dashboard for parents and students to monitor growth.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;