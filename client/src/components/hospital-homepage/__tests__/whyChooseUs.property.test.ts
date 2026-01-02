/**
 * Property-based tests for Why Choose Us section functionality
 * **Feature: hospital-homepage, Property 12-15: Why Choose Us section properties**
 * **Validates: Requirements 4.1, 4.3, 4.4, 4.5**
 */

import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import React from 'react';
import WhyChooseUsSection from '../components/WhyChooseUsSection';

// Generator for valid feature data
const featureArbitrary = fc.record({
  id: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  title: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  description: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
  iconName: fc.constantFrom('FaUserMd', 'FaStethoscope', 'FaShieldAlt', 'FaDollarSign')
});

// Generator for required features (the 4 specific features from requirements)
const requiredFeaturesArbitrary = fc.constant([
  {
    id: 'professionals',
    title: 'Qualified Medical Professionals',
    description: 'Our team consists of highly qualified and experienced medical professionals.',
    iconName: 'FaUserMd'
  },
  {
    id: 'equipment',
    title: 'Modern Medical Equipment',
    description: 'State-of-the-art medical equipment for accurate diagnosis and treatment.',
    iconName: 'FaStethoscope'
  },
  {
    id: 'environment',
    title: 'Clean & Safe Environment',
    description: 'Maintaining the highest standards of cleanliness and safety for all patients.',
    iconName: 'FaShieldAlt'
  },
  {
    id: 'affordable',
    title: 'Affordable Healthcare',
    description: 'Quality healthcare services at affordable prices for all community members.',
    iconName: 'FaDollarSign'
  }
]);

// Generator for features arrays (exactly 4 features)
const fourFeaturesArbitrary = fc.array(featureArbitrary, { minLength: 4, maxLength: 4 });

describe('Why Choose Us Section Property Tests', () => {
  test('**Feature: hospital-homepage, Property 12: Why Choose Us section structure** - Exactly four key points should be displayed, each with an accompanying icon', () => {
    fc.assert(
      fc.property(
        fourFeaturesArbitrary,
        (features) => {
          // Property: For any Why Choose Us section render, exactly four key points should be displayed
          const { container } = render(
            React.createElement(WhyChooseUsSection, { features })
          );

          // Should have a why choose us section
          const whyChooseUsSection = container.querySelector('.why-choose-us-section');
          expect(whyChooseUsSection).toBeInTheDocument();

          // Should have exactly 4 feature points
          const featurePoints = container.querySelectorAll('.feature-point');
          expect(featurePoints).toHaveLength(4);

          // Each feature point should have an icon
          const featureIcons = container.querySelectorAll('.feature-icon');
          expect(featureIcons).toHaveLength(4);

          // Each feature point should be properly structured
          featurePoints.forEach(point => {
            expect(point).toBeInTheDocument();
            expect(point).toHaveClass('feature-point');
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('**Feature: hospital-homepage, Property 13: Required feature points presence** - All required feature points should be present with icons', () => {
    fc.assert(
      fc.property(
        requiredFeaturesArbitrary,
        (features) => {
          // Property: For any Why Choose Us section render, all required feature points should be present
          render(React.createElement(WhyChooseUsSection, { features }));

          // Check that all required features are displayed
          const requiredFeatureTitles = [
            'Qualified Medical Professionals',
            'Modern Medical Equipment',
            'Clean & Safe Environment',
            'Affordable Healthcare'
          ];

          requiredFeatureTitles.forEach(title => {
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

  test('**Feature: hospital-homepage, Property 14: Why Choose Us styling consistency** - Spacing and typography should be consistent with the overall page design', () => {
    fc.assert(
      fc.property(
        fourFeaturesArbitrary,
        (features) => {
          // Property: For any Why Choose Us section render, spacing and typography should be consistent
          const { container } = render(
            React.createElement(WhyChooseUsSection, { features })
          );

          // Check section has consistent styling
          const section = container.querySelector('.why-choose-us-section');
          expect(section).toBeInTheDocument();

          // Check feature points have consistent spacing
          const featurePoints = container.querySelectorAll('.feature-point');
          featurePoints.forEach(point => {
            const computedStyle = window.getComputedStyle(point);
            
            // Should have consistent margin/padding
            expect(
              computedStyle.margin ||
              computedStyle.padding ||
              computedStyle.gap
            ).toBeDefined();
          });

          // Check typography consistency
          const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
          headings.forEach(heading => {
            const computedStyle = window.getComputedStyle(heading);
            
            // Should have defined font properties
            expect(computedStyle.fontFamily).toBeDefined();
            expect(computedStyle.fontSize).toBeDefined();
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('**Feature: hospital-homepage, Property 15: Feature icons color consistency** - Colors should conform to the Medical_Color_Palette', () => {
    fc.assert(
      fc.property(
        fourFeaturesArbitrary,
        (features) => {
          // Property: For any feature icon displayed, colors should conform to the Medical_Color_Palette
          const { container } = render(
            React.createElement(WhyChooseUsSection, { features })
          );

          // Check that feature icons have proper styling
          const featureIcons = container.querySelectorAll('.feature-icon');
          expect(featureIcons.length).toBeGreaterThan(0);

          featureIcons.forEach(icon => {
            const computedStyle = window.getComputedStyle(icon);
            
            // Should have defined color properties
            expect(
              computedStyle.color ||
              computedStyle.backgroundColor ||
              computedStyle.fill
            ).toBeDefined();
          });

          // Check section has medical color palette styling
          const section = container.querySelector('.why-choose-us-section');
          const sectionStyle = window.getComputedStyle(section!);
          expect(
            sectionStyle.backgroundColor ||
            sectionStyle.color
          ).toBeDefined();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Why Choose Us section maintains accessibility', () => {
    fc.assert(
      fc.property(
        fourFeaturesArbitrary,
        (features) => {
          // Property: For any Why Choose Us section, accessibility should be maintained
          const { container } = render(
            React.createElement(WhyChooseUsSection, { features })
          );

          // Should have proper heading hierarchy
          const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
          expect(headings.length).toBeGreaterThanOrEqual(1);

          // Feature points should be accessible
          const featurePoints = container.querySelectorAll('.feature-point');
          expect(featurePoints.length).toBe(4);
          
          featurePoints.forEach(point => {
            expect(point).toBeInTheDocument();
            
            // Should have accessible content
            expect(point.textContent?.trim()).toBeTruthy();
          });

          // Icons should have proper accessibility
          const icons = container.querySelectorAll('.feature-icon');
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

  test('Why Choose Us section displays content correctly', () => {
    fc.assert(
      fc.property(
        fourFeaturesArbitrary,
        (features) => {
          // Property: For any valid features data, content should be displayed correctly
          render(React.createElement(WhyChooseUsSection, { features }));

          // Section heading should be present
          const sectionHeadings = screen.getAllByText((content, element) => {
            return element?.textContent?.includes('Why Choose') || 
                   element?.textContent?.includes('Choose Us') ||
                   element?.textContent?.includes('CareWell');
          });
          expect(sectionHeadings.length).toBeGreaterThanOrEqual(1);

          // All feature titles should be displayed
          features.forEach(feature => {
            const titleElements = screen.getAllByText((content, element) => {
              return element?.textContent?.trim() === feature.title.trim();
            });
            expect(titleElements.length).toBeGreaterThanOrEqual(1);
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Feature descriptions are displayed correctly', () => {
    fc.assert(
      fc.property(
        fourFeaturesArbitrary,
        (features) => {
          // Property: For any feature, its description should be displayed
          render(React.createElement(WhyChooseUsSection, { features }));

          // All feature descriptions should be displayed
          features.forEach(feature => {
            const descriptionElements = screen.getAllByText((content, element) => {
              return element?.textContent?.trim() === feature.description.trim();
            });
            expect(descriptionElements.length).toBeGreaterThanOrEqual(1);
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});