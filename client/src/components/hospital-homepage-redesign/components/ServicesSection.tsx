import React from 'react';
import { ServicesContent } from '../types';

interface ServicesSectionProps {
  content: ServicesContent;
  onServiceSelect?: (serviceId: string) => void;
}

const ServicesSection: React.FC<ServicesSectionProps> = ({ content, onServiceSelect }) => {
  return (
    <section id="services" className="redesign-section redesign-bg-light">
      <div className="redesign-container">
        <div className="redesign-section-header" style={{ textAlign: 'center', marginBottom: 'var(--redesign-spacing-2xl)' }}>
          <p className="redesign-eyebrow">{content.subheading}</p>
          <h2 className="redesign-heading-2" style={{ marginBottom: 'var(--redesign-spacing-base)' }}>
            {content.heading}
          </h2>
          <p className="redesign-body-base redesign-text-secondary" style={{ maxWidth: 720, margin: '0 auto' }}>
            Select from our comprehensive list of specialized medical services designed for every stage of care.
          </p>
        </div>

        <div className="redesign-grid redesign-services-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--redesign-spacing-2xl)' }}>
          {content.services.map((service) => (
            <article key={service.id} className="redesign-card redesign-card-elevated redesign-fade-in">
              <div className="redesign-card-media">
                <img
                  src={service.image.src}
                  alt={service.image.alt}
                  width={service.image.width}
                  height={service.image.height}
                  loading={service.image.loading || 'lazy'}
                  className="redesign-img-responsive redesign-radius-lg"
                />
              </div>
              <div className="redesign-card-content">
                <h3 className="redesign-heading-4">{service.title}</h3>
                <p className="redesign-body-base redesign-text-secondary">{service.description}</p>
                <ul className="redesign-list redesign-list-check">
                  {service.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>
              {onServiceSelect && (
                <button
                  className="redesign-btn redesign-btn-outline"
                  onClick={() => onServiceSelect(service.id)}
                  aria-label={`Learn more about ${service.title}`}
                >
                  Learn more
                </button>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
