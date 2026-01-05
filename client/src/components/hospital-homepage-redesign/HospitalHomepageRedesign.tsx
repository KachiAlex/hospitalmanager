import React, { useEffect, useCallback } from 'react';
import { HospitalHomepageRedesignProps } from './types';
import { defaultRedesignContentManager } from './data/contentManager';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import ServicesSection from './components/ServicesSection';

import './components/HeroSection.css';
import './components/AboutSection.css';
import './styles/medical-branding.css';
import './styles/responsive.css';
import './HospitalHomepageRedesign.css';

const HospitalHomepageRedesign: React.FC<HospitalHomepageRedesignProps> = ({
  onNavigate = (section: string) => console.log(`Navigate to: ${section}`),
  onBookAppointment = () => console.log('Book Appointment clicked'),
  onStaffLogin = () => console.log('Staff Login clicked')
}) => {
  const content = defaultRedesignContentManager.getContent();
  const navigationItems = defaultRedesignContentManager.getDefaultNavigation();

  // Apply medical branding on component mount
  useEffect(() => {
    // Apply CSS custom properties for branding
    const root = document.documentElement;
    const branding = content.branding;
    
    root.style.setProperty('--redesign-primary-blue', branding.colors.primary);
    root.style.setProperty('--redesign-secondary-blue', branding.colors.secondary);
    root.style.setProperty('--redesign-emergency-red', branding.colors.emergency);
    root.style.setProperty('--redesign-background-white', branding.colors.background);
    root.style.setProperty('--redesign-text-primary', branding.colors.text);
  }, [content.branding]);

  // Smooth scrolling for internal navigation
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, []);

  // Enhanced navigation handlers
  const handleNavigation = useCallback((item: any) => {
    if (item.href === '#staff-login') {
      onStaffLogin();
    } else if (item.href?.startsWith('#')) {
      const sectionId = item.href.substring(1);
      scrollToSection(sectionId);
      onNavigate(sectionId);
    } else if (item.href) {
      window.location.href = item.href;
    }
  }, [scrollToSection, onNavigate, onStaffLogin]);

  // Newsletter subscription handler
  const handleNewsletterSubscribe = useCallback((email: string) => {
    console.log('Newsletter subscription:', email);
    // TODO: Implement newsletter subscription logic
  }, []);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip to main content with Alt+M
      if (event.altKey && event.key === 'm') {
        event.preventDefault();
        const mainContent = document.querySelector('main');
        if (mainContent) {
          mainContent.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="hospital-homepage-redesign">
      {/* Skip to main content link for accessibility */}
      <a 
        href="#main-content" 
        className="redesign-sr-only redesign-focus-visible"
        onClick={(e) => {
          e.preventDefault();
          scrollToSection('main-content');
        }}
      >
        Skip to main content
      </a>

      {/* Floating Staff Login Button */}
      <button
        className="redesign-floating-staff-btn"
        onClick={onStaffLogin}
        aria-label="Staff Portal Login"
        title="Staff Portal Login"
      >
        <span className="redesign-floating-btn-icon">👨‍⚕️</span>
        <span className="redesign-floating-btn-text">Staff</span>
      </button>

      {/* Header Component - Will be implemented in next task */}
      <header className="redesign-header">
        <div className="redesign-container">
          <div className="redesign-flex redesign-items-center redesign-justify-between">
            <div className="redesign-logo">
              <img 
                src={content.branding.logo.src} 
                alt={content.branding.logo.alt}
                width={content.branding.logo.width}
                height={content.branding.logo.height}
              />
            </div>
            <nav className="redesign-nav-desktop">
              {navigationItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`redesign-nav-link ${item.active ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation(item);
                  }}
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="redesign-header-cta">
              <button 
                className="redesign-btn redesign-btn-primary redesign-btn-sm"
                onClick={onStaffLogin}
              >
                Staff Login
              </button>
              <button 
                className="redesign-btn redesign-btn-emergency"
                onClick={onBookAppointment}
              >
                Call: +234 810 314 6408
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main role="main" id="main-content" tabIndex={-1}>
        {/* Hero Section - Enhanced with dedicated component */}
        <HeroSection 
          content={content.hero}
          onBookAppointment={onBookAppointment}
        />

        {/* About Section - Enhanced with dedicated component */}
        <AboutSection 
          content={content.about}
          onLearnMore={() => console.log('Learn More clicked')}
        />

        {/* Quick Access Section for Staff and Patients */}
        <section className="redesign-quick-access redesign-section redesign-bg-light">
          <div className="redesign-container">
            <h2 className="redesign-heading-3" style={{ textAlign: 'center', marginBottom: 'var(--redesign-spacing-2xl)' }}>
              Quick Access Portal
            </h2>
            <div className="redesign-grid redesign-quick-access-grid">
              <div className="redesign-quick-access-card">
                <div className="redesign-quick-access-icon">👨‍⚕️</div>
                <h3 className="redesign-heading-5">Staff Portal</h3>
                <p className="redesign-body-base">
                  Access your dashboard, patient records, and hospital management tools
                </p>
                <button 
                  className="redesign-btn redesign-btn-primary"
                  onClick={onStaffLogin}
                >
                  Staff Login
                </button>
              </div>
              <div className="redesign-quick-access-card">
                <div className="redesign-quick-access-icon">📅</div>
                <h3 className="redesign-heading-5">Patient Portal</h3>
                <p className="redesign-body-base">
                  Book appointments, view medical records, and manage your healthcare
                </p>
                <button 
                  className="redesign-btn redesign-btn-emergency"
                  onClick={onBookAppointment}
                >
                  Book Appointment
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section - Enhanced with real medical imagery */}
        <ServicesSection 
          content={content.services}
          onServiceSelect={(serviceId) => console.log('Service selected:', serviceId)}
        />

        {/* Placeholder sections for remaining components */}
        <section id="why-choose-us" className="redesign-section redesign-bg-light">
          <div className="redesign-container">
            <h2 className="redesign-heading-2" style={{ textAlign: 'center' }}>
              {content.whyChooseUs.heading}
            </h2>
            <p style={{ textAlign: 'center' }}>Why Choose Us section - To be implemented</p>
          </div>
        </section>

        <section id="booking" className="redesign-section redesign-bg-blue-gradient">
          <div className="redesign-container">
            <h2 className="redesign-heading-2 redesign-text-white" style={{ textAlign: 'center' }}>
              {content.booking.heading}
            </h2>
            <p className="redesign-text-white" style={{ textAlign: 'center' }}>Booking section - To be implemented</p>
          </div>
        </section>

        <section id="testimonials" className="redesign-section">
          <div className="redesign-container">
            <h2 className="redesign-heading-2" style={{ textAlign: 'center' }}>
              {content.testimonials.heading}
            </h2>
            <p style={{ textAlign: 'center' }}>Testimonials section - To be implemented</p>
          </div>
        </section>

        <section id="newsletter" className="redesign-section redesign-bg-emergency">
          <div className="redesign-container">
            <h2 className="redesign-heading-2 redesign-text-white" style={{ textAlign: 'center' }}>
              {content.newsletter.heading}
            </h2>
            <p className="redesign-text-white" style={{ textAlign: 'center' }}>Newsletter section - To be implemented</p>
          </div>
        </section>

        <section id="contact" className="redesign-section redesign-bg-blue-gradient">
          <div className="redesign-container">
            <h2 className="redesign-heading-2 redesign-text-white" style={{ textAlign: 'center' }}>
              Contact Information
            </h2>
            <p className="redesign-text-white" style={{ textAlign: 'center' }}>Contact section - To be implemented</p>
          </div>
        </section>
      </main>
      
      {/* Footer - Enhanced with staff access */}
      <footer className="redesign-footer redesign-bg-dark">
        <div className="redesign-container">
          <div className="redesign-footer-content">
            <div className="redesign-footer-section">
              <h4 className="redesign-text-white">Quick Access</h4>
              <ul className="redesign-footer-links">
                <li>
                  <button 
                    onClick={onStaffLogin}
                    className="redesign-footer-link"
                  >
                    Staff Portal Login
                  </button>
                </li>
                <li>
                  <button 
                    onClick={onBookAppointment}
                    className="redesign-footer-link"
                  >
                    Book Appointment
                  </button>
                </li>
              </ul>
            </div>
            <div className="redesign-footer-section">
              <h4 className="redesign-text-white">Contact</h4>
              <p className="redesign-text-white">+234 810 314 6408</p>
              <p className="redesign-text-white">33, Ishaga Road, Surulere Lagos</p>
            </div>
          </div>
          <div className="redesign-footer-bottom">
            <p className="redesign-text-white">
              © 2024 {content.branding.hospitalName}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HospitalHomepageRedesign;