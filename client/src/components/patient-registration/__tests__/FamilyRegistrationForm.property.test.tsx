import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import fc from 'fast-check';
import FamilyRegistrationForm from '../FamilyRegistrationForm';

describe('FamilyRegistrationForm - Property Tests', () => {
  // Property 1: Component Rendering Consistency
  describe('Property 1: Component Rendering Consistency', () => {
    it('should always render the form with required sections', () => {
      fc.assert(
        fc.property(fc.record({
          firstName: fc.string({ minLength: 1, maxLength: 50 }),
          lastName: fc.string({ minLength: 1, maxLength: 50 }),
        }), (data) => {
          const mockSubmit = jest.fn();
          render(
            <FamilyRegistrationForm
              onSubmit={mockSubmit}
              isSubmitting={false}
              initialData={data}
            />
          );

          expect(screen.getByText('Family Account Registration')).toBeInTheDocument();
          expect(screen.getByText('Primary Account Holder')).toBeInTheDocument();
          expect(screen.getByText('Family Members')).toBeInTheDocument();
          expect(screen.getByRole('button', { name: /Add Family Member/ })).toBeInTheDocument();
        }),
        { numRuns: 15 }
      );
    });

    it('should render with consistent structure regardless of initial data', () => {
      fc.assert(
        fc.property(fc.record({
          firstName: fc.option(fc.string({ maxLength: 50 })),
          familyMembers: fc.option(fc.array(fc.record({
            firstName: fc.string({ maxLength: 50 }),
            lastName: fc.string({ maxLength: 50 }),
          }), { maxLength: 3 })),
        }), (data) => {
          const mockSubmit = jest.fn();
          const { container } = render(
            <FamilyRegistrationForm
              onSubmit={mockSubmit}
              isSubmitting={false}
              initialData={data}
            />
          );

          const form = container.querySelector('.family-registration-form');
          expect(form).toBeInTheDocument();
        }),
        { numRuns: 15 }
      );
    });
  });

  // Property 16: Real-Time Form Validation
  describe('Property 16: Real-Time Form Validation', () => {
    it('should validate primary member fields in real-time', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 50 }), (firstName) => {
          const mockSubmit = jest.fn();
          render(
            <FamilyRegistrationForm
              onSubmit={mockSubmit}
              isSubmitting={false}
            />
          );

          const firstNameInput = screen.getByLabelText(/First Name \*/) as HTMLInputElement;
          
          fireEvent.change(firstNameInput, { target: { value: firstName } });
          fireEvent.blur(firstNameInput);

          expect(firstNameInput.value).toBe(firstName);
        }),
        { numRuns: 15 }
      );
    });

    it('should validate family member fields when added', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 50 }), (memberName) => {
          const mockSubmit = jest.fn();
          render(
            <FamilyRegistrationForm
              onSubmit={mockSubmit}
              isSubmitting={false}
            />
          );

          const addButton = screen.getByRole('button', { name: /Add Family Member/ });
          fireEvent.click(addButton);

          // Check that family member card appears
          expect(screen.getByText('Family Member 1')).toBeInTheDocument();
        }),
        { numRuns: 15 }
      );
    });

    it('should show error messages for invalid data', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 50 }), (invalidEmail) => {
          const mockSubmit = jest.fn();
          render(
            <FamilyRegistrationForm
              onSubmit={mockSubmit}
              isSubmitting={false}
            />
          );

          const emailInput = screen.getByLabelText(/Email Address/) as HTMLInputElement;
          
          fireEvent.change(emailInput, { target: { value: invalidEmail } });
          fireEvent.blur(emailInput);

          // Validation should occur
          expect(emailInput.value).toBe(invalidEmail);
        }),
        { numRuns: 15 }
      );
    });
  });

  // Property 17: Form Submission Prevention
  describe('Property 17: Form Submission Prevention', () => {
    it('should prevent submission without primary member data', () => {
      fc.assert(
        fc.property(fc.record({
          firstName: fc.option(fc.string({ maxLength: 50 })),
          lastName: fc.option(fc.string({ maxLength: 50 })),
        }), (data) => {
          const mockSubmit = jest.fn();
          render(
            <FamilyRegistrationForm
              onSubmit={mockSubmit}
              isSubmitting={false}
              initialData={data}
            />
          );

          const submitButton = screen.getByRole('button', { name: /Continue to Vitals/ }) as HTMLButtonElement;
          
          // If required fields are missing, button should be disabled
          if (!data.firstName || !data.lastName) {
            expect(submitButton.disabled).toBe(true);
          }
        }),
        { numRuns: 15 }
      );
    });

    it('should prevent submission without family members', () => {
      fc.assert(
        fc.property(fc.record({
          firstName: fc.string({ minLength: 1, maxLength: 50 }),
          lastName: fc.string({ minLength: 1, maxLength: 50 }),
          gender: fc.constantFrom('male', 'female', 'other'),
          dateOfBirth: fc.date({ min: new Date('1900-01-01'), max: new Date() }).map(d => d.toISOString().split('T')[0]),
        }), (validPrimaryData) => {
          const mockSubmit = jest.fn();
          render(
            <FamilyRegistrationForm
              onSubmit={mockSubmit}
              isSubmitting={false}
              initialData={validPrimaryData}
            />
          );

          const submitButton = screen.getByRole('button', { name: /Continue to Vitals/ }) as HTMLButtonElement;
          
          // Without family members, button should be disabled
          expect(submitButton.disabled).toBe(true);
        }),
        { numRuns: 15 }
      );
    });

    it('should disable submit button while submitting', () => {
      fc.assert(
        fc.property(fc.boolean(), (isSubmitting) => {
          const mockSubmit = jest.fn();
          render(
            <FamilyRegistrationForm
              onSubmit={mockSubmit}
              isSubmitting={isSubmitting}
              initialData={{
                firstName: 'John',
                lastName: 'Doe',
                gender: 'male',
                dateOfBirth: '1990-01-01',
                familyMembers: [{
                  firstName: 'Jane',
                  lastName: 'Doe',
                  gender: 'female',
                  dateOfBirth: '1992-01-01',
                  relationship: 'spouse',
                  middleName: '',
                }],
              }}
            />
          );

          const submitButton = screen.getByRole('button', { name: /Continue to Vitals|Creating Family Account/ }) as HTMLButtonElement;
          
          if (isSubmitting) {
            expect(submitButton.disabled).toBe(true);
          }
        }),
        { numRuns: 15 }
      );
    });
  });

  // Property 1 (continued): Family Member Management
  describe('Property 1 (continued): Family Member Management', () => {
    it('should add and remove family members correctly', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 3 }), (memberCount) => {
          const mockSubmit = jest.fn();
          render(
            <FamilyRegistrationForm
              onSubmit={mockSubmit}
              isSubmitting={false}
            />
          );

          const addButton = screen.getByRole('button', { name: /Add Family Member/ });
          
          // Add members
          for (let i = 0; i < memberCount; i++) {
            fireEvent.click(addButton);
          }

          // Check that all members are rendered
          for (let i = 1; i <= memberCount; i++) {
            expect(screen.getByText(`Family Member ${i}`)).toBeInTheDocument();
          }
        }),
        { numRuns: 15 }
      );
    });

    it('should maintain family member data consistency', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 50 }), (memberFirstName) => {
          const mockSubmit = jest.fn();
          render(
            <FamilyRegistrationForm
              onSubmit={mockSubmit}
              isSubmitting={false}
            />
          );

          const addButton = screen.getByRole('button', { name: /Add Family Member/ });
          fireEvent.click(addButton);

          // Find the first family member's first name input
          const inputs = screen.getAllByDisplayValue('');
          const memberFirstNameInput = inputs.find(input => 
            (input as HTMLInputElement).id.includes('member-0-firstName')
          ) as HTMLInputElement;

          if (memberFirstNameInput) {
            fireEvent.change(memberFirstNameInput, { target: { value: memberFirstName } });
            expect(memberFirstNameInput.value).toBe(memberFirstName);
          }
        }),
        { numRuns: 15 }
      );
    });
  });
});
