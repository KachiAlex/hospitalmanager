import React from 'react';
import { HeroSectionProps } from '../types';
import './HeroSection.css';

const HeroSection: React.FC<HeroSectionProps> = ({
  headline,
  supportingText,
  heroImage,
  onBookAppointment,
  onContactUs
}) => {
  return (
    <section className="hospital-homepage hero-section">
      <div className="hero-background">
        <img 
          src={heroImage} 
          alt="Doctors and medical staff providing quality healthcare" 
          className="hero-image"
          loading="eager"
        />
        <div className="hero-overlay"></div>
      </div>
      
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-headline">{headline}</h1>
            <p className="hero-supporting-text">{supportingText}</p>
            
            <div className="hero-actions">
              <button 
                className="btn btn-primary hero-primary-btn"
                onClick={onBookAppointment}
                aria-label="Book an appointment with our medical professionals"
              >
                Book Appointment
              </button>
              <button 
                className="btn btn-secondary hero-secondary-btn"
                onClick={onContactUs}
                aria-label="Contact us for more information"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;