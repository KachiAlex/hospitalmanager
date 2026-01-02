/**
 * Property-based tests for Hospital Homepage Redesign About Section
 * Tests universal correctness properties for content structure and typography
 */

import fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AboutSection from '../components/AboutSection';
import { AboutContent } from '../types';

// Test data generators
const aboutContentGenerator = fc.record({
  heading: fc.string({ minLength: 10, maxLength: 100 }),
  subheading: fc.string({ minLength: 10, maxLength: 80 }),
  description: fc.string({ minLength: 50, maxLength: 400 }),
  specializations: fc.array(fc.string({ minLength: 5, maxLength: 30 }), { minLength: 2, maxLength: 6 }),
  facilityImage: fc.record({
    src: fc.webUrl(),
    alt: fc.string({ minLength: 10, maxLength: 100 }),
    width: fc.integer({ min: 300, max: 800 }),
    height: fc.integer({ min: 200, max: 600 }),
    loading: fc.constantFrom('eager', 'lazy')
  }),
  ctaText: fc.string({ minLength: 5, maxLength: 30 })
});

describe('About Section Property Tests', () => {
  /**
   * Property 3: About Section Content and Structure
   * Validates: Requirements 2.1, 2.2, 2.3, 2.5
   * 
   * Universal Property: About section maintains proper content structure
   * and displays all required elements regardless of content variations
   */
  test('Property 3: About Section Content and Structure', () => {
    fc.assert(fc.property(aboutContentGenerator, (aboutContent: AboutContent) => {
      const mockOnLearnMore = jest.fn();
      
      const { container } = render(
        <AboutSection 
          content={aboutContent}
          onLearnMore={mockOnLearnMore}
        />
      );

      // Section structure validation
      const aboutSection = container.querySelector('.redesign-about');
      expect(aboutSection).toBeInTheDocument();
      expect(aboutSection).toHaveClass('redesign-section');
      expect(aboutSection).toHaveClass('redesign-bg-light');

      // Grid layout structure
      const aboutGrid = container.querySelector('.redesign-about-grid');
      expect(aboutGrid).toBeInTheDocument();
      expect(aboutGrid).toHaveClass('redesign-grid');

      // Content and image containers
      const aboutContent_elem = container.querySelector('.redesign-about-content');
      const aboutImage = container.querySelector('.redesign-about-image');
      
      expect(aboutContent_elem).toBeInTheDocument();
      expect(aboutImage).toBeInTheDocument();

      // Main heading presence and structure
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass('redesign-heading-2');
      expect(heading.textContent).toBe(aboutContent.heading);

      // Subheading presence and structure
      const subheading = screen.getByRole('heading', { level: 3 });
      expect(subheading).toBeInTheDocument();
      expect(subheading).toHaveClass('redesign-heading-5');
      expect(subheading.textContent).toBe(aboutContent.subheading);

      // Description text
      const description = screen.getByText(aboutContent.description);
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('redesign-body-large');

      // Specializations section
      const specializationsTitle = screen.getByText('Our Specializations:');
      expect(specializationsTitle).toBeInTheDocument();
      expect(specializationsTitle).toHaveClass('redesign-heading-6');

      // Specializations list
      const specializationsList = container.querySelector('.redesign-specializations-list');
      expect(specializationsList).toBeInTheDocument();

      // Each specialization item
      aboutContent.specializations.forEach((spec) => {
        const specItem = screen.getByText(spec);
        expect(specItem).toBeInTheDocument();
      });

      // CTA button
      const ctaButton = screen.getByRole('button');
      expect(ctaButton).toBeInTheDocument();
      expect(ctaButton).toHaveClass('redesign-btn');
      expect(ctaButton).toHaveClass('redesign-btn-primary');
      expect(ctaButton.textContent).toBe(aboutContent.ctaText);

      // Facility image
      const facilityImage = screen.getByRole('img');
      expect(facilityImage).toBeInTheDocument();
      expect(facilityImage).toHaveAttribute('src', aboutContent.facilityImage.src);
      expect(facilityImage).toHaveAttribute('alt', aboutContent.facilityImage.alt);

      return true;
    }), {
      numRuns: 50,
      verbose: true
    });
  });

  /**
   * Property 4: About Section Typography and Content Consistency
   * Validates: Requirements 2.4, 2.6
   * 
   * Universal Property: About section maintains consistent typography
   * and professional styling regardless of content variations
   */
  test('Property 4: About Section Typography and Content Consistency', () => {
    fc.assert(fc.property(aboutContentGenerator, (aboutContent: AboutContent) => {
      const mockOnLearnMore = jest.fn();
      
      const { container } = render(
        <AboutSection 
          content={aboutContent}
          onLearnMore={mockOnLearnMore}
        />
      );

      // Typography hierarchy validation
      const heading = screen.getByRole('heading', { level: 2 });
      const subheading = screen.getByRole('heading', { level: 3 });
      const specializationsTitle = screen.getByRole('heading', { level: 4 });

      // Heading hierarchy should be properly structured
      expect(heading).toHaveClass('redesign-heading-2');
      expect(subheading).toHaveClass('redesign-heading-5');
      expect(specializationsTitle).toHaveClass('redesign-heading-6');

      // Professional styling consistency
      expect(subheading).toHaveClass('redesign-text-secondary');
      
      // Description styling
      const description = screen.getByText(aboutContent.description);
      expect(description).toHaveClass('redesign-body-large');

      // Specializations container styling
      const specializationsContainer = container.querySelector('.redesign-specializations');
      expect(specializationsContainer).toBeInTheDocument();

      // Specialization items styling
      const specializationItems = container.querySelectorAll('.redesign-specialization-item');
      expect(specializationItems.length).toBe(aboutContent.specializations.length);

      specializationItems.forEach(item => {
        expect(item).toHaveClass('redesign-body-base');
        
        // Each item should have an icon
        const icon = item.querySelector('.redesign-specialization-icon');
        expect(icon).toBeInTheDocument();
      });

      // Image styling consistency
      const facilityImage = screen.getByRole('img');
      expect(facilityImage).toHaveClass('redesign-img-responsive');
      expect(facilityImage).toHaveClass('redesign-about-img');

      // CTA button styling
      const ctaButton = screen.getByRole('button');
      expect(ctaButton).toHaveClass('redesign-about-cta');

      // Accessibility attributes
      expect(ctaButton).toHaveAttribute('aria-label');
      expect(facilityImage).toHaveAttribute('loading');

      return true;
    }), {
      numRuns: 30,
      verbose: true
    });
  });

  /**
   * Property: About Section Specializations Display
   * Validates: Proper display and formatting of medical specializations
   * 
   * Universal Property: All specializations are displayed with proper formatting
   */
  test('Property: About Section Specializations Display', () => {
    fc.assert(fc.property(aboutContentGenerator, (aboutContent: AboutContent) => {
      const mockOnLearnMore = jest.fn();
      
      const { container } = render(
        <AboutSection 
          content={aboutContent}
          onLearnMore={mockOnLearnMore}
        />
      );

      // Specializations container should exist
      const specializationsContainer = container.querySelector('.redesign-specializations');
      expect(specializationsContainer).toBeInTheDocument();

      // Should have proper background and styling
      const computedStyle = window.getComputedStyle(specializationsContainer!);
      expect(computedStyle.borderLeftWidth).toBeTruthy();

      // All specializations should be rendered
      const specializationItems = container.querySelectorAll('.redesign-specialization-item');
      expect(specializationItems.length).toBe(aboutContent.specializations.length);

      // Each specialization should have proper structure
      aboutContent.specializations.forEach((spec, index) => {
        const specText = screen.getByText(spec);
        expect(specText).toBeInTheDocument();
        
        // Should be within a proper list item
        const listItem = specText.closest('.redesign-specialization-item');
        expect(listItem).toBeInTheDocument();
        
        // Should have an icon
        const icon = listItem?.querySelector('.redesign-specialization-icon');
        expect(icon).toBeInTheDocument();
        expect(icon?.textContent).toBe('✓');
      });

      return true;
    }), {
      numRuns: 25,
      verbose: true
    });
  });

  /**
   * Property: About Section Interaction Functionality
   * Validates: CTA button functionality and accessibility
   * 
   * Universal Property: About section CTA button is functional and accessible
   */
  test('Property: About Section CTA Functionality', () => {
    fc.assert(fc.property(aboutContentGenerator, (aboutContent: AboutContent) => {
      const mockOnLearnMore = jest.fn();
      
      render(
        <AboutSection 
          content={aboutContent}
          onLearnMore={mockOnLearnMore}
        />
      );

      const ctaButton = screen.getByRole('button');
      
      // Button should be clickable
      expect(ctaButton).not.toBeDisabled();
      
      // Button should have proper accessibility attributes
      expect(ctaButton).toHaveAttribute('aria-label');
      
      // Button text should match content
      expect(ctaButton.textContent).toBe(aboutContent.ctaText);

      // Button should have proper styling classes
      expect(ctaButton).toHaveClass('redesign-btn');
      expect(ctaButton).toHaveClass('redesign-btn-primary');
      expect(ctaButton).toHaveClass('redesign-about-cta');

      return true;
    }), {
      numRuns: 20,
      verbose: true
    });
  });
});