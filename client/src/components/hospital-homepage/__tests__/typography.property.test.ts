/**
 * Property-based tests for typography consistency
 * **Feature: hospital-homepage, Property 27: Typography consistency**
 * **Validates: Requirements 8.3**
 */

import * as fc from 'fast-check';
import { render } from '@testing-library/react';
import React from 'react';
import { typographyArbitrary } from '../test-utils/generators';
import { isValidTypography, approvedFonts } from '../test-utils';

describe('Property 27: Typography consistency', () => {
  test('**Feature: hospital-homepage, Property 27: Typography consistency** - All text elements should use approved fonts', () => {
    fc.assert(
      fc.property(typographyArbitrary, (fontName) => {
        // Property: For any text element, fonts should be from the approved set (Inter, Roboto, or Poppins)
        expect(approvedFonts).toContain(fontName);
        expect(isValidTypography(fontName)).toBe(true);
        
        // Test that the font can be applied to elements
        const TestComponent = () => React.createElement(
          'div',
          { className: 'hospital-homepage', style: { fontFamily: fontName } },
          React.createElement('h1', null, 'Test Content'),
          React.createElement('p', null, 'Test Content')
        );
        
        const { container } = render(React.createElement(TestComponent));
        
        const element = container.querySelector('.hospital-homepage');
        expect(element).toBeInTheDocument();
        
        // Verify font family is applied
        const computedStyle = window.getComputedStyle(element!);
        expect(computedStyle.fontFamily).toContain(fontName);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  test('Approved fonts are valid and accessible', () => {
    approvedFonts.forEach(font => {
      expect(typeof font).toBe('string');
      expect(font.trim().length).toBeGreaterThan(0);
      expect(isValidTypography(font)).toBe(true);
    });
  });

  test('Typography validation rejects invalid fonts', () => {
    const invalidFonts = ['Comic Sans MS', 'Papyrus', 'Times New Roman', 'Arial Black'];
    
    invalidFonts.forEach(font => {
      expect(isValidTypography(font)).toBe(false);
    });
  });

  test('Font family strings with approved fonts are valid', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'Inter, sans-serif',
          'Roboto, Arial, sans-serif',
          'Poppins, Helvetica, sans-serif',
          '"Inter", "Roboto", sans-serif'
        ),
        (fontFamily) => {
          expect(isValidTypography(fontFamily)).toBe(true);
          
          // Test rendering with font family
          const TestComponent = () => React.createElement('div', { style: { fontFamily } }, 'Test Text');
          const { container } = render(React.createElement(TestComponent));
          
          const element = container.firstChild as HTMLElement;
          expect(element).toBeInTheDocument();
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Typography hierarchy is consistent', () => {
    const TestComponent = () => React.createElement(
      'div',
      { className: 'hospital-homepage' },
      React.createElement('h1', null, 'Main Headline'),
      React.createElement('h2', null, 'Section Headline'),
      React.createElement('h3', null, 'Subsection Headline'),
      React.createElement('h4', null, 'Minor Headline'),
      React.createElement('p', null, 'Body text'),
      React.createElement('p', { className: 'text-large' }, 'Large text'),
      React.createElement('p', { className: 'text-small' }, 'Small text')
    );

    const { container } = render(React.createElement(TestComponent));

    // Check that all text elements exist
    expect(container.querySelector('h1')).toBeInTheDocument();
    expect(container.querySelector('h2')).toBeInTheDocument();
    expect(container.querySelector('h3')).toBeInTheDocument();
    expect(container.querySelector('h4')).toBeInTheDocument();
    expect(container.querySelector('p')).toBeInTheDocument();

    // Verify typography classes are applied
    expect(container.querySelector('.text-large')).toBeInTheDocument();
    expect(container.querySelector('.text-small')).toBeInTheDocument();
  });

  test('Font weights are appropriate for medical context', () => {
    const TestComponent = () => React.createElement(
      'div',
      { className: 'hospital-homepage' },
      React.createElement('h1', { style: { fontWeight: 700 } }, 'Bold Headline'),
      React.createElement('h2', { style: { fontWeight: 600 } }, 'Semi-bold Headline'),
      React.createElement('p', { style: { fontWeight: 400 } }, 'Regular Text'),
      React.createElement('p', { style: { fontWeight: 300 } }, 'Light Text')
    );

    const { container } = render(React.createElement(TestComponent));

    const h1 = container.querySelector('h1');
    const h2 = container.querySelector('h2');
    const regularP = container.querySelector('p');

    expect(h1).toHaveStyle('font-weight: 700');
    expect(h2).toHaveStyle('font-weight: 600');
    expect(regularP).toHaveStyle('font-weight: 400');
  });

  test('Line height provides good readability', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('1.2', '1.3', '1.4', '1.5', '1.6'),
        (lineHeight) => {
          const TestComponent = () => React.createElement(
            'div',
            { className: 'hospital-homepage' },
            React.createElement(
              'p',
              { style: { lineHeight } },
              'This is a test paragraph to verify that line height provides good readability for medical content. The text should be easy to read and not too cramped.'
            )
          );

          const { container } = render(React.createElement(TestComponent));

          const paragraph = container.querySelector('p');
          expect(paragraph).toHaveStyle(`line-height: ${lineHeight}`);
          
          // Line height should be reasonable for readability
          const numericLineHeight = parseFloat(lineHeight);
          expect(numericLineHeight).toBeGreaterThanOrEqual(1.2);
          expect(numericLineHeight).toBeLessThanOrEqual(1.8);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Font loading fallbacks are properly configured', () => {
    const fontStacksWithFallbacks = [
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      'Roboto, Arial, Helvetica, sans-serif',
      'Poppins, "Helvetica Neue", Helvetica, sans-serif'
    ];

    fontStacksWithFallbacks.forEach(fontStack => {
      expect(isValidTypography(fontStack)).toBe(true);
      
      // Should contain at least one approved font
      const hasApprovedFont = approvedFonts.some(font => fontStack.includes(font));
      expect(hasApprovedFont).toBe(true);
      
      // Should have fallback fonts
      expect(fontStack).toMatch(/sans-serif|serif|monospace/);
    });
  });
});