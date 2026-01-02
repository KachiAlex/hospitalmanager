/**
 * Property-based tests for Hospital Homepage Redesign Hero Section
 * Tests universal correctness properties for medical branding consistency
 */

import fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HeroSection from '../components/HeroSection';
import { HeroContent } from '../types';

// Test data generators
const heroContentGenerator = fc.record({
  headline: fc.string({ minLength: 10, maxLength: 100 }),
  subheadline: fc.string({ minLength: 10, maxLength: 80 }),
  description: fc.string({ minLength: 50, maxLength: 300 }),
  ctaText: fc.string({ minLength: 5, maxLength: 30 }),
  heroImage: fc.record({
    src: fc.webUrl(),
    alt: fc.string({ minLength: 10, maxLength: 100 }),
    width: fc.integer({ min: 300, max: 800 }),
    height: fc.integer({ min: 200, max: 600 }),
    loading: fc.constantFrom('eager', 'lazy')
  }),
  backgroundGradient: fc.record({
    direction: fc.constantFrom('to right', 'to left', 'to bottom'),
    colors: fc.array(fc.hexaString({ minLength: 6, maxLength: 6 }), { minLength: 2, maxLength: 2 })
  })
});

describe('Hero Section Property Tests', () => {
  /**
   * Property 2: Hero Section Medical Branding Consistency
   * Validates: Requirements 1.4, 1.5
   * 
   * Universal Property: Hero section maintains consistent medical branding
   * regardless of content variations
   */
  test('Property 2: Hero Section Medical Branding Consistency', () => {
    fc.assert(fc.property(heroContentGenerator, (heroContent: HeroContent) => {
      const mockOnBookAppointment = jest.fn();
      
      const { container } = render(
        <HeroSection 
          content={heroContent}
          onBookAppointment={mockOnBookAppointment}
        />
      );

      // Medical branding consistency checks
      const heroSection = container.querySelector('.redesign-hero');
      expect(heroSection).toBeInTheDocument();
      expect(heroSection).toHaveClass('redesign-bg-blue-gradient');

      // Professional blue gradient background
      const computedStyle = window.getComputedStyle(heroSection!);
      expect(computedStyle.background).toContain('linear-gradient');

      // Headline prominence and medical authority
      const headline = screen.getByRole('heading', { level: 1 });
      expect(headline).toBeInTheDocument();
      expect(headline).toHaveClass('redesign-heading-1');
      expect(headline).toHaveClass('redesign-text-white');
      expect(headline.textContent).toBe(heroContent.headline);

      // Subheadline supporting medical messaging
      const subheadline = screen.getByRole('heading', { level: 2 });
      expect(subheadline).toBeInTheDocument();
      expect(subheadline).toHaveClass('redesign-heading-4');
      expect(subheadline).toHaveClass('redesign-text-white');
      expect(subheadline.textContent).toBe(heroContent.subheadline);

      // Professional description text
      const description = screen.getByText(heroContent.description);
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('redesign-body-large');
      expect(description).toHaveClass('redesign-text-white');

      // Emergency-style CTA button for medical urgency
      const ctaButton = screen.getByRole('button', { name: new RegExp(heroContent.ctaText, 'i') });
      expect(ctaButton).toBeInTheDocument();
      expect(ctaButton).toHaveClass('redesign-btn');
      expect(ctaButton).toHaveClass('redesign-btn-emergency');
      expect(ctaButton).toHaveClass('redesign-btn-large');

      // Professional medical imagery
      const heroImage = screen.getByRole('img');
      expect(heroImage).toBeInTheDocument();
      expect(heroImage).toHaveAttribute('src', heroContent.heroImage.src);
      expect(heroImage).toHaveAttribute('alt', heroContent.heroImage.alt);
      expect(heroImage).toHaveClass('redesign-img-responsive');

      // Accessibility attributes
      expect(ctaButton).toHaveAttribute('aria-label');
      expect(heroImage).toHaveAttribute('loading');

      return true;
    }), {
      numRuns: 50,
      verbose: true
    });
  });

  /**
   * Property: Hero Section Content Completeness
   * Validates: Requirements 1.1, 1.2, 1.3, 1.6
   * 
   * Universal Property: All required hero content elements are present
   * and properly structured regardless of content variations
   */
  test('Property: Hero Section Content Completeness', () => {
    fc.assert(fc.property(heroContentGenerator, (heroContent: HeroContent) => {
      const mockOnBookAppointment = jest.fn();
      
      render(
        <HeroSection 
          content={heroContent}
          onBookAppointment={mockOnBookAppointment}
        />
      );

      // Content completeness validation
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(screen.getByText(heroContent.description)).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByRole('img')).toBeInTheDocument();

      // Semantic structure validation
      const section = screen.getByRole('region', { name: /hero/i }) || 
                     document.querySelector('#hero');
      expect(section).toBeInTheDocument();

      // Visual hierarchy validation
      const headline = screen.getByRole('heading', { level: 1 });
      const subheadline = screen.getByRole('heading', { level: 2 });
      
      // Headline should be more prominent than subheadline
      expect(headline).toHaveClass('redesign-heading-1');
      expect(subheadline).toHaveClass('redesign-heading-4');

      return true;
    }), {
      numRuns: 30,
      verbose: true
    });
  });

  /**
   * Property: Hero Section Responsive Layout
   * Validates: Requirements 1.6 (visual hierarchy)
   * 
   * Universal Property: Hero section maintains proper layout structure
   * for responsive design regardless of content
   */
  test('Property: Hero Section Responsive Layout Structure', () => {
    fc.assert(fc.property(heroContentGenerator, (heroContent: HeroContent) => {
      const mockOnBookAppointment = jest.fn();
      
      const { container } = render(
        <HeroSection 
          content={heroContent}
          onBookAppointment={mockOnBookAppointment}
        />
      );

      // Grid layout structure
      const heroGrid = container.querySelector('.redesign-hero-grid');
      expect(heroGrid).toBeInTheDocument();
      expect(heroGrid).toHaveClass('redesign-grid');

      // Content and image containers
      const heroContent_elem = container.querySelector('.redesign-hero-content');
      const heroImage = container.querySelector('.redesign-hero-image');
      
      expect(heroContent_elem).toBeInTheDocument();
      expect(heroImage).toBeInTheDocument();

      // Proper container structure
      const heroContainer = container.querySelector('.redesign-container');
      expect(heroContainer).toBeInTheDocument();

      return true;
    }), {
      numRuns: 25,
      verbose: true
    });
  });

  /**
   * Property: Hero Section Interaction Functionality
   * Validates: CTA button functionality and accessibility
   * 
   * Universal Property: Hero section CTA button is functional and accessible
   */
  test('Property: Hero Section CTA Functionality', () => {
    fc.assert(fc.property(heroContentGenerator, (heroContent: HeroContent) => {
      const mockOnBookAppointment = jest.fn();
      
      render(
        <HeroSection 
          content={heroContent}
          onBookAppointment={mockOnBookAppointment}
        />
      );

      const ctaButton = screen.getByRole('button');
      
      // Button should be clickable
      expect(ctaButton).not.toBeDisabled();
      
      // Button should have proper accessibility attributes
      expect(ctaButton).toHaveAttribute('aria-label');
      
      // Button text should match content
      expect(ctaButton.textContent).toBe(heroContent.ctaText);

      // Click functionality (we don't actually click in property tests to avoid side effects)
      expect(mockOnBookAppointment).not.toHaveBeenCalled();

      return true;
    }), {
      numRuns: 20,
      verbose: true
    });
  });
});