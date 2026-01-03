import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import fc from 'fast-check';
import AccountTypeSelector from '../AccountTypeSelector';

describe('AccountTypeSelector - Property Tests', () => {
  // Property 1: Component Rendering Consistency
  describe('Property 1: Component Rendering Consistency', () => {
    it('should always render both account type options', () => {
      fc.assert(
        fc.property(fc.boolean(), (hasSelection) => {
          const mockSelect = jest.fn();
          const selectedType = hasSelection ? 'personal' : undefined;

          render(
            <AccountTypeSelector
              onSelect={mockSelect}
              selectedType={selectedType as any}
            />
          );

          expect(screen.getByText('Select Account Type')).toBeInTheDocument();
          expect(screen.getByText('Personal Account')).toBeInTheDocument();
          expect(screen.getByText('Family Account')).toBeInTheDocument();
        }),
        { numRuns: 15 }
      );
    });

    it('should render with consistent structure regardless of selection state', () => {
      fc.assert(
        fc.property(fc.constantFrom('personal', 'family', undefined), (selectedType) => {
          const mockSelect = jest.fn();
          const { container } = render(
            <AccountTypeSelector
              onSelect={mockSelect}
              selectedType={selectedType as any}
            />
          );

          const selector = container.querySelector('.account-type-selector');
          expect(selector).toBeInTheDocument();
          expect(container.querySelectorAll('.account-option').length).toBe(2);
        }),
        { numRuns: 15 }
      );
    });

    it('should render selection info section', () => {
      fc.assert(
        fc.property(fc.boolean(), (hasSelection) => {
          const mockSelect = jest.fn();
          const selectedType = hasSelection ? 'personal' : undefined;

          render(
            <AccountTypeSelector
              onSelect={mockSelect}
              selectedType={selectedType as any}
            />
          );

          const selectionInfo = screen.getByText(/You have selected|Choose the type/);
          expect(selectionInfo).toBeInTheDocument();
        }),
        { numRuns: 15 }
      );
    });

    it('should render with proper accessibility attributes', () => {
      fc.assert(
        fc.property(fc.boolean(), (hasSelection) => {
          const mockSelect = jest.fn();
          const selectedType = hasSelection ? 'personal' : undefined;

          render(
            <AccountTypeSelector
              onSelect={mockSelect}
              selectedType={selectedType as any}
            />
          );

          const options = screen.getAllByRole('button');
          expect(options.length).toBeGreaterThanOrEqual(2);
        }),
        { numRuns: 15 }
      );
    });
  });

  // Property 1 (continued): Selection State Management
  describe('Property 1 (continued): Selection State Management', () => {
    it('should highlight selected account type', () => {
      fc.assert(
        fc.property(fc.constantFrom('personal', 'family'), (selectedType) => {
          const mockSelect = jest.fn();
          const { container } = render(
            <AccountTypeSelector
              onSelect={mockSelect}
              selectedType={selectedType}
            />
          );

          const selectedOptions = container.querySelectorAll('.account-option.selected');
          expect(selectedOptions.length).toBe(1);
        }),
        { numRuns: 15 }
      );
    });

    it('should not highlight any option when no selection', () => {
      fc.assert(
        fc.property(fc.constant(undefined), (selectedType) => {
          const mockSelect = jest.fn();
          const { container } = render(
            <AccountTypeSelector
              onSelect={mockSelect}
              selectedType={selectedType as any}
            />
          );

          const selectedOptions = container.querySelectorAll('.account-option.selected');
          expect(selectedOptions.length).toBe(0);
        }),
        { numRuns: 15 }
      );
    });

    it('should call onSelect with correct type when personal option is clicked', () => {
      fc.assert(
        fc.property(fc.boolean(), (hasInitialSelection) => {
          const mockSelect = jest.fn();
          const initialType = hasInitialSelection ? 'family' : undefined;

          render(
            <AccountTypeSelector
              onSelect={mockSelect}
              selectedType={initialType as any}
            />
          );

          const personalOption = screen.getByText('Personal Account').closest('.account-option');
          if (personalOption) {
            fireEvent.click(personalOption);
            expect(mockSelect).toHaveBeenCalledWith('personal');
          }
        }),
        { numRuns: 15 }
      );
    });

    it('should call onSelect with correct type when family option is clicked', () => {
      fc.assert(
        fc.property(fc.boolean(), (hasInitialSelection) => {
          const mockSelect = jest.fn();
          const initialType = hasInitialSelection ? 'personal' : undefined;

          render(
            <AccountTypeSelector
              onSelect={mockSelect}
              selectedType={initialType as any}
            />
          );

          const familyOption = screen.getByText('Family Account').closest('.account-option');
          if (familyOption) {
            fireEvent.click(familyOption);
            expect(mockSelect).toHaveBeenCalledWith('family');
          }
        }),
        { numRuns: 15 }
      );
    });

    it('should handle keyboard selection for personal account', () => {
      fc.assert(
        fc.property(fc.boolean(), (hasInitialSelection) => {
          const mockSelect = jest.fn();
          const initialType = hasInitialSelection ? 'family' : undefined;

          render(
            <AccountTypeSelector
              onSelect={mockSelect}
              selectedType={initialType as any}
            />
          );

          const personalOption = screen.getByText('Personal Account').closest('.account-option');
          if (personalOption) {
            fireEvent.keyDown(personalOption, { key: 'Enter' });
            expect(mockSelect).toHaveBeenCalledWith('personal');
          }
        }),
        { numRuns: 15 }
      );
    });

    it('should handle keyboard selection for family account', () => {
      fc.assert(
        fc.property(fc.boolean(), (hasInitialSelection) => {
          const mockSelect = jest.fn();
          const initialType = hasInitialSelection ? 'personal' : undefined;

          render(
            <AccountTypeSelector
              onSelect={mockSelect}
              selectedType={initialType as any}
            />
          );

          const familyOption = screen.getByText('Family Account').closest('.account-option');
          if (familyOption) {
            fireEvent.keyDown(familyOption, { key: ' ' });
            expect(mockSelect).toHaveBeenCalledWith('family');
          }
        }),
        { numRuns: 15 }
      );
    });
  });

  // Property 1 (continued): Display Text Consistency
  describe('Property 1 (continued): Display Text Consistency', () => {
    it('should display correct selection message for personal account', () => {
      fc.assert(
        fc.property(fc.constant('personal'), (selectedType) => {
          const mockSelect = jest.fn();

          render(
            <AccountTypeSelector
              onSelect={mockSelect}
              selectedType={selectedType}
            />
          );

          expect(screen.getByText(/You have selected Personal Account/)).toBeInTheDocument();
        }),
        { numRuns: 15 }
      );
    });

    it('should display correct selection message for family account', () => {
      fc.assert(
        fc.property(fc.constant('family'), (selectedType) => {
          const mockSelect = jest.fn();

          render(
            <AccountTypeSelector
              onSelect={mockSelect}
              selectedType={selectedType}
            />
          );

          expect(screen.getByText(/You have selected Family Account/)).toBeInTheDocument();
        }),
        { numRuns: 15 }
      );
    });

    it('should display feature lists for both account types', () => {
      fc.assert(
        fc.property(fc.boolean(), (hasSelection) => {
          const mockSelect = jest.fn();
          const selectedType = hasSelection ? 'personal' : undefined;

          render(
            <AccountTypeSelector
              onSelect={mockSelect}
              selectedType={selectedType as any}
            />
          );

          expect(screen.getByText('Individual patient profile')).toBeInTheDocument();
          expect(screen.getByText('Primary account holder')).toBeInTheDocument();
        }),
        { numRuns: 15 }
      );
    });
  });
});
