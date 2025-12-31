import React from 'react';
import { HospitalHomepage } from './components/hospital-homepage';

function HospitalApp() {
  const handleBookAppointment = () => {
    alert('Book Appointment clicked! This would redirect to appointment booking.');
  };

  const handleStaffLogin = () => {
    alert('Staff Login clicked! This would redirect to staff login portal.');
  };

  const handleContactUs = () => {
    alert('Contact Us clicked! This would open contact form or scroll to contact section.');
  };

  return (
    <HospitalHomepage
      onBookAppointment={handleBookAppointment}
      onStaffLogin={handleStaffLogin}
      onContactUs={handleContactUs}
    />
  );
}

export default HospitalApp;