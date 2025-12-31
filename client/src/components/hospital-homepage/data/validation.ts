import { Service, Feature, ContactInfo, HospitalInfo, PageContent, NavigationItem } from '../types';

// Validation functions for data integrity

export const validateService = (service: Service): boolean => {
  if (!service || typeof service !== 'object') return false;
  
  return (
    typeof service.id === 'string' &&
    service.id.trim().length > 0 &&
    typeof service.title === 'string' &&
    service.title.trim().length > 0 &&
    typeof service.description === 'string' &&
    service.description.trim().length > 0 &&
    typeof service.iconName === 'string' &&
    service.iconName.trim().length > 0
  );
};

export const validateFeature = (feature: Feature): boolean => {
  if (!feature || typeof feature !== 'object') return false;
  
  return (
    typeof feature.id === 'string' &&
    feature.id.trim().length > 0 &&
    typeof feature.title === 'string' &&
    feature.title.trim().length > 0 &&
    typeof feature.description === 'string' &&
    feature.description.trim().length > 0 &&
    typeof feature.iconName === 'string' &&
    feature.iconName.trim().length > 0
  );
};

export const validateContactInfo = (contact: ContactInfo): boolean => {
  if (!contact || typeof contact !== 'object') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$|^\d{3}-\d{3}-\d{4}$/;
  
  return (
    typeof contact.address === 'string' &&
    contact.address.trim().length > 0 &&
    typeof contact.phone === 'string' &&
    phoneRegex.test(contact.phone) &&
    typeof contact.email === 'string' &&
    emailRegex.test(contact.email) &&
    (contact.mapEmbedUrl === undefined || typeof contact.mapEmbedUrl === 'string')
  );
};

export const validateNavigationItem = (item: NavigationItem): boolean => {
  if (!item || typeof item !== 'object') return false;
  
  return (
    typeof item.label === 'string' &&
    item.label.trim().length > 0 &&
    typeof item.href === 'string' &&
    item.href.trim().length > 0 &&
    (item.active === undefined || typeof item.active === 'boolean')
  );
};

export const validateHospitalInfo = (info: HospitalInfo): boolean => {
  if (!info || typeof info !== 'object') return false;
  
  return (
    typeof info.name === 'string' &&
    info.name.trim().length > 0 &&
    typeof info.logo === 'string' &&
    info.logo.trim().length > 0 &&
    typeof info.tagline === 'string' &&
    info.tagline.trim().length > 0 &&
    typeof info.description === 'string' &&
    info.description.trim().length > 0 &&
    validateContactInfo(info.contact) &&
    Array.isArray(info.services) &&
    info.services.every(validateService) &&
    Array.isArray(info.features) &&
    info.features.every(validateFeature)
  );
};

export const validatePageContent = (content: PageContent): boolean => {
  if (!content || typeof content !== 'object') return false;
  
  const heroValid = (
    content.hero &&
    typeof content.hero.headline === 'string' &&
    content.hero.headline.trim().length > 0 &&
    typeof content.hero.supportingText === 'string' &&
    content.hero.supportingText.trim().length > 0 &&
    typeof content.hero.primaryCTA === 'string' &&
    content.hero.primaryCTA.trim().length > 0 &&
    typeof content.hero.secondaryCTA === 'string' &&
    content.hero.secondaryCTA.trim().length > 0 &&
    typeof content.hero.backgroundImage === 'string' &&
    content.hero.backgroundImage.trim().length > 0
  );
  
  return (
    heroValid &&
    Array.isArray(content.services) &&
    content.services.every(validateService) &&
    Array.isArray(content.whyChooseUs) &&
    content.whyChooseUs.every(validateFeature) &&
    validateContactInfo(content.contact)
  );
};

// Required services validation
export const validateRequiredServices = (services: Service[]): boolean => {
  const requiredTitles = [
    'Outpatient Care',
    'Inpatient Admission',
    'Emergency Services',
    'Pharmacy',
    'Laboratory',
    'Maternity / Pediatrics'
  ];
  
  if (!Array.isArray(services) || services.length !== 6) return false;
  
  const serviceTitles = services.map(s => s.title);
  return requiredTitles.every(title => serviceTitles.includes(title));
};

// Required features validation
export const validateRequiredFeatures = (features: Feature[]): boolean => {
  const requiredTitles = [
    'Qualified Medical Professionals',
    'Modern Medical Equipment',
    'Clean & Safe Environment',
    'Affordable Healthcare'
  ];
  
  if (!Array.isArray(features) || features.length !== 4) return false;
  
  const featureTitles = features.map(f => f.title);
  return requiredTitles.every(title => featureTitles.includes(title));
};

// Required navigation validation
export const validateRequiredNavigation = (items: NavigationItem[]): boolean => {
  const requiredLabels = ['Home', 'Services', 'Doctors', 'Contact'];
  
  if (!Array.isArray(items) || items.length !== 4) return false;
  
  const itemLabels = items.map(item => item.label);
  return requiredLabels.every(label => itemLabels.includes(label));
};