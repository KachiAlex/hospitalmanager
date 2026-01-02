import React from 'react';
import { HeroContent } from '../types';

interface HeroSectionProps {
  content: HeroContent;
  onBookAppointment: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ content, onBookAppointment }) => {
  return (
    <section id="hero" className="redesign-hero redesign-bg-blue-gradient redesign-section">
      <div className="redesign-container">
        <div className="redesign-grid redesign-hero-grid">
          <div className="redesign-hero-content">
            <h1 className="redesign-heading-1 redesign-text-white redesign-hero-headline">
              {content.headline}
            </h1>
            <h2 className="redesign-heading-4 redesign-text-white redesign-hero-subheadline">
              {content.subheadline}
            </h2>
            <p className="redesign-body-large redesign-text-white redesign-hero-description">
              {content.description}
            </p>
            <button 
              className="redesign-btn redesign-btn-emergency redesign-btn-large redesign-hero-cta"
              onClick={onBookAppointment}
              aria-label="Book an appointment with Thappy Home Hospital"
            >
              {content.ctaText}
            </button>
          </div>
          <div className="redesign-hero-image">
            <img 
              src={content.heroImage.src}
              alt={content.heroImage.alt}
              className="redesign-img-responsive redesign-hero-img"
              width={content.heroImage.width}
              height={content.heroImage.height}
              loading={content.heroImage.loading}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;