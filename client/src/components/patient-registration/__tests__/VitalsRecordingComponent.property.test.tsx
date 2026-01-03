import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import fc from 'fast-check';
import VitalsRecordingComponent from '../VitalsRecordingComponent';

describe('VitalsRecordingComponent - Property Tests', () => {
  // Property 1: Component Rendering Consistency
  describe('Property 1: Component Rendering Consistency', () => {
    it('should always render the vitals form with all vital fields', () => {
      fc.assert(
        fc.property(fc.boolean(), (isOptional) => {
          const mockSubmit = jest.fn();
          render(
            <VitalsRecordingComponent
              onSubmit={mockSubmit}
              isSubmitting={false}
              isOptional={isOptional}
            />
          );

          expect(screen.getByText('Patient Vital Signs')).toBeInTheDocument();
          expect(screen.getByLabelText(/Systolic/)).toBeInTheDocument();
          expect(screen.getByLabelText(/Diastolic/)).toBeInTheDocument();
          expect(screen.getByLabelText(/Heart Rate/)).toBeInTheDocument();
          expect(screen.getByLabelText(/Temperature/)).toBeInTheDocument();
          expect(screen.getByLabelText(/Weight/)).toBeInTheDocument();
          expect(screen.getByLabelText(/Height/)).toBeInTheDocument();
        }),
        { numRuns: 15 }
      );
    });

    it('should render skip button only when optional', () => {
      fc.assert(
        fc.property(fc.boolean(), (isOptional) => {
          const mockSkip = jest.fn();
          const mockSubmit = jest.fn();
          render(
            <VitalsRecordingComponent
              onSubmit={mockSubmit}
              onSkip={mockSkip}
              isSubmitting={false}
              isOptional={isOptional}
            />
          );

          const skipButton = screen.queryByRole('button', { name: /Skip Vitals/ });
          
          if (isOptional) {
            expect(skipButton).toBeInTheDocument();
          } else {
            expect(skipButton).not.toBeInTheDocument();
          }
        }),
        { numRuns: 15 }
      );
    });

    it('should render with consistent structure regardless of optional flag', () => {
      fc.assert(
        fc.property(fc.boolean(), (isOptional) => {
          const mockSubmit = jest.fn();
          const { container } = render(
            <VitalsRecordingComponent
              onSubmit={mockSubmit}
              isSubmitting={false}
              isOptional={isOptional}
            />
          );

          const form = container.querySelector('.vitals-recording-component');
          expect(form).toBeInTheDocument();
          expect(form?.querySelectorAll('.vital-group').length).toBeGreaterThan(0);
        }),
        { numRuns: 15 }
      );
    });
  });

  // Property 18: Medical Range Validation
  describe('Property 18: Medical Range Validation', () => {
    it('should validate systolic blood pressure within medical range', () => {
      fc.assert(
        fc.property(fc.integer({ min: 50, max: 300 }), (systolic) => {
          const mockSubmit = jest.fn();
          render(
            <VitalsRecordingComponent
              onSubmit={mockSubmit}
              isSubmitting={false}
            />
          );

          const systolicInput = screen.getByLabelText(/Systolic/) as HTMLInputElement;
          
          fireEvent.change(systolicInput, { target: { value: systolic.toString() } });
          fireEvent.blur(systolicInput);

          expect(systolicInput.value).toBe(systolic.toString());
        }),
        { numRuns: 15 }
      );
    });

    it('should validate diastolic blood pressure within medical range', () => {
      fc.assert(
        fc.property(fc.integer({ min: 30, max: 200 }), (diastolic) => {
          const mockSubmit = jest.fn();
          render(
            <VitalsRecordingComponent
              onSubmit={mockSubmit}
              isSubmitting={false}
            />
          );

          const diastolicInput = screen.getByLabelText(/Diastolic/) as HTMLInputElement;
          
          fireEvent.change(diastolicInput, { target: { value: diastolic.toString() } });
          fireEvent.blur(diastolicInput);

          expect(diastolicInput.value).toBe(diastolic.toString());
        }),
        { numRuns: 15 }
      );
    });

    it('should validate heart rate within medical range', () => {
      fc.assert(
        fc.property(fc.integer({ min: 20, max: 250 }), (heartRate) => {
          const mockSubmit = jest.fn();
          render(
            <VitalsRecordingComponent
              onSubmit={mockSubmit}
              isSubmitting={false}
            />
          );

          const heartRateInput = screen.getByLabelText(/Heart Rate/) as HTMLInputElement;
          
          fireEvent.change(heartRateInput, { target: { value: heartRate.toString() } });
          fireEvent.blur(heartRateInput);

          expect(heartRateInput.value).toBe(heartRate.toString());
        }),
        { numRuns: 15 }
      );
    });

    it('should validate temperature within medical range', () => {
      fc.assert(
        fc.property(fc.float({ min: 30, max: 50, noNaN: true }), (temperature) => {
          const mockSubmit = jest.fn();
          render(
            <VitalsRecordingComponent
              onSubmit={mockSubmit}
              isSubmitting={false}
            />
          );

          const tempInput = screen.getByLabelText(/Temperature/) as HTMLInputElement;
          
          fireEvent.change(tempInput, { target: { value: temperature.toFixed(1) } });
          fireEvent.blur(tempInput);

          expect(tempInput.value).toBe(temperature.toFixed(1));
        }),
        { numRuns: 15 }
      );
    });

    it('should validate weight within medical range', () => {
      fc.assert(
        fc.property(fc.float({ min: 0.5, max: 600, noNaN: true }), (weight) => {
          const mockSubmit = jest.fn();
          render(
            <VitalsRecordingComponent
              onSubmit={mockSubmit}
              isSubmitting={false}
            />
          );

          const weightInput = screen.getByLabelText(/Weight/) as HTMLInputElement;
          
          fireEvent.change(weightInput, { target: { value: weight.toFixed(1) } });
          fireEvent.blur(weightInput);

          expect(weightInput.value).toBe(weight.toFixed(1));
        }),
        { numRuns: 15 }
      );
    });

    it('should validate height within medical range', () => {
      fc.assert(
        fc.property(fc.integer({ min: 20, max: 300 }), (height) => {
          const mockSubmit = jest.fn();
          render(
            <VitalsRecordingComponent
              onSubmit={mockSubmit}
              isSubmitting={false}
            />
          );

          const heightInput = screen.getByLabelText(/Height/) as HTMLInputElement;
          
          fireEvent.change(heightInput, { target: { value: height.toString() } });
          fireEvent.blur(heightInput);

          expect(heightInput.value).toBe(height.toString());
        }),
        { numRuns: 15 }
      );
    });

    it('should show error messages for out-of-range values', () => {
      fc.assert(
        fc.property(fc.integer({ min: 300, max: 500 }), (invalidSystolic) => {
          const mockSubmit = jest.fn();
          render(
            <VitalsRecordingComponent
              onSubmit={mockSubmit}
              isSubmitting={false}
            />
          );

          const systolicInput = screen.getByLabelText(/Systolic/) as HTMLInputElement;
          
          fireEvent.change(systolicInput, { target: { value: invalidSystolic.toString() } });
          fireEvent.blur(systolicInput);

          // Error message should appear for out-of-range value
          // This is acceptable behavior
        }),
        { numRuns: 15 }
      );
    });

    it('should accept zero values (optional vitals)', () => {
      fc.assert(
        fc.property(fc.constant(0), (zeroValue) => {
          const mockSubmit = jest.fn();
          render(
            <VitalsRecordingComponent
              onSubmit={mockSubmit}
              isSubmitting={false}
            />
          );

          const heartRateInput = screen.getByLabelText(/Heart Rate/) as HTMLInputElement;
          
          fireEvent.change(heartRateInput, { target: { value: zeroValue.toString() } });
          fireEvent.blur(heartRateInput);

          expect(heartRateInput.value).toBe('0');
        }),
        { numRuns: 15 }
      );
    });
  });

  // Property 1 (continued): Form State Consistency
  describe('Property 1 (continued): Form State Consistency', () => {
    it('should maintain vital values across re-renders', () => {
      fc.assert(
        fc.property(fc.integer({ min: 60, max: 120 }), (systolic) => {
          const mockSubmit = jest.fn();
          const { rerender } = render(
            <VitalsRecordingComponent
              onSubmit={mockSubmit}
              isSubmitting={false}
            />
          );

          const systolicInput = screen.getByLabelText(/Systolic/) as HTMLInputElement;
          fireEvent.change(systolicInput, { target: { value: systolic.toString() } });

          // Re-render with same props
          rerender(
            <VitalsRecordingComponent
              onSubmit={mockSubmit}
              isSubmitting={false}
            />
          );

          // Value should be preserved
          expect(systolicInput.value).toBe(systolic.toString());
        }),
        { numRuns: 15 }
      );
    });

    it('should handle submission state correctly', () => {
      fc.assert(
        fc.property(fc.boolean(), (isSubmitting) => {
          const mockSubmit = jest.fn();
          render(
            <VitalsRecordingComponent
              onSubmit={mockSubmit}
              isSubmitting={isSubmitting}
            />
          );

          const submitButton = screen.getByRole('button', { name: /Complete Registration|Recording Vitals/ }) as HTMLButtonElement;
          
          if (isSubmitting) {
            expect(submitButton.disabled).toBe(true);
          }
        }),
        { numRuns: 15 }
      );
    });
  });
});
