/**
 * Property-based tests for medical color palette consistency
 * **Feature: hospital-homepage, Property 26: Medical color palette consistency**
 * **Validates: Requirements 8.2**
 */

import * as fc from 'fast-check';
import { 
  medicalColorPalette, 
  isValidMedicalColor, 
  getMedicalColorByName, 
  ColorManager 
} from '../styles/colorManager';
import { medicalColorArbitrary } from '../test-utils/generators';

describe('Property 26: Medical color palette consistency', () => {
  let colorManager: ColorManager;

  beforeEach(() => {
    colorManager = new ColorManager();
    // Create a mock document element for testing
    Object.defineProperty(document, 'documentElement', {
      value: {
        style: {
          setProperty: jest.fn(),
          getPropertyValue: jest.fn()
        }
      },
      writable: true
    });
  });

  test('**Feature: hospital-homepage, Property 26: Medical color palette consistency** - All visual elements should conform to medical color palette', () => {
    fc.assert(
      fc.property(medicalColorArbitrary, (color) => {
        // Property: For any visual element rendered, colors should conform to the medical color palette
        expect(isValidMedicalColor(color)).toBe(true);
        
        // All medical colors should be valid hex colors
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
        
        // Medical colors should be from the approved palette
        const allValidColors = [
          ...Object.values(medicalColorPalette.blue),
          ...Object.values(medicalColorPalette.green),
          ...Object.values(medicalColorPalette.gray),
          ...Object.values(medicalColorPalette.semantic)
        ];
        
        expect(allValidColors).toContain(color);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  test('Medical color palette contains only blue, green, and white tones', () => {
    // Test that all colors in the palette are appropriate medical colors
    const blueColors = Object.values(medicalColorPalette.blue);
    const greenColors = Object.values(medicalColorPalette.green);
    const grayColors = Object.values(medicalColorPalette.gray);

    // All colors should be valid hex codes
    [...blueColors, ...greenColors, ...grayColors].forEach(color => {
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(isValidMedicalColor(color)).toBe(true);
    });

    // Verify we have the expected number of colors
    expect(blueColors).toHaveLength(10);
    expect(greenColors).toHaveLength(10);
    expect(grayColors).toHaveLength(11); // includes white
  });

  test('Color name resolution works correctly', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('blue-600', 'green-500', 'gray-white', 'primary', 'secondary'),
        (colorName) => {
          const resolvedColor = getMedicalColorByName(colorName);
          expect(resolvedColor).not.toBeNull();
          expect(typeof resolvedColor).toBe('string');
          expect(resolvedColor).toMatch(/^#[0-9a-fA-F]{6}$/);
          expect(isValidMedicalColor(resolvedColor!)).toBe(true);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('ColorManager applies medical palette correctly', () => {
    const mockSetProperty = jest.fn();
    const mockGetPropertyValue = jest.fn().mockReturnValue('#2563eb');
    
    Object.defineProperty(document, 'documentElement', {
      value: {
        style: {
          setProperty: mockSetProperty,
          getPropertyValue: mockGetPropertyValue
        }
      },
      writable: true
    });

    const manager = new ColorManager();
    manager.applyMedicalPalette();

    // Verify that CSS custom properties are set for medical colors
    expect(mockSetProperty).toHaveBeenCalledWith('--medical-blue-600', '#2563eb');
    expect(mockSetProperty).toHaveBeenCalledWith('--medical-green-600', '#16a34a');
    expect(mockSetProperty).toHaveBeenCalledWith('--medical-gray-white', '#ffffff');
    // Semantic colors are transformed from camelCase to kebab-case
    expect(mockSetProperty).toHaveBeenCalledWith('--primary', '#2563eb');
    expect(mockSetProperty).toHaveBeenCalledWith('--primary-hover', '#1d4ed8');
  });

  test('Invalid colors are rejected', () => {
    const invalidColors = ['#ff0000', '#00ff00', '#0000ff', 'red', 'blue', '#xyz123'];
    
    invalidColors.forEach(color => {
      expect(isValidMedicalColor(color)).toBe(false);
    });
  });

  test('Semantic colors map to valid medical colors', () => {
    const semanticColors = medicalColorPalette.semantic;
    
    Object.values(semanticColors).forEach(color => {
      expect(isValidMedicalColor(color)).toBe(true);
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$|^rgba?\(/);
    });
  });
});