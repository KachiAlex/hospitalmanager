import React from 'react';
import { render, screen } from '@testing-library/react';
import ServicesSection from '../components/ServicesSection';

describe('ServicesSection Component', () => {
  const mockServices = [
    {
      id: '1',
      title: 'Emergency Care',
      description: 'Round-the-clock emergency services',
      iconName: 'FaHeartbeat'
    },
    {
      id: '2',
      title: 'Surgery',
      description: 'Advanced surgical procedures',
      iconName: 'FaScalpel'
    }
  ];

  it('should render services section with title', () => {
    render(<ServicesSection services={mockServices} />);
    expect(screen.getByText('Our Medical Services')).toBeInTheDocument();
  });

  it('should render all service cards', () => {
    render(<ServicesSection services={mockServices} />);
    expect(screen.getByText('Emergency Care')).toBeInTheDocument();
    expect(screen.getByText('Surgery')).toBeInTheDocument();
  });

  it('should render service descriptions', () => {
    render(<ServicesSection services={mockServices} />);
    expect(screen.getByText('Round-the-clock emergency services')).toBeInTheDocument();
    expect(screen.getByText('Advanced surgical procedures')).toBeInTheDocument();
  });

  it('should have correct section id when provided', () => {
    const { container } = render(<ServicesSection services={mockServices} id="services" />);
    const section = container.querySelector('#services');
    expect(section).toBeInTheDocument();
  });
});
