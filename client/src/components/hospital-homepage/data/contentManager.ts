import { HospitalInfo, PageContent, Service, Feature, ContactInfo, NavigationItem } from '../types';
import { 
  validateHospitalInfo, 
  validatePageContent, 
  validateRequiredServices, 
  validateRequiredFeatures,
  validateRequiredNavigation 
} from './validation';
import { defaultHospitalInfo, defaultPageContent, defaultServices, defaultFeatures } from './defaultContent';

// Content Manager class for handling hospital homepage data
export class ContentManager {
  private hospitalInfo: HospitalInfo;
  private pageContent: PageContent;

  constructor(initialHospitalInfo?: HospitalInfo, initialPageContent?: PageContent) {
    this.hospitalInfo = initialHospitalInfo || defaultHospitalInfo;
    this.pageContent = initialPageContent || defaultPageContent;
    
    // Validate initial data
    if (!validateHospitalInfo(this.hospitalInfo)) {
      console.warn('Invalid hospital info provided, using defaults');
      this.hospitalInfo = defaultHospitalInfo;
    }
    
    if (!validatePageContent(this.pageContent)) {
      console.warn('Invalid page content provided, using defaults');
      this.pageContent = defaultPageContent;
    }
  }

  // Hospital Info getters and setters
  getHospitalInfo(): HospitalInfo {
    return { ...this.hospitalInfo };
  }

  setHospitalInfo(info: HospitalInfo): boolean {
    if (validateHospitalInfo(info)) {
      this.hospitalInfo = { ...info };
      return true;
    }
    return false;
  }

  // Page Content getters and setters
  getPageContent(): PageContent {
    return { ...this.pageContent };
  }

  setPageContent(content: PageContent): boolean {
    if (validatePageContent(content)) {
      this.pageContent = { ...content };
      return true;
    }
    return false;
  }

  // Services management
  getServices(): Service[] {
    return [...this.hospitalInfo.services];
  }

  setServices(services: Service[]): boolean {
    if (validateRequiredServices(services)) {
      this.hospitalInfo = {
        ...this.hospitalInfo,
        services: [...services]
      };
      this.pageContent = {
        ...this.pageContent,
        services: [...services]
      };
      return true;
    }
    return false;
  }

  // Features management
  getFeatures(): Feature[] {
    return [...this.hospitalInfo.features];
  }

  setFeatures(features: Feature[]): boolean {
    if (validateRequiredFeatures(features)) {
      this.hospitalInfo = {
        ...this.hospitalInfo,
        features: [...features]
      };
      this.pageContent = {
        ...this.pageContent,
        whyChooseUs: [...features]
      };
      return true;
    }
    return false;
  }

  // Contact info management
  getContactInfo(): ContactInfo {
    return { ...this.hospitalInfo.contact };
  }

  setContactInfo(contact: ContactInfo): boolean {
    if (validateRequiredNavigation) {
      this.hospitalInfo = {
        ...this.hospitalInfo,
        contact: { ...contact }
      };
      this.pageContent = {
        ...this.pageContent,
        contact: { ...contact }
      };
      return true;
    }
    return false;
  }

  // Navigation management
  getDefaultNavigation(): NavigationItem[] {
    return [
      { label: 'Home', href: '/', active: true },
      { label: 'Services', href: '/services', active: false },
      { label: 'Doctors', href: '/doctors', active: false },
      { label: 'Contact', href: '/contact', active: false }
    ];
  }

  // Hero section management
  getHeroContent() {
    return { ...this.pageContent.hero };
  }

  setHeroContent(hero: PageContent['hero']): boolean {
    const heroValid = (
      hero &&
      typeof hero.headline === 'string' &&
      hero.headline.trim().length > 0 &&
      typeof hero.supportingText === 'string' &&
      hero.supportingText.trim().length > 0 &&
      typeof hero.primaryCTA === 'string' &&
      hero.primaryCTA.trim().length > 0 &&
      typeof hero.secondaryCTA === 'string' &&
      hero.secondaryCTA.trim().length > 0 &&
      typeof hero.backgroundImage === 'string' &&
      hero.backgroundImage.trim().length > 0
    );

    if (heroValid) {
      this.pageContent = {
        ...this.pageContent,
        hero: { ...hero }
      };
      return true;
    }
    return false;
  }

  // Utility methods
  reset(): void {
    this.hospitalInfo = { ...defaultHospitalInfo };
    this.pageContent = { ...defaultPageContent };
  }

  isValid(): boolean {
    return validateHospitalInfo(this.hospitalInfo) && validatePageContent(this.pageContent);
  }

  // Export data for persistence
  exportData() {
    return {
      hospitalInfo: this.getHospitalInfo(),
      pageContent: this.getPageContent(),
      timestamp: new Date().toISOString()
    };
  }

  // Import data from external source
  importData(data: { hospitalInfo: HospitalInfo; pageContent: PageContent }): boolean {
    if (validateHospitalInfo(data.hospitalInfo) && validatePageContent(data.pageContent)) {
      this.hospitalInfo = { ...data.hospitalInfo };
      this.pageContent = { ...data.pageContent };
      return true;
    }
    return false;
  }
}

// Create default content manager instance
export const defaultContentManager = new ContentManager();