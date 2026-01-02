// Core TypeScript interfaces for Hospital Homepage Redesign

// Common Interfaces
export interface CTAButton {
  text: string;
  onClick: () => void;
  variant: 'primary' | 'secondary' | 'outline';
  size: 'small' | 'medium' | 'large';
}

export interface ImageData {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
}

export interface GradientConfig {
  direction: string;
  colors: string[];
}

export interface NavigationItem {
  label: string;
  href: string;
  active?: boolean;
}

// Main Homepage Component
export interface HospitalHomepageRedesignProps {
  onNavigate?: (section: string) => void;
  onBookAppointment?: () => void;
  onStaffLogin?: () => void;
}

// Header Component
export interface HeaderProps {
  logo: ImageData;
  navigationItems: NavigationItem[];
  emergencyPhone: string;
  onBookAppointment: () => void;
  onStaffLogin: () => void;
  onNavigate?: (item: NavigationItem) => void;
}

// Hero Section
export interface HeroSectionProps {
  headline: string;
  subheadline: string;
  description: string;
  primaryCTA: CTAButton;
  heroImage: ImageData;
  backgroundGradient: GradientConfig;
}

// About Section
export interface AboutSectionProps {
  heading: string;
  subheading: string;
  description: string;
  specializations: string[];
  facilityImage: ImageData;
  ctaButton: CTAButton;
}

// Services Section
export interface ServicesSectionProps {
  heading: string;
  subheading: string;
  services: ServiceData[];
}

export interface ServiceData {
  id: string;
  title: string;
  description: string;
  image: ImageData;
  features: string[];
}

// Why Choose Us Section
export interface WhyChooseUsSectionProps {
  heading: string;
  subheading: string;
  description: string;
  features: FeatureData[];
  facilityImage: ImageData;
  ctaButton: CTAButton;
}

export interface FeatureData {
  id: string;
  title: string;
  icon: string;
  description?: string;
}

// Booking Section
export interface BookingSectionProps {
  heading: string;
  description: string;
  benefits: string[];
  ctaButton: CTAButton;
  backgroundImage: ImageData;
}

// Testimonials Section
export interface TestimonialsSectionProps {
  heading: string;
  testimonials: TestimonialData[];
}

export interface TestimonialData {
  id: string;
  name: string;
  content: string;
  avatar?: ImageData;
  rating?: number;
}

// Newsletter Section
export interface NewsletterSectionProps {
  heading: string;
  description: string;
  ctaButton: CTAButton;
  privacyText: string;
  onSubscribe: (email: string) => void;
}

// Contact Section
export interface ContactSectionProps {
  phoneNumbers: string[];
  addresses: AddressData[];
  ctaButton: CTAButton;
  whatsappNumber?: string;
}

export interface AddressData {
  type: 'head' | 'branch';
  address: string;
  city: string;
  state: string;
}

// Content Management System Interfaces
export interface BrandingConfig {
  hospitalName: string;
  logo: ImageData;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    emergency: string;
    background: string;
    text: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    sizes: FontSizeConfig;
  };
}

export interface FontSizeConfig {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;
}

export interface HeroContent {
  headline: string;
  subheadline: string;
  description: string;
  ctaText: string;
  heroImage: ImageData;
  backgroundGradient: GradientConfig;
}

export interface AboutContent {
  heading: string;
  subheading: string;
  description: string;
  specializations: string[];
  facilityImage: ImageData;
  ctaText: string;
}

export interface ServicesContent {
  heading: string;
  subheading: string;
  services: ServiceData[];
}

export interface WhyChooseUsContent {
  heading: string;
  subheading: string;
  description: string;
  features: FeatureData[];
  facilityImage: ImageData;
  ctaText: string;
}

export interface BookingContent {
  heading: string;
  description: string;
  benefits: string[];
  ctaText: string;
  backgroundImage: ImageData;
}

export interface TestimonialsContent {
  heading: string;
  testimonials: TestimonialData[];
}

export interface NewsletterContent {
  heading: string;
  description: string;
  ctaText: string;
  privacyText: string;
}

export interface ContactContent {
  phoneNumbers: string[];
  addresses: AddressData[];
  ctaText: string;
  whatsappNumber: string;
}

// Main Content Configuration
export interface HospitalContent {
  branding: BrandingConfig;
  hero: HeroContent;
  about: AboutContent;
  services: ServicesContent;
  whyChooseUs: WhyChooseUsContent;
  booking: BookingContent;
  testimonials: TestimonialsContent;
  newsletter: NewsletterContent;
  contact: ContactContent;
}

// Image Assets Management
export interface ImageAssets {
  hero: {
    patientCare: ImageData;
    nursePatient: ImageData;
  };
  facilities: {
    hospitalExterior: ImageData;
    reception: ImageData;
    operatingRoom: ImageData;
    dialysisRoom: ImageData;
    consultationRoom: ImageData;
  };
  services: {
    neurosurgery: ImageData;
    brainSpine: ImageData;
    dialysis: ImageData;
  };
  testimonials: {
    patient1: ImageData;
    patient2: ImageData;
    patient3: ImageData;
  };
  branding: {
    logo: ImageData;
    logoWhite: ImageData;
  };
}