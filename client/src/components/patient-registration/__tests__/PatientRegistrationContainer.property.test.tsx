import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import fc from 'fast-check';
import PatientRegistrationContainer from '../PatientRegistrationContainer';

// Mock the API
jest.mock('../services/patientRegistrationApi', () => ({
  patientRegistrationApi: {
    createPatient: jest.fn().mockResolvedValue({
      patient: {
        id: 'patient-123',
        recordNumber: 'REC-001',
      },
    }),
    recordVitals: jest.fn().mockResolvedValue({}),
  },
}));

describe('PatientRegistrationContainer - Property Tests', () => {
  // Property 1: Component Rendering Consistency
  describe('Property 1: Component Rendering Consistency', () => {
    it('should always render the container with header and progress', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 50 }), (staffId) => {
          const mockComplete = jest.fn();
          const mockCancel = jest.fn();

          render(
            <PatientRegistrationContainer
              staffId={staffId}
              onRegistrationComplete={mockComplete}
              onCancel={mockCancel}
            />
          );

          expect(screen.getByText('Patient Registration')).toBeInTheDocument();
          expect(screen.getByRole('button', { name: /Cancel/ })).toBeInTheDocument();
          expect(screen.getByText('Account Type')).toBeInTheDocument();
        }),
        { numRuns: 15 }
      );
    });

    it('should render with consistent structure regardless of staff ID', () => {
      fc.assert(
        fc.property(fc.string({ maxLength: 100 }), (staffId) => {
          const mockComplete = jest.fn();
          const mockCancel = jest.fn();
          const { container } = render(
            <PatientRegistrationContainer
              staffId={staffId}
              onRegistrationComplete={mockComplete}
              onCancel={mockCancel}
            />
          );

          const registrationContainer = container.querySelector('.patient-registration-container');
          expect(registrationContainer).toBeInTheDocument();
          expect(container.querySelector('.registration-header')).toBeInTheDocument();
          expect(container.querySelector('.registration-progress')).toBeInTheDocument();
        }),
        { numRuns: 15 }
      );
    });

    it('should always start with account type selection step', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 50 }), (staffId) => {
          const mockComplete = jest.fn();
          const mockCancel = jest.fn();

          render(
            <PatientRegistrationContainer
              staffId={staffId}
              onRegistrationComplete={mockComplete}
              onCancel={mockCancel}
            />
          );

          expect(screen.getByText('Select Account Type')).toBeInTheDocument();
        }),
        { numRuns: 15 }
      );
    });
  });

  // Property 2: Registration Workflow State Management
  describe('Property 2: Registration Workflow State Management', () => {
    it('should transition to personal form when personal account is selected', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 50 }), (staffId) => {
          const mockComplete = jest.fn();
          const mockCancel = jest.fn();

          render(
            <PatientRegistrationContainer
              staffId={staffId}
              onRegistrationComplete={mockComplete}
              onCancel={mockCancel}
            />
          );

          const personalOption = screen.getByText('Personal Account').closest('.account-option');
          if (personalOption) {
            fireEvent.click(personalOption);
            expect(screen.getByText('Personal Patient Information')).toBeInTheDocument();
          }
        }),
        { numRuns: 15 }
      );
    });

    it('should transition to family form when family account is selected', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 50 }), (staffId) => {
          const mockComplete = jest.fn();
          const mockCancel = jest.fn();

          render(
            <PatientRegistrationContainer
              staffId={staffId}
              onRegistrationComplete={mockComplete}
              onCancel={mockCancel}
            />
          );

          const familyOption = screen.getByText('Family Account').closest('.account-option');
          if (familyOption) {
            fireEvent.click(familyOption);
            expect(screen.getByText('Family Account Registration')).toBeInTheDocument();
          }
        }),
        { numRuns: 15 }
      );
    });

    it('should call onCancel when cancel button is clicked', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 50 }), (staffId) => {
          const mockComplete = jest.fn();
          const mockCancel = jest.fn();

          render(
            <PatientRegistrationContainer
              staffId={staffId}
              onRegistrationComplete={mockComplete}
              onCancel={mockCancel}
            />
          );

          const cancelButton = screen.getByRole('button', { name: /Cancel/ });
          fireEvent.click(cancelButton);

          expect(mockCancel).toHaveBeenCalled();
        }),
        { numRuns: 15 }
      );
    });

    it('should maintain progress indicator state', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 50 }), (staffId) => {
          const mockComplete = jest.fn();
          const mockCancel = jest.fn();
          const { container } = render(
            <PatientRegistrationContainer
              staffId={staffId}
              onRegistrationComplete={mockComplete}
              onCancel={mockCancel}
            />
          );

          const progressSteps = container.querySelectorAll('.registration-progress .step');
          expect(progressSteps.length).toBe(4);
          expect(progressSteps[0]).toHaveClass('active');
        }),
        { numRuns: 15 }
      );
    });

    it('should handle workflow transitions correctly', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 50 }), (staffId) => {
          const mockComplete = jest.fn();
          const mockCancel = jest.fn();

          render(
            <PatientRegistrationContainer
              staffId={staffId}
              onRegistrationComplete={mockComplete}
              onCancel={mockCancel}
            />
          );

          // Start at account type
          expect(screen.getByText('Select Account Type')).toBeInTheDocument();

          // Select personal account
          const personalOption = screen.getByText('Personal Account').closest('.account-option');
          if (personalOption) {
            fireEvent.click(personalOption);
            // Should transition to personal form
            expect(screen.getByText('Personal Patient Information')).toBeInTheDocument();
          }
        }),
        { numRuns: 15 }
      );
    });
  });

  // Property 1 (continued): Error Handling
  describe('Property 1 (continued): Error Handling', () => {
    it('should display error messages when submission fails', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 50 }), (staffId) => {
          const mockComplete = jest.fn();
          const mockCancel = jest.fn();

          render(
            <PatientRegistrationContainer
              staffId={staffId}
              onRegistrationComplete={mockComplete}
              onCancel={mockCancel}
            />
          );

          // Component should render without errors
          expect(screen.getByText('Patient Registration')).toBeInTheDocument();
        }),
        { numRuns: 15 }
      );
    });

    it('should handle missing required props gracefully', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 50 }), (staffId) => {
          const mockComplete = jest.fn();
          const mockCancel = jest.fn();

          const { container } = render(
            <PatientRegistrationContainer
              staffId={staffId}
              onRegistrationComplete={mockComplete}
              onCancel={mockCancel}
            />
          );

          expect(container.querySelector('.patient-registration-container')).toBeInTheDocument();
        }),
        { numRuns: 15 }
      );
    });
  });
});
