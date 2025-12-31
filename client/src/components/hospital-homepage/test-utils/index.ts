import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { HospitalInfo, PageContent } from '../types';
import { defaultHospitalInfo, defaultPageContent } from '../data/defaultContent';

// Custom render function with default props
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  hospitalInfo?: Partial<HospitalInfo>;
  pageContent?: Partial<PageContent>;
}

export const renderWithDefaults = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { hospitalInfo, pageContent, ...renderOptions } = options;
  
  // Merge provided props with defaults
  const mergedHospitalInfo = { ...defaultHospitalInfo, ...hospitalInfo };
  const mergedPageContent = { ...defaultPageContent, ...pageContent };
  
  return render(ui, renderOptions);
};

// Test data generators for property-based testing
export const generateValidService = () => ({
  id: `service-${Math.random().toString(36).substr(2, 9)}`,
  title: `Test Service ${Math.random().toString(36).substr(2, 5)}`,
  description: `Test description for service ${Math.random().toString(36).substr(2, 10)}`,
  iconName: 'FaUserMd'
});

export const generateValidFeature = () => ({
  id: `feature-${Math.random().toString(36).substr(2, 9)}`,
  title: `Test Feature ${Math.random().toString(36).substr(2, 5)}`,
  description: `Test description for feature ${Math.random().toString(36).substr(2, 10)}`,
  iconName: 'FaStethoscope'
});

export const generateValidContactInfo = () => ({
  address: `${Math.floor(Math.random() * 9999)} Test St, Test City, TS ${Math.floor(Math.random() * 99999)}`,
  phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
  email: `test${Math.random().toString(36).substr(2, 5)}@example.com`,
  mapEmbedUrl: 'https://maps.google.com/embed?pb=test'
});

// Accessibility test helpers
export const checkAccessibility = async (container: HTMLElement) => {
  // Check for proper heading hierarchy
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  expect(headings.length).toBeGreaterThan(0);
  
  // Check for alt text on images
  const images = container.querySelectorAll('img');
  images.forEach(img => {
    expect(img).toHaveAttribute('alt');
  });
  
  // Check for proper button/link accessibility
  const interactiveElements = container.querySelectorAll('button, a');
  interactiveElements.forEach(element => {
    expect(element).toBeVisible();
  });
};

// Color palette validation helpers
export const medicalColors = {
  blue: ['#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'],
  green: ['#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'],
  gray: ['#ffffff', '#f9fafb', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#4b5563', '#374151', '#1f2937', '#111827']
};

export const isValidMedicalColor = (color: string): boolean => {
  const allColors = [...medicalColors.blue, ...medicalColors.green, ...medicalColors.gray];
  return allColors.includes(color.toLowerCase());
};

// Typography validation helpers
export const approvedFonts = ['Inter', 'Roboto', 'Poppins'];

export const isValidTypography = (fontFamily: string): boolean => {
  return approvedFonts.some(font => fontFamily.includes(font));
};

// Responsive design test helpers
export const viewportSizes = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1200, height: 800 },
  large: { width: 1920, height: 1080 }
};

export const setViewportSize = (size: keyof typeof viewportSizes) => {
  const { width, height } = viewportSizes[size];
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
  Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: height });
  window.dispatchEvent(new Event('resize'));
};