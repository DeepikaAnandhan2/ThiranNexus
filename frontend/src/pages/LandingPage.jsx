import React from 'react';
import { Link } from 'react-router-dom';
import { FaRocket, FaUsers, FaBookOpen, FaAward, FaArrowRight, FaPlay, FaStar, FaCheckCircle } from 'react-icons/fa';
import accessibilityEducationImage from '../assets/learning2.png';
import '../styles/LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <nav className="nav">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-text">ThiranNexus</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <Link to="/login" className="nav-btn">Login</Link>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Digital Transformation for
              <span className="gradient-text"> Future Learners</span>
            </h1>
            <p className="hero-subtitle">
              Bridging the gap between education and industry. Register today to access exclusive government-backed schemes and skill development programs.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn-primary">
                Start Inclusive Learning
                <FaArrowRight className="btn-icon" />
              </Link>
              <button className="btn-secondary">
                <FaPlay className="btn-icon" />
                Watch Accessibility Demo
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-card">
              <img src={accessibilityEducationImage} alt="Students with hearing and visual impairments engaging in accessible education through screen readers, braille displays, and adaptive learning technologies" className="hero-main-image" />
            </div>
          </div>
        </div>
        <div className="hero-bg-pattern"></div>
      </section>

      <section id="features" className="features">
        <div className="features-container">
          <div className="section-header">
            <h2>Accessibility-First Education</h2>
            <p>Comprehensive accessibility features designed specifically for hearing and visually impaired students</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FaBookOpen />
              </div>
              <h3>Screen Reader Compatible</h3>
              <p>Full compatibility with popular screen readers including JAWS, NVDA, and VoiceOver</p>
              <ul className="feature-list">
                <li><FaCheckCircle /> ARIA labels and landmarks</li>
                <li><FaCheckCircle /> Semantic HTML structure</li>
                <li><FaCheckCircle /> Keyboard navigation support</li>
              </ul>
            </div>

            <div className="feature-card featured">
              <div className="feature-badge">Most Popular</div>
              <div className="feature-icon">
                <FaAward />
              </div>
              <h3>Multi-Modal Learning</h3>
              <p>Content delivered through multiple formats - audio, text, braille, and sign language</p>
              <ul className="feature-list">
                <li><FaCheckCircle /> Text-to-speech integration</li>
                <li><FaCheckCircle /> Audio descriptions</li>
                <li><FaCheckCircle /> Visual and audio alternatives</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FaUsers />
              </div>
              <h3>Adaptive Interface</h3>
              <p>Customizable interface that adapts to individual accessibility needs and preferences</p>
              <ul className="feature-list">
                <li><FaCheckCircle /> High contrast modes</li>
                <li><FaCheckCircle /> Font size adjustment</li>
                <li><FaCheckCircle /> Color scheme options</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials">
        <div className="testimonials-container">
          <div className="section-header">
            <h2>Empowering Every Learner</h2>
            <p>Stories from students who found accessible education through ThiranNexus</p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-stars">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="star" />
                ))}
              </div>
              <p className="testimonial-text">
                "As a visually impaired student, ThiranNexus changed everything for me. The screen reader compatibility
                and audio descriptions made complex subjects accessible. I finally feel included in education."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">S</div>
                <div className="author-info">
                  <h4>Sarah Johnson</h4>
                  <span>Computer Science Student</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-stars">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="star" />
                ))}
              </div>
              <p className="testimonial-text">
                "The multi-modal learning approach is incredible. As someone who is hard of hearing, having both
                visual and text-based content alongside audio options means I can learn in ways that work for me."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">M</div>
                <div className="author-info">
                  <h4>Mike Chen</h4>
                  <span>Engineering Student</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-stars">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="star" />
                ))}
              </div>
              <p className="testimonial-text">
                "The adaptive interface features like high contrast mode and keyboard navigation made it possible
                for me to pursue my education independently. ThiranNexus truly believes in inclusive education."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">A</div>
                <div className="author-info">
                  <h4>Arun Patel</h4>
                  <span>Data Science Student</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="cta-container">
          <div className="cta-content">
            <h2>Education Should Be Accessible to Everyone</h2>
            <p>Join our inclusive learning community where every student, regardless of ability, can achieve their dreams</p>
            <div className="cta-actions">
              <Link to="/register" className="btn-primary">
                Start Your Accessible Journey
                <FaArrowRight className="btn-icon" />
              </Link>
              <Link to="/education" className="btn-secondary">
                Explore Inclusive Courses
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="logo-text">ThiranNexus</span>
              <p>Creating accessible education for all students, breaking down barriers and building inclusive learning experiences for hearing and visually impaired learners worldwide.</p>
            </div>
            <div className="footer-links">
              <div className="footer-section">
                <h4>Platform</h4>
                <a href="#courses">Courses</a>
                <a href="#schemes">Schemes</a>
                <a href="#community">Community</a>
              </div>
              <div className="footer-section">
                <h4>Support</h4>
                <a href="#help">Help Center</a>
                <a href="#contact">Contact Us</a>
                <a href="#feedback">Feedback</a>
              </div>
              <div className="footer-section">
                <h4>Company</h4>
                <a href="#about">About</a>
                <a href="#careers">Careers</a>
                <a href="#press">Press</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 ThiranNexus. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;