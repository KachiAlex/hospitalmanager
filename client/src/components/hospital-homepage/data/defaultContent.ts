import { HospitalInfo, PageContent, Service, Feature } from '../types';

// Default services data
export const defaultServices: Service[] = [
  {
    id: 'outpatient-care',
    title: 'Outpatient Care',
    description: 'Comprehensive medical consultations and treatments without hospital admission.',
    iconName: 'FaUserMd'
  },
  {
    id: 'inpatient-admission',
    title: 'Inpatient Admission',
    description: 'Full-service hospital care with comfortable rooms and 24/7 medical supervision.',
    iconName: 'FaBed'
  },
  {
    id: 'emergency-services',
    title: 'Emergency Services',
    description: '24/7 emergency medical care with rapid response and advanced life support.',
    iconName: 'FaAmbulance'
  },
  {
    id: 'pharmacy',
    title: 'Pharmacy',
    description: 'On-site pharmacy with prescription medications and health consultations.',
    iconName: 'FaPills'
  },
  {
    id: 'laboratory',
    title: 'Laboratory',
    description: 'Advanced diagnostic testing with quick results and accurate analysis.',
    iconName: 'FaFlask'
  },
  {
    id: 'maternity-pediatrics',
    title: 'Maternity / Pediatrics',
    description: 'Specialized care for mothers and children from birth through adolescence.',
    iconName: 'FaBaby'
  }
];

// Default features for "Why Choose Us" section
export const defaultFeatures: Feature[] = [
  {
    id: 'qualified-professionals',
    title: 'Qualified Medical Professionals',
    description: 'Board-certified doctors and experienced healthcare staff committed to excellence.',
    iconName: 'FaUserGraduate'
  },
  {
    id: 'modern-equipment',
    title: 'Modern Medical Equipment',
    description: 'State-of-the-art technology and equipment for accurate diagnosis and treatment.',
    iconName: 'FaStethoscope'
  },
  {
    id: 'clean-safe-environment',
    title: 'Clean & Safe Environment',
    description: 'Maintained to the highest standards of cleanliness and safety protocols.',
    iconName: 'FaShieldAlt'
  },
  {
    id: 'affordable-healthcare',
    title: 'Affordable Healthcare',
    description: 'Quality medical care at competitive prices with flexible payment options.',
    iconName: 'FaDollarSign'
  }
];

// Default hospital information
export const defaultHospitalInfo: HospitalInfo = {
  name: 'CareWell Medical Center',
  logo: '/images/hospital-logo.svg',
  tagline: 'Quality Healthcare You Can Trust',
  description: 'Providing compassionate, reliable, and affordable healthcare services.',
  contact: {
    address: '123 Healthcare Drive, Medical District, City, State 12345',
    phone: '(555) 123-4567',
    email: 'info@carewellmedical.com',
    mapEmbedUrl: 'https://maps.google.com/embed?pb=!1m18!1m12!1m3!1d3024.123456789!2d-74.0059413!3d40.7127753!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQyJzQ2LjAiTiA3NMKwMDAnMjEuNCJX!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus'
  },
  services: defaultServices,
  features: defaultFeatures
};

// Default page content
export const defaultPageContent: PageContent = {
  hero: {
    headline: 'Quality Healthcare You Can Trust',
    supportingText: 'Providing compassionate, reliable, and affordable healthcare services.',
    primaryCTA: 'Book Appointment',
    secondaryCTA: 'Contact Us',
    backgroundImage: '/images/hero-hospital.svg'
  },
  services: defaultServices,
  whyChooseUs: defaultFeatures,
  contact: defaultHospitalInfo.contact
};