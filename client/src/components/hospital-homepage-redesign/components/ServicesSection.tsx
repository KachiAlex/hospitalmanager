import React, { useMemo } from 'react';
import { ServicesSectionProps } from '../types';
import './ServicesSection.css';

const ServicesSection: React.FC<ServicesSectionProps & {
  onServiceSelect?: (serviceId: string) => void;
}> = ({ heading, subheading, services, onServiceSelect }) => {
  const topServices = useMemo(() => services.slice(0, 3), [services]);

  return (
    <section id="services" className="redesign-section redesign-services-section">
      <div className="redesign-container">
        <div className="redesign-section-header">
          <span className="redesign-eyebrow-text">Medical Excellence</span>
          <h2 className="redesign-heading-2">{heading}</h2>
          <p className="redesign-body-lg">{subheading}</p>
        </div>

        <div className="redesign-services-grid">
          {topServices.map((service) => (
            <article
              key={service.id}
              className="redesign-service-card"
              onClick={() => onServiceSelect?.(service.id)}
            >
              <div className="redesign-service-image-frame">
                <img
                  src={service.image.src}
                  alt={service.image.alt}
                  width={service.image.width}
                  height={service.image.height}
                />
                <div className="redesign-service-image-overlay" />
                <span className="redesign-service-badge">{service.title}</span>
              </div>

              <div className="redesign-service-content">
                <h3 className="redesign-heading-4">{service.title}</h3>
                <p className="redesign-body-base">{service.description}</p>

                <ul className="redesign-service-features">
                  {service.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>

                <button 
                  className="redesign-btn redesign-btn-primary redesign-btn-ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onServiceSelect?.(service.id);
                  }}
                >
                  Explore Service
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
