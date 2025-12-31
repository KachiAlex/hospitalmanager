import React, { useEffect } from 'react';
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

  return (
    <div className="hospital-homepage">
      <Header
        logo={hospitalInfo.logo}
        navigationItems={navigationItems}
        onBookAppointment={onBookAppointment}
        onStaffLogin={onStaffLogin}
      />
      
      <main role="main">
        <HeroSection
          headline={pageContent.hero.headline}
          supportingText={pageContent.hero.supportingText}
          heroImage={pageContent.hero.backgroundImage}
          onBookAppointment={onBookAppointment}
          onContactUs={onContactUs}
        />
        
        <ServicesSection services={pageContent.services} />
        
        <WhyChooseUsSection features={pageContent.whyChooseUs} />
        
        <ContactSection contactInfo={pageContent.contact} />
      </main>
      
      <Footer />
    </div>
  );
};

export default HospitalHomepage;