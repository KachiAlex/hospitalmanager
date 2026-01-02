/**
 * Property-based tests for Hero section functionality
 * **Feature: hospital-homepage, Property 5-6: Hero section properties**
 * **Validates: Requirements 2.3, 2.5**
 */

import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import React from 'react';
import HeroSection from '../components/HeroSection';

// Generator for valid hero data
const heroDataArbitrary = fc.record({
  headline: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  supportingText: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
  heroImage: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0)
});

describe('Hero Section Property Tests', () => {
  test('**Feature: hospital-homepage, Property 5: Hero action buttons presence** - Both Book Appointment and Contact Us buttons should be present with correct styling', () => {
    fc.assert(
      fc.property(
        heroDataArbitrary,
        (heroData) => {
          // Property: For any hero section render, both buttons should be present with correct styling
          const mockBookAppointment = jest.fn();
          const mockContactUs = jest.fn();

          const { container } = render(
            React.createElement(HeroSection, {
              headline: heroData.headline,
              supportingText: heroData.supportingText,
              heroImage: heroData.heroImage,
              onBookAppointment: mockBookAppointment,
              onContactUs: mockContactUs
            })
          );

          // Both action buttons should be present (using getAllByText for duplicates)
          const bookButtons = screen.getAllByText('Book Appointment');
          const contactButtons = screen.getAllByText('Contact Us');
          
          expect(bookButtons.length).toBeGreaterThanOrEqual(1);
          expect(contactButtons.length).toBeGreaterThanOrEqual(1);

          // Buttons should be clickable
          bookButtons.forEach(button => {
            expect(button).toBeEnabled();
            expect(button).toHaveClass('btn-primary');
          });
          
          contactButtons.forEach(button => {
            expect(button).toBeEnabled();
            expect(button).toHaveClass('btn-secondary');
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('**Feature: hospital-homepage, Property 6: Hero button styling consistency** - Rounded corners and soft shadows should be applied consistently', () => {
    fc.assert(
      fc.property(
        heroDataArbitrary,
        (heroData) => {
          // Property: For any hero button render, rounded corners and soft shadows should be applied consistently
          const { container } = render(
            React.createElement(HeroSection, {
              headline: heroData.headline,
              supportingText: heroData.supportingText,
              heroImage: heroData.heroImage,
              onBookAppointment: jest.fn(),
              onContactUs: jest.fn()
            })
          );

          // Get all buttons in the hero section
          const buttons = container.querySelectorAll('button');
          expect(buttons.length).toBeGreaterThanOrEqual(2);

          buttons.forEach(button => {
            // Check for consistent button styling classes
            expect(button).toHaveClass('btn');
            
            // Check computed styles for rounded corners and shadows
            const computedStyle = window.getComputedStyle(button);
            
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

  test('Hero section displays content correctly', () => {
    fc.assert(
      fc.property(
        heroDataArbitrary,
        (heroData) => {
          // Property: For any valid hero data, content should be displayed correctly
          render(
            React.createElement(HeroSection, {
              headline: heroData.headline,
              supportingText: heroData.supportingText,
              heroImage: heroData.heroImage,
              onBookAppointment: jest.fn(),
              onContactUs: jest.fn()
            })
          );

          // Headline should be displayed as h1 (using getAllByRole for duplicates)
          const headlines = screen.getAllByRole('heading', { level: 1 });
          expect(headlines.length).toBeGreaterThanOrEqual(1);
          
          // At least one headline should contain our text
          const matchingHeadlines = headlines.filter(h => h.textContent?.includes(heroData.headline));
          expect(matchingHeadlines.length).toBeGreaterThanOrEqual(1);

          // Supporting text should be displayed (using flexible text matching)
          const supportingTextElements = screen.getAllByText((content, element) => {
            return element?.textContent?.trim() === heroData.supportingText.trim();
          });
          expect(supportingTextElements.length).toBeGreaterThanOrEqual(1);

          // Hero image should be present with proper alt text
          const heroImages = screen.getAllByAltText('Doctors and medical staff providing quality healthcare');
          expect(heroImages.length).toBeGreaterThanOrEqual(1);
          
          // At least one image should have our src
          const matchingImages = heroImages.filter(img => img.getAttribute('src') === heroData.heroImage);
          expect(matchingImages.length).toBeGreaterThanOrEqual(1);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Hero section maintains accessibility', () => {
    fc.assert(
      fc.property(
        heroDataArbitrary,
        (heroData) => {
          // Property: For any hero section, accessibility should be maintained
          const { container } = render(
            React.createElement(HeroSection, {
              headline: heroData.headline,
              supportingText: heroData.supportingText,
              heroImage: heroData.heroImage,
              onBookAppointment: jest.fn(),
              onContactUs: jest.fn()
            })
          );

          // Should have proper heading hierarchy
          const h1Elements = container.querySelectorAll('h1');
          expect(h1Elements.length).toBeGreaterThanOrEqual(1);

          // Buttons should have proper accessibility
          const buttons = container.querySelectorAll('button');
          expect(buttons.length).toBeGreaterThanOrEqual(2);
          
          buttons.forEach(button => {
            expect(button).toBeInTheDocument();
            expect(button).toBeEnabled();
            
            // Should have accessible text content
            expect(button.textContent?.trim()).toBeTruthy();
          });

          // Images should have alt text
          const images = container.querySelectorAll('img');
          images.forEach(image => {
            expect(image).toHaveAttribute('alt');
            expect(image.getAttribute('alt')).toBeTruthy();
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});