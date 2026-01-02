import React, { useEffect, useCallback } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ServicesSection from './components/ServicesSection';
import WhyChooseUsSection from './components/WhyChooseUsSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import { defaultContentManager } from './data/contentManager';
import { defaultColorManager } from './styles/colorManager';
import './HospitalHomepage.css';

interface HospitalHomepageProps {
  onBookAppointment?: () => void;
  onStaffLogin?: () => void;
  onContactUs?: () => void;
}

const HospitalHomepage: React.FC<HospitalHomepageProps> = ({
  onBookAppointment = () => console.log('Book Appointment clicked'),
  onStaffLogin = () => console.log('Staff Login clicked'),
  onContactUs = () => console.log('Contact Us clicked')
}) => {
  const hospitalInfo = defaultContentManager.getHospitalInfo();
  const pageContent = defaultContentManager.getPageContent();
  const navigationItems = defaultContentManager.getDefaultNavigation();

  // Apply medical color palette on component mount
  useEffect(() => {
    defaultColorManager.applyMedicalPalette();
  }, []);

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
    if (item.href?.startsWith('#')) {
      const sectionId = item.href.substring(1);
      scrollToSection(sectionId);
    } else if (item.href) {
      window.location.href = item.href;
    }
  }, [scrollToSection]);

  // Enhanced contact us handler that scrolls to contact section
  const handleContactUs = useCallback(() => {
    scrollToSection('contact');
    onContactUs();
  }, [scrollToSection, onContactUs]);

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
    <div className="hospital-homepage">
      {/* Skip to main content link for accessibility */}
      <a 
        href="#main-content" 
        className="skip-to-main"
        onClick={(e) => {
          e.preventDefault();
          scrollToSection('main-content');
        }}
      >
        Skip to main content
      </a>

      <Header
        logo={hospitalInfo.logo}
        navigationItems={navigationItems}
        onBookAppointment={onBookAppointment}
        onStaffLogin={onStaffLogin}
        onNavigate={handleNavigation}
      />
      
      <main role="main" id="main-content" tabIndex={-1}>
        <HeroSection
          headline={pageContent.hero.headline}
          supportingText={pageContent.hero.supportingText}
          heroImage={pageContent.hero.backgroundImage}
          onBookAppointment={onBookAppointment}
          onContactUs={handleContactUs}
        />
        
        <ServicesSection 
          services={pageContent.services}
          id="services"
        />
        
        <WhyChooseUsSection 
          features={pageContent.whyChooseUs}
          id="why-choose-us"
        />
        
        <ContactSection 
          contactInfo={pageContent.contact}
          id="contact"
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default HospitalHomepage;