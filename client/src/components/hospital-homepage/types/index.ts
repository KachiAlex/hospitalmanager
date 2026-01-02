// Core TypeScript interfaces for Hospital Homepage

export interface NavigationItem {
  label: string;
  href: string;
  active?: boolean;
}

export interface HeaderProps {
  logo: string;
  navigationItems: NavigationItem[];
  onBookAppointment: () => void;
  onStaffLogin: () => void;
  onNavigate?: (item: NavigationItem) => void;
}

export interface HeroSectionProps {
  headline: string;
  supportingText: string;
  heroImage: string;
  onBookAppointment: () => void;
  onContactUs: () => void;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  mapEmbedUrl?: string;
}

export interface ContactSectionProps {
  contactInfo: ContactInfo;
  id?: string;
}

export interface HospitalInfo {
  name: string;
  logo: string;
  tagline: string;
  description: string;
  contact: ContactInfo;
  services: Service[];
  features: Feature[];
}

export interface PageContent {
  hero: {
    headline: string;
    supportingText: string;
    primaryCTA: string;
    secondaryCTA: string;
    backgroundImage: string;
  };
  services: Service[];
  whyChooseUs: Feature[];
  contact: ContactInfo;
}