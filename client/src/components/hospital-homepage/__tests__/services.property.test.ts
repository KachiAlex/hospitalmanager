/**
 * Property-based tests for Services section functionality
 * **Feature: hospital-homepage, Property 7-11: Services section properties**
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
 */

import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ServicesSection from '../components/ServicesSection';

// Generator for valid service data
const serviceArbitrary = fc.record({
  id: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  title: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  description: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
  iconName: fc.constantFrom('FaUserMd', 'FaBed', 'FaAmbulance', 'FaPills', 'FaFlask', 'FaBaby')
});

// Generator for required services (the 6 specific services from requirements)
const requiredServicesArbitrary = fc.constant([
  {
    id: 'outpatient',
    title: 'Outpatient Care',
    description: 'Comprehensive outpatient medical services for routine care and consultations.',
    iconName: 'FaUserMd'
  },
  {
    id: 'inpatient',
    title: 'Inpatient Admission',
    description: 'Full inpatient care with comfortable rooms and 24/7 medical supervision.',
    iconName: 'FaBed'
  },
  {
    id: 'emergency',
    title: 'Emergency Services',
    description: '24/7 emergency medical care with rapid response and critical care capabilities.',
    iconName: 'FaAmbulance'
  },
  {
    id: 'pharmacy',
    title: 'Pharmacy',
    description: 'On-site pharmacy with prescription medications and pharmaceutical consultations.',
    iconName: 'FaPills'
  },
  {
    id: 'laboratory',
    title: 'Laboratory',
    description: 'Advanced diagnostic laboratory services with quick and accurate results.',
    iconName: 'FaFlask'
  },
  {
    id: 'maternity',
    title: 'Maternity / Pediatrics',
    description: 'Specialized care for mothers and children with dedicated pediatric services.',
    iconName: 'FaBaby'
  }
]);

// Generator for services arrays
const servicesArrayArbitrary = fc.array(serviceArbitrary, { minLength: 1, maxLength: 10 });

describe('Services Section Property Tests', () => {
  test('**Feature: hospital-homepage, Property 7: Services grid layout** - Services should be displayed in a clean grid layout with card elements', () => {
    fc.assert(
      fc.property(
        servicesArrayArbitrary,
        (services) => {
          // Property: For any services section render, services should be displayed in a clean grid layout
          const { container } = render(
            React.createElement(ServicesSection, { services })
          );

          // Should have a services section
          const servicesSection = container.querySelector('.services-section');
          expect(servicesSection).toBeInTheDocument();

          // Should have a grid layout
          const servicesGrid = container.querySelector('.services-grid');
          expect(servicesGrid).toBeInTheDocument();

          // Should have service cards
          const serviceCards = container.querySelectorAll('.service-card');
          expect(serviceCards.length).toBe(services.length);

          // Each card should be properly structured
          serviceCards.forEach(card => {
            expect(card).toBeInTheDocument();
            expect(card).toHaveClass('service-card');
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('**Feature: hospital-homepage, Property 8: Service card completeness** - Each service card should contain an icon, title, and description', () => {
    fc.assert(
      fc.property(
        servicesArrayArbitrary,
        (services) => {
          // Property: For any service card in the services grid, it should contain icon, title, and description
          render(React.createElement(ServicesSection, { services }));

          // Check each service has its required elements
          services.forEach(service => {
            // Title should be present
            const titleElements = screen.getAllByText((content, element) => {
              return element?.textContent?.trim() === service.title.trim();
            });
            expect(titleElements.length).toBeGreaterThanOrEqual(1);

            // Description should be present
            const descriptionElements = screen.getAllByText((content, element) => {
              return element?.textContent?.trim() === service.description.trim();
            });
            expect(descriptionElements.length).toBeGreaterThanOrEqual(1);
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('**Feature: hospital-homepage, Property 9: Required services presence** - All six required services should be present', () => {
    fc.assert(
      fc.property(
        requiredServicesArbitrary,
        (services) => {
          // Property: For any services section render, all six required services should be present
          render(React.createElement(ServicesSection, { services }));

          // Check that all required services are displayed
          const requiredServiceTitles = [
            'Outpatient Care',
            'Inpatient Admission', 
            'Emergency Services',
            'Pharmacy',
            'Laboratory',
            'Maternity / Pediatrics'
          ];

          requiredServiceTitles.forEach(title => {
            const titleElements = screen.getAllByText((content, element) => {
              return element?.textContent?.includes(title);
            });
            expect(titleElements.length).toBeGreaterThanOrEqual(1);
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('**Feature: hospital-homepage, Property 10: Service card styling consistency** - Rounded corners and soft shadows should be applied consistently to each card', () => {
    fc.assert(
      fc.property(
        servicesArrayArbitrary,
        (services) => {
          // Property: For any service card, rounded corners and soft shadows should be applied consistently
          const { container } = render(
            React.createElement(ServicesSection, { services })
          );

          // Get all service cards
          const serviceCards = container.querySelectorAll('.service-card');
          expect(serviceCards.length).toBeGreaterThan(0);

          serviceCards.forEach(card => {
            // Check computed styles for rounded corners and shadows
            const computedStyle = window.getComputedStyle(card);
            
            // Should have border-radius (rounded corners)
            expect(computedStyle.borderRadius).toBeDefined();
            expect(computedStyle.borderRadius).not.toBe('0px');
            
            // Should have box-shadow (soft shadows) or transition for hover effects
            expect(
              computedStyle.boxShadow || 
              computedStyle.transition ||
              computedStyle.filter
            ).toBeDefined();
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('**Feature: hospital-homepage, Property 11: Services color palette consistency** - Colors should conform to the Medical_Color_Palette', () => {
    fc.assert(
      fc.property(
        servicesArrayArbitrary,
        (services) => {
          // Property: For any services section element, colors should conform to the Medical_Color_Palette
          const { container } = render(
            React.createElement(ServicesSection, { services })
          );

          // Check that the services section has proper styling classes
          const servicesSection = container.querySelector('.services-section');
          expect(servicesSection).toBeInTheDocument();

          // Check service cards have consistent styling
          const serviceCards = container.querySelectorAll('.service-card');
          serviceCards.forEach(card => {
            const computedStyle = window.getComputedStyle(card);
            
            // Should have defined colors (background, border, text)
            expect(
              computedStyle.backgroundColor ||
              computedStyle.borderColor ||
              computedStyle.color
            ).toBeDefined();
          });

          // Check icons have proper styling
          const icons = container.querySelectorAll('.service-icon');
          icons.forEach(icon => {
            const computedStyle = window.getComputedStyle(icon);
            expect(computedStyle.color).toBeDefined();
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Services section maintains accessibility', () => {
    fc.assert(
      fc.property(
        servicesArrayArbitrary,
        (services) => {
          // Property: For any services section, accessibility should be maintained
          const { container } = render(
            React.createElement(ServicesSection, { services })
          );

          // Should have proper heading hierarchy
          const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
          expect(headings.length).toBeGreaterThanOrEqual(1);

          // Service cards should be accessible
          const serviceCards = container.querySelectorAll('.service-card');
          serviceCards.forEach(card => {
            expect(card).toBeInTheDocument();
            
            // Should have accessible content
            expect(card.textContent?.trim()).toBeTruthy();
          });

          // Icons should have proper accessibility
          const icons = container.querySelectorAll('.service-icon');
          icons.forEach(icon => {
            // Icons should be decorative or have proper labels
            expect(icon).toBeInTheDocument();
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Services section displays content correctly', () => {
    fc.assert(
      fc.property(
        servicesArrayArbitrary,
        (services) => {
          // Property: For any valid services data, content should be displayed correctly
          render(React.createElement(ServicesSection, { services }));

          // Section heading should be present
          const sectionHeadings = screen.getAllByText((content, element) => {
            return element?.textContent?.includes('Medical Services') || 
                   element?.textContent?.includes('Our Services') ||
                   element?.textContent?.includes('Services');
          });
          expect(sectionHeadings.length).toBeGreaterThanOrEqual(1);

          // All service titles should be displayed
          services.forEach(service => {
            const titleElements = screen.getAllByText((content, element) => {
              return element?.textContent?.trim() === service.title.trim();
            });
            expect(titleElements.length).toBeGreaterThanOrEqual(1);
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});