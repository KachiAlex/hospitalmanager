import React from 'react';
import { Feature } from '../types';
import { getIcon } from '../utils/iconMap';
import './WhyChooseUsSection.css';

interface WhyChooseUsSectionProps {
  features: Feature[];
}

const FeaturePoint: React.FC<{ feature: Feature }> = ({ feature }) => {
  return (
    <div className="feature-point">
      <div className="feature-icon">
        {getIcon(feature.iconName, { size: 32, className: 'icon' })}
      </div>
      <div className="feature-content">
        <h3 className="feature-title">{feature.title}</h3>
        <p className="feature-description">{feature.description}</p>
      </div>
    </div>
  );
};

const WhyChooseUsSection: React.FC<WhyChooseUsSectionProps> = ({ features }) => {
  return (
    <section className="hospital-homepage why-choose-us-section section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Why Choose CareWell Medical Center?</h2>
          <p className="section-subtitle">
            We are committed to providing exceptional healthcare with a focus on patient care and medical excellence
          </p>
        </div>
        
        <div className="features-grid grid grid-cols-2">
          {features.map((feature) => (
            <FeaturePoint key={feature.id} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;