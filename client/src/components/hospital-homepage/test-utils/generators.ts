import * as fc from 'fast-check';
import { Service, Feature, ContactInfo, NavigationItem } from '../types';

// Property-based test generators using fast-check

// Service generator
export const serviceArbitrary = fc.record({
  id: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  description: fc.string({ minLength: 10, maxLength: 200 }).filter(s => s.trim().length > 0),
  iconName: fc.constantFrom('FaUserMd', 'FaBed', 'FaAmbulance', 'FaPills', 'FaFlask', 'FaBaby')
}) as fc.Arbitrary<Service>;

// Feature generator
export const featureArbitrary = fc.record({
  id: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  description: fc.string({ minLength: 10, maxLength: 200 }).filter(s => s.trim().length > 0),
  iconName: fc.constantFrom('FaUserGraduate', 'FaStethoscope', 'FaShieldAlt', 'FaDollarSign')
}) as fc.Arbitrary<Feature>;

// Contact info generator
export const contactInfoArbitrary = fc.record({
  address: fc.string({ minLength: 10, maxLength: 200 }).filter(s => s.trim().length > 0),
  phone: fc.string({ minLength: 10, maxLength: 20 }).filter(s => /^\(\d{3}\) \d{3}-\d{4}$/.test(s) || /^\d{3}-\d{3}-\d{4}$/.test(s)),
  email: fc.emailAddress(),
  mapEmbedUrl: fc.option(fc.webUrl(), { nil: undefined })
}) as fc.Arbitrary<ContactInfo>;

// Navigation item generator
export const navigationItemArbitrary = fc.record({
  label: fc.constantFrom('Home', 'Services', 'Doctors', 'Contact'),
  href: fc.string({ minLength: 1, maxLength: 50 }).map(s => `/${s}`),
  active: fc.option(fc.boolean(), { nil: undefined })
}) as fc.Arbitrary<NavigationItem>;

// Required services generator (ensures all 6 services are present)
export const requiredServicesArbitrary = fc.constant([
  'Outpatient Care',
  'Inpatient Admission', 
  'Emergency Services',
  'Pharmacy',
  'Laboratory',
  'Maternity / Pediatrics'
]).map(titles => titles.map((title, index) => ({
  id: `service-${index}`,
  title,
  description: `Description for ${title}`,
  iconName: ['FaUserMd', 'FaBed', 'FaAmbulance', 'FaPills', 'FaFlask', 'FaBaby'][index]
}))) as fc.Arbitrary<Service[]>;

// Required features generator (ensures all 4 features are present)
export const requiredFeaturesArbitrary = fc.constant([
  'Qualified Medical Professionals',
  'Modern Medical Equipment',
  'Clean & Safe Environment',
  'Affordable Healthcare'
]).map(titles => titles.map((title, index) => ({
  id: `feature-${index}`,
  title,
  description: `Description for ${title}`,
  iconName: ['FaUserGraduate', 'FaStethoscope', 'FaShieldAlt', 'FaDollarSign'][index]
}))) as fc.Arbitrary<Feature[]>;

// Required navigation items generator
export const requiredNavigationArbitrary = fc.constant([
  'Home', 'Services', 'Doctors', 'Contact'
]).map(labels => labels.map(label => ({
  label,
  href: `/${label.toLowerCase()}`,
  active: false
}))) as fc.Arbitrary<NavigationItem[]>;

// Medical color generator
export const medicalColorArbitrary = fc.constantFrom(
  // Blues
  '#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a',
  // Greens  
  '#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d',
  // Grays/Whites
  '#ffffff', '#f9fafb', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#4b5563', '#374151', '#1f2937', '#111827'
);

// Typography generator
export const typographyArbitrary = fc.constantFrom('Inter', 'Roboto', 'Poppins');

// Viewport size generator
export const viewportArbitrary = fc.record({
  width: fc.integer({ min: 320, max: 1920 }),
  height: fc.integer({ min: 568, max: 1080 })
});

// Whitespace string generator (for testing empty input validation)
export const whitespaceStringArbitrary = fc.string().filter(s => s.trim().length === 0);

// Non-empty string generator
export const nonEmptyStringArbitrary = fc.string({ minLength: 1 }).filter(s => s.trim().length > 0);