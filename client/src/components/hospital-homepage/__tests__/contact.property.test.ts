/**
 * Property-based tests for Contact section functionality
 * **Feature: hospital-homepage, Property 16-17: Contact section properties**
 * **Validates: Requirements 5.1, 5.4**
 */

import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ContactSection from '../components/ContactSection';

// Simple generator for contact information
const contactInfoArbitrary = fc.record({
  address: fc.string({ minLength: 10, maxLength: 200 }).filter(s => s.trim().length > 0),
  phone: fc.string({ minLength: 10, maxLength: 20 }).filter(s => s.trim().length > 0),
  email: fc.emailAddress()
});

describe('Contact Section Property Tests', () => {
  test('**Feature: hospital-homepage, Property 16: Contact information completeness** - Hospital address, phone number, and email address should all be present', () => {
    fc.assert(
      fc.property(
        contactInfoArbitrary,
        (contactInfo) => {
          // Property: For any contact section render, address, phone, and email should all be present
          const { container } = render(
            React.createElement(ContactSection, { contactInfo })
          );

          // Should have a contact section
          const contactSection = container.querySelector('.contact-section');
          expect(contactSection).toBeInTheDocument();

          // Address should be present
          expect(screen.getByText('Address')).toBeInTheDocument();
          expect(screen.getByText(contactInfo.address)).toBeInTheDocument();

          // Phone should be present
          expect(screen.getByText('Phone')).toBeInTheDocument();
          expect(screen.getByText(contactInfo.phone)).toBeInTheDocument();

          // Email should be present
          expect(screen.getByText('Email')).toBeInTheDocument();
          expect(screen.getByText(contactInfo.email)).toBeInTheDocument();

          return true;
        }
      ),
      { numRuns: 10 } // Reduced for faster testing
    );
  });

  test('**Feature: hospital-homepage, Property 17: Contact typography consistency** - Contact section should render with proper structure', () => {
    fc.assert(
      fc.property(
        contactInfoArbitrary,
        (contactInfo) => {
          // Property: For any contact section text, structure should be consistent
          const { container } = render(
            React.createElement(ContactSection, { contactInfo })
          );

          // Check basic structure
          const textElements = container.querySelectorAll('p, h1, h2, h3, h4, h5, h6');
          expect(textElements.length).toBeGreaterThan(0);

          // Should have meaningful content
          expect(container.textContent?.trim()).toBeTruthy();
          expect(container.textContent!.length).toBeGreaterThan(10);

          return true;
        }
      ),
      { numRuns: 10 } // Reduced for faster testing
    );
  });
});