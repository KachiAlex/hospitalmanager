import React, { useState } from 'react';
import { HeroSectionProps } from '../types';
import './HeroSection.css';

const HeroSection: React.FC<HeroSectionProps> = ({
  headline,
  supportingText,
  heroImage,
  onBookAppointment,
  onContactUs
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true); // Still show content even if image fails
  };

  return (
    <section className="hospital-homepage hero-section">
      <div className="hero-background">
        {!imageLoaded && !imageError && (
          <div className="hero-image-placeholder" aria-hidden="true">
            <div className="loading-spinner"></div>
          </div>
        )}
        
        {!imageError && (
          <img 
            src={heroImage} 
            alt="Doctors and medical staff providing quality healthcare" 
            className={`hero-image ${imageLoaded ? 'loaded' : 'loading'}`}
            loading="eager"
            onLoad={handleImageLoad}
            onError={handleImageError}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
            srcSet={`
              ${heroImage}?w=768 768w,
              ${heroImage}?w=1200 1200w,
              ${heroImage}?w=1920 1920w
            `}
          />
        )}
        
        {imageError && (
          <div className="hero-image-fallback" aria-hidden="true">
            <div className="fallback-content">
              <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
              <p>Healthcare Excellence</p>
            </div>
          </div>
        )}
        
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