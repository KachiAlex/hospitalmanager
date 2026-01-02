import React from 'react';
import { ContactSectionProps } from '../types';
import { getIcon } from '../utils/iconMap';
import './ContactSection.css';

const ContactSection: React.FC<ContactSectionProps> = ({ contactInfo, id }) => {
  return (
    <section className="hospital-homepage contact-section section" id={id}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Get In Touch</h2>
          <p className="section-subtitle">
            Contact us today to schedule an appointment or learn more about our services
          </p>
        </div>
        
        <div className="contact-content">
          <div className="contact-info">
            <div className="contact-item">
              <div className="contact-icon">
                {getIcon('FaMapMarkerAlt', { size: 24, className: 'icon' })}
              </div>
              <div className="contact-details">
                <h3 className="contact-label">Address</h3>
                <p className="contact-value">{contactInfo.address}</p>
              </div>
            </div>
            
            <div className="contact-item">
              <div className="contact-icon">
                {getIcon('FaPhone', { size: 24, className: 'icon' })}
              </div>
              <div className="contact-details">
                <h3 className="contact-label">Phone</h3>
                <p className="contact-value">
                  <a href={`tel:${contactInfo.phone}`} className="contact-link">
                    {contactInfo.phone}
                  </a>
                </p>
              </div>
            </div>
            
            <div className="contact-item">
              <div className="contact-icon">
                {getIcon('FaEnvelope', { size: 24, className: 'icon' })}
              </div>
              <div className="contact-details">
                <h3 className="contact-label">Email</h3>
                <p className="contact-value">
                  <a href={`mailto:${contactInfo.email}`} className="contact-link">
                    {contactInfo.email}
                  </a>
                </p>
              </div>
            </div>
          </div>
          
          <div className="map-container">
            {contactInfo.mapEmbedUrl ? (
              <iframe
                src={contactInfo.mapEmbedUrl}
                className="map-embed"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Hospital Location Map"
                aria-label="Interactive map showing hospital location"
              ></iframe>
            ) : (
              <div className="map-placeholder">
                <div className="map-placeholder-content">
                  {getIcon('FaMapMarkerAlt', { size: 48, className: 'placeholder-icon' })}
                  <p className="placeholder-text">Map Location</p>
                  <p className="placeholder-address">{contactInfo.address}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;