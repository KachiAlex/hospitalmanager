// Content Manager for Hospital Homepage Redesign
import { 
  HospitalContent, 
  BrandingConfig, 
  HeroContent, 
  AboutContent, 
  ServicesContent, 
  WhyChooseUsContent, 
  BookingContent, 
  TestimonialsContent, 
  NewsletterContent, 
  ContactContent,
  NavigationItem 
} from '../types';
import { hospitalContent } from './content';

// Content Manager class for handling redesigned hospital homepage data
export class RedesignContentManager {
  private content: HospitalContent;

  constructor(initialContent?: HospitalContent) {
    this.content = initialContent || hospitalContent;
  }

  // Main content getters
  getContent(): HospitalContent {
    return { ...this.content };
  }

  getBranding(): BrandingConfig {
    return { ...this.content.branding };
  }

  getHeroContent(): HeroContent {
    return { ...this.content.hero };
  }

  getAboutContent(): AboutContent {
    return { ...this.content.about };
  }

  getServicesContent(): ServicesContent {
    return { ...this.content.services };
  }

  getWhyChooseUsContent(): WhyChooseUsContent {
    return { ...this.content.whyChooseUs };
  }

  getBookingContent(): BookingContent {
    return { ...this.content.booking };
  }

  getTestimonialsContent(): TestimonialsContent {
    return { ...this.content.testimonials };
  }

  getNewsletterContent(): NewsletterContent {
    return { ...this.content.newsletter };
  }

  getContactContent(): ContactContent {
    return { ...this.content.contact };
  }

  // Content setters with validation
  setBranding(branding: BrandingConfig): boolean {
    if (this.validateBranding(branding)) {
      this.content = {
        ...this.content,
        branding: { ...branding }
      };
      return true;
    }
    return false;
  }

  setHeroContent(hero: HeroContent): boolean {
    if (this.validateHeroContent(hero)) {
      this.content = {
        ...this.content,
        hero: { ...hero }
      };
      return true;
    }
    return false;
  }

  setAboutContent(about: AboutContent): boolean {
    if (this.validateAboutContent(about)) {
      this.content = {
        ...this.content,
        about: { ...about }
      };
      return true;
    }
    return false;
  }

  setServicesContent(services: ServicesContent): boolean {
    if (this.validateServicesContent(services)) {
      this.content = {
        ...this.content,
        services: { ...services }
      };
      return true;
    }
    return false;
  }

  setWhyChooseUsContent(whyChooseUs: WhyChooseUsContent): boolean {
    if (this.validateWhyChooseUsContent(whyChooseUs)) {
      this.content = {
        ...this.content,
        whyChooseUs: { ...whyChooseUs }
      };
      return true;
    }
    return false;
  }

  setBookingContent(booking: BookingContent): boolean {
    if (this.validateBookingContent(booking)) {
      this.content = {
        ...this.content,
        booking: { ...booking }
      };
      return true;
    }
    return false;
  }

  setTestimonialsContent(testimonials: TestimonialsContent): boolean {
    if (this.validateTestimonialsContent(testimonials)) {
      this.content = {
        ...this.content,
        testimonials: { ...testimonials }
      };
      return true;
    }
    return false;
  }

  setNewsletterContent(newsletter: NewsletterContent): boolean {
    if (this.validateNewsletterContent(newsletter)) {
      this.content = {
        ...this.content,
        newsletter: { ...newsletter }
      };
      return true;
    }
    return false;
  }

  setContactContent(contact: ContactContent): boolean {
    if (this.validateContactContent(contact)) {
      this.content = {
        ...this.content,
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
      { label: 'About Us', href: '#about', active: false },
      { label: 'Services', href: '#services', active: false },
      { label: 'Staff Portal', href: '#staff-login', active: false },
      { label: 'Contact', href: '#contact', active: false }
    ];
  }

  // Validation methods
  private validateBranding(branding: BrandingConfig): boolean {
    return !!(
      branding &&
      branding.hospitalName &&
      branding.logo &&
      branding.colors &&
      branding.fonts
    );
  }

  private validateHeroContent(hero: HeroContent): boolean {
    return !!(
      hero &&
      hero.headline &&
      hero.subheadline &&
      hero.description &&
      hero.ctaText &&
      hero.heroImage &&
      hero.backgroundGradient
    );
  }

  private validateAboutContent(about: AboutContent): boolean {
    return !!(
      about &&
      about.heading &&
      about.subheading &&
      about.description &&
      Array.isArray(about.specializations) &&
      about.specializations.length >= 4 &&
      about.facilityImage &&
      about.ctaText
    );
  }

  private validateServicesContent(services: ServicesContent): boolean {
    return !!(
      services &&
      services.heading &&
      services.subheading &&
      Array.isArray(services.services) &&
      services.services.length >= 3 &&
      services.services.every(service => 
        service.id && 
        service.title && 
        service.description && 
        service.image &&
        Array.isArray(service.features)
      )
    );
  }

  private validateWhyChooseUsContent(whyChooseUs: WhyChooseUsContent): boolean {
    return !!(
      whyChooseUs &&
      whyChooseUs.heading &&
      whyChooseUs.subheading &&
      whyChooseUs.description &&
      Array.isArray(whyChooseUs.features) &&
      whyChooseUs.features.length >= 4 &&
      whyChooseUs.facilityImage &&
      whyChooseUs.ctaText
    );
  }

  private validateBookingContent(booking: BookingContent): boolean {
    return !!(
      booking &&
      booking.heading &&
      booking.description &&
      Array.isArray(booking.benefits) &&
      booking.ctaText &&
      booking.backgroundImage
    );
  }

  private validateTestimonialsContent(testimonials: TestimonialsContent): boolean {
    return !!(
      testimonials &&
      testimonials.heading &&
      Array.isArray(testimonials.testimonials) &&
      testimonials.testimonials.length >= 3 &&
      testimonials.testimonials.every(testimonial =>
        testimonial.id &&
        testimonial.name &&
        testimonial.content
      )
    );
  }

  private validateNewsletterContent(newsletter: NewsletterContent): boolean {
    return !!(
      newsletter &&
      newsletter.heading &&
      newsletter.description &&
      newsletter.ctaText &&
      newsletter.privacyText
    );
  }

  private validateContactContent(contact: ContactContent): boolean {
    return !!(
      contact &&
      Array.isArray(contact.phoneNumbers) &&
      contact.phoneNumbers.length > 0 &&
      Array.isArray(contact.addresses) &&
      contact.addresses.length >= 2 &&
      contact.ctaText &&
      contact.whatsappNumber
    );
  }

  // Utility methods
  reset(): void {
    this.content = { ...hospitalContent };
  }

  isValid(): boolean {
    return (
      this.validateBranding(this.content.branding) &&
      this.validateHeroContent(this.content.hero) &&
      this.validateAboutContent(this.content.about) &&
      this.validateServicesContent(this.content.services) &&
      this.validateWhyChooseUsContent(this.content.whyChooseUs) &&
      this.validateBookingContent(this.content.booking) &&
      this.validateTestimonialsContent(this.content.testimonials) &&
      this.validateNewsletterContent(this.content.newsletter) &&
      this.validateContactContent(this.content.contact)
    );
  }

  // Export/Import functionality
  exportData() {
    return {
      content: this.getContent(),
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  importData(data: { content: HospitalContent }): boolean {
    if (data.content && this.validateContent(data.content)) {
      this.content = { ...data.content };
      return true;
    }
    return false;
  }

  private validateContent(content: HospitalContent): boolean {
    return !!(
      content &&
      content.branding &&
      content.hero &&
      content.about &&
      content.services &&
      content.whyChooseUs &&
      content.booking &&
      content.testimonials &&
      content.newsletter &&
      content.contact
    );
  }
}

// Create default redesign content manager instance
export const defaultRedesignContentManager = new RedesignContentManager();