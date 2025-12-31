/**
 * Integration test for Hospital Homepage
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HospitalHomepage from '../HospitalHomepage';

describe('HospitalHomepage Integration', () => {
  test('renders all main sections', () => {
    const mockBookAppointment = jest.fn();
    const mockStaffLogin = jest.fn();
    const mockContactUs = jest.fn();

    render(
      <HospitalHomepage
        onBookAppointment={mockBookAppointment}
        onStaffLogin={mockStaffLogin}
        onContactUs={mockContactUs}
      />
    );

    // Check that main sections are rendered
    expect(screen.getByRole('banner')).toBeInTheDocument(); // Header
    expect(screen.getByRole('main')).toBeInTheDocument(); // Main content
    expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // Footer

    // Check key content
    expect(screen.getByText('Quality Healthcare You Can Trust')).toBeInTheDocument();
    expect(screen.getByText('Our Medical Services')).toBeInTheDocument();
    expect(screen.getByText('Why Choose CareWell Medical Center?')).toBeInTheDocument();
    expect(screen.getByText('Get In Touch')).toBeInTheDocument();
  });

  test('navigation buttons work correctly', () => {
    const mockBookAppointment = jest.fn();
    const mockStaffLogin = jest.fn();
    const mockContactUs = jest.fn();

    render(
      <HospitalHomepage
        onBookAppointment={mockBookAppointment}
        onStaffLogin={mockStaffLogin}
        onContactUs={mockContactUs}
      />
    );

    // Test Book Appointment buttons (there are multiple)
    const bookButtons = screen.getAllByText('Book Appointment');
    fireEvent.click(bookButtons[0]);
    expect(mockBookAppointment).toHaveBeenCalled();

    // Test Staff Login button (use the one with aria-label)
    const staffLoginButton = screen.getByLabelText('Staff Login');
    fireEvent.click(staffLoginButton);
    expect(mockStaffLogin).toHaveBeenCalled();

    // Test Contact Us button
    const contactButton = screen.getByText('Contact Us');
    fireEvent.click(contactButton);
    expect(mockContactUs).toHaveBeenCalled();
  });

  test('displays all required services', () => {
    render(<HospitalHomepage />);

    // Check that all 6 required services are displayed
    expect(screen.getByText('Outpatient Care')).toBeInTheDocument();
    expect(screen.getByText('Inpatient Admission')).toBeInTheDocument();
    expect(screen.getByText('Emergency Services')).toBeInTheDocument();
    expect(screen.getByText('Pharmacy')).toBeInTheDocument();
    expect(screen.getByText('Laboratory')).toBeInTheDocument();
    expect(screen.getByText('Maternity / Pediatrics')).toBeInTheDocument();
  });

  test('displays all required features', () => {
    render(<HospitalHomepage />);

    // Check that all 4 required features are displayed
    expect(screen.getByText('Qualified Medical Professionals')).toBeInTheDocument();
    expect(screen.getByText('Modern Medical Equipment')).toBeInTheDocument();
    expect(screen.getByText('Clean & Safe Environment')).toBeInTheDocument();
    expect(screen.getByText('Affordable Healthcare')).toBeInTheDocument();
  });

  test('displays contact information', () => {
    render(<HospitalHomepage />);

    // Check contact information is displayed
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('(555) 123-4567')).toBeInTheDocument();
    expect(screen.getByText('info@carewellmedical.com')).toBeInTheDocument();
  });

  test('has proper accessibility structure', () => {
    render(<HospitalHomepage />);

    // Check for proper heading hierarchy
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent('Quality Healthcare You Can Trust');

    const h2Elements = screen.getAllByRole('heading', { level: 2 });
    expect(h2Elements.length).toBeGreaterThan(0);

    // Check for navigation landmarks
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});