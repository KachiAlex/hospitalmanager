import React from 'react';
import { AboutContent } from '../types';

interface AboutSectionProps {
  content: AboutContent;
  onLearnMore: () => void;
}

const AboutSection: React.FC<AboutSectionProps> = ({ content, onLearnMore }) => {
  return (
    <section id="about" className="redesign-about redesign-section redesign-bg-light">
      <div className="redesign-container">
        <div className="redesign-grid redesign-about-grid">
          <div className="redesign-about-image">
            <img 
              src={content.facilityImage.src}
              alt={content.facilityImage.alt}
              className="redesign-img-responsive redesign-about-img"
              width={content.facilityImage.width}
              height={content.facilityImage.height}
              loading={content.facilityImage.loading}
            />
          </div>
          <div className="redesign-about-content">
            <h2 className="redesign-heading-2 redesign-about-heading">
              {content.heading}
            </h2>
            <h3 className="redesign-heading-5 redesign-text-secondary redesign-about-subheading">
              {content.subheading}
            </h3>
            <p className="redesign-body-large redesign-about-description">
              {content.description}
            </p>
            <div className="redesign-specializations">
              <h4 className="redesign-heading-6 redesign-specializations-title">
                Our Specializations:
              </h4>
              <ul className="redesign-specializations-list">
                {content.specializations.map((spec, index) => (
                  <li key={index} className="redesign-body-base redesign-specialization-item">
                    <span className="redesign-specialization-icon">✓</span>
                    {spec}
                  </li>
                ))}
              </ul>
            </div>
            <button 
              className="redesign-btn redesign-btn-primary redesign-about-cta"
              onClick={onLearnMore}
              aria-label="Learn more about Thappy Home Hospital services"
            >
              {content.ctaText}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;