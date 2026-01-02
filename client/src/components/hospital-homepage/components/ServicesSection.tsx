import React from 'react';
import { Service } from '../types';
import { getIcon } from '../utils/iconMap';
import './ServicesSection.css';

interface ServicesSectionProps {
  services: Service[];
  id?: string;
}

const ServiceCard: React.FC<{ service: Service }> = ({ service }) => {
  return (
    <div className="service-card card">
      <div className="service-icon">
        {getIcon(service.iconName, { size: 48, className: 'icon' })}
      </div>
      <h3 className="service-title">{service.title}</h3>
      <p className="service-description">{service.description}</p>
    </div>
  );
};

const ServicesSection: React.FC<ServicesSectionProps> = ({ services, id }) => {
  return (
    <section className="hospital-homepage services-section section" id={id}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Our Medical Services</h2>
          <p className="section-subtitle">
            Comprehensive healthcare services designed to meet all your medical needs
          </p>
        </div>
        
        <div className="services-grid grid grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;