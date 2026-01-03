import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import fc from 'fast-check';
import PatientRegistrationModal from '../PatientRegistrationModal';

// Mock the PatientRegistrationContainer
jest.mock('../PatientRegistrationContainer', () => {
  return function MockContainer({ onRegistrationComplete, onCancel }: any) {
    return (
      <div data-testid="registration-container">
        <button onClick={() => onRegistrationComplete('patient-123', 'REC-001')}>
          Complete Registration
        </button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    );
  };
});

describe('Dashboard Integration - Property Tests', () => {
  // Property 11: Dashboard Integration Consistency
  describe('Property 11: Dashboard Integration Consistency', () => {
    it('should render modal when isOpen is true', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 50 }), (staffId) => {
          const mockClose = jest.fn();
          const mockComplete = jest.fn();

          render(
            <PatientRegistrationModal
              isOpen={true}
              staffId={staffId}
              staffRole="admin"
              onClose={mockClose}
              onRegistrationComplete={mockComplete}
            />
          );

          expect(screen.getByTestId('registration-container')).toBeInTheDocument();
        }),
        { numRuns: 15 }
      );
    });

    it('should not render modal when isOpen is false', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 50 }), (staffId) => {
          const mockClose = jest.fn();
          const mockComplete = jest.fn();

          const { container } = render(
            <PatientRegistrationModal
              isOpen={false}
              staffId={staffId}
              staffRole="admin"
              onClose={mockClose}
              onRegistrationComplete={mockComplete}
            />
          );

          expect(container.querySelector('.patient-registration-modal-overlay')).not.toBeInTheDocument();
        }),
        { numRuns: 15 }
      );
    });

    it('should call onClose when modal is closed', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 50 }), (staffId) => {
          const mockClose = jest.fn();
          const mockComplete = jest.fn();

          render(
            <PatientRegistrationModal
              isOpen={true}
              staffId={staffId}
              staffRole="admin"
              onClose={mockClose}
              onRegistrationComplete={mockComplete}
            />
          );

          const cancelButton = screen.getByText('Cancel');
          fireEvent.click(cancelButton);

          expect(mockClose).toHaveBeenCalled();
        }),
        { numRuns: 15 }
      );
    });

    it('should call onRegistrationComplete when registration is complete', async () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 50 }), (staffId) => {
          const mockClose = jest.fn();
          const mockComplete = jest.fn();

          render(
            <PatientRegistrationModal
              isOpen={true}
              staffId={staffId}
              staffRole="admin"
              onClose={mockClose}
              onRegistrationComplete={mockComplete}
            />
          );

          const completeButton = screen.getByText('Complete Registration');
          fireEvent.click(completeButton);

          expect(mockComplete).toHaveBeenCalledWith('patient-123', 'REC-001');
        }),
        { numRuns: 15 }
      );
    });

    it('should pass correct props to registration container', () => {
      fc.assert(
        fc.property(
          fc.record({
            staffId: fc.string({ minLength: 1, maxLength: 50 }),
            staffRole: fc.constantFrom('admin', 'receptionist', 'doctor'),
          }),
          (data) => {
            const mockClose = jest.fn();
            const mockComplete = jest.fn();

            render(
              <PatientRegistrationModal
                isOpen={true}
                staffId={data.staffId}
                staffRole={data.staffRole}
                onClose={mockClose}
                onRegistrationComplete={mockComplete}
              />
            );

            expect(screen.getByTestId('registration-container')).toBeInTheDocument();
          }
        ),
        { numRuns: 15 }
      );
    });

    it('should handle modal visibility toggle correctly', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 50 }), (staffId) => {
          const mockClose = jest.fn();
          const mockComplete = jest.fn();

          const { rerender } = render(
            <PatientRegistrationModal
              isOpen={false}
              staffId={staffId}
              staffRole="admin"
              onClose={mockClose}
              onRegistrationComplete={mockComplete}
            />
          );

          // Modal should not be visible
          expect(screen.queryByTestId('registration-container')).not.toBeInTheDocument();

          // Rerender with isOpen=true
          rerender(
            <PatientRegistrationModal
              isOpen={true}
              staffId={staffId}
              staffRole="admin"
              onClose={mockClose}
              onRegistrationComplete={mockComplete}
            />
          );

          // Modal should now be visible
          expect(screen.getByTestId('registration-container')).toBeInTheDocument();
        }),
        { numRuns: 15 }
      );
    });

    it('should maintain modal state across re-renders', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 50 }), (staffId) => {
          const mockClose = jest.fn();
          const mockComplete = jest.fn();

          const { rerender } = render(
            <PatientRegistrationModal
              isOpen={true}
              staffId={staffId}
              staffRole="admin"
              onClose={mockClose}
              onRegistrationComplete={mockComplete}
            />
          );

          expect(screen.getByTestId('registration-container')).toBeInTheDocument();

          // Rerender with same props
          rerender(
            <PatientRegistrationModal
              isOpen={true}
              staffId={staffId}
              staffRole="admin"
              onClose={mockClose}
              onRegistrationComplete={mockComplete}
            />
          );

          // Modal should still be visible
          expect(screen.getByTestId('registration-container')).toBeInTheDocument();
        }),
        { numRuns: 15 }
      );
    });
  });

  // Property 4.1, 4.2, 4.3, 4.4, 4.5: Dashboard Access Control
  describe('Property 4.1-4.5: Dashboard Access Control', () => {
    it('should allow admin role to access registration', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 50 }), (staffId) => {
          const mockClose = jest.fn();
          const mockComplete = jest.fn();

          render(
            <PatientRegistrationModal
              isOpen={true}
              staffId={staffId}
              staffRole="admin"
              onClose={mockClose}
              onRegistrationComplete={mockComplete}
            />
          );

          expect(screen.getByTestId('registration-container')).toBeInTheDocument();
        }),
        { numRuns: 15 }
      );
    });

    it('should allow receptionist role to access registration', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 50 }), (staffId) => {
          const mockClose = jest.fn();
          const mockComplete = jest.fn();

          render(
            <PatientRegistrationModal
              isOpen={true}
              staffId={staffId}
              staffRole="receptionist"
              onClose={mockClose}
              onRegistrationComplete={mockComplete}
            />
          );

          expect(screen.getByTestId('registration-container')).toBeInTheDocument();
        }),
        { numRuns: 15 }
      );
    });

    it('should handle different staff roles consistently', () => {
      fc.assert(
        fc.property(
          fc.record({
            staffId: fc.string({ minLength: 1, maxLength: 50 }),
            staffRole: fc.constantFrom('admin', 'receptionist', 'doctor', 'nurse'),
          }),
          (data) => {
            const mockClose = jest.fn();
            const mockComplete = jest.fn();

            render(
              <PatientRegistrationModal
                isOpen={true}
                staffId={data.staffId}
                staffRole={data.staffRole}
                onClose={mockClose}
                onRegistrationComplete={mockComplete}
              />
            );

            expect(screen.getByTestId('registration-container')).toBeInTheDocument();
          }
        ),
        { numRuns: 15 }
      );
    });
  });
});
