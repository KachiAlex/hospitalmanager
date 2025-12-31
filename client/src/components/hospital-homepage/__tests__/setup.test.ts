/**
 * Test setup verification
 * This test ensures that the testing framework is properly configured
 */

import * as fc from 'fast-check';
import { serviceArbitrary, featureArbitrary } from '../test-utils/generators';

describe('Testing Framework Setup', () => {
  test('Jest and React Testing Library are working', () => {
    expect(true).toBe(true);
  });

  test('fast-check property testing is working', () => {
    fc.assert(
      fc.property(fc.integer(), (n) => {
        return n + 0 === n;
      }),
      { numRuns: 100 }
    );
  });

  test('Service generator produces valid services', () => {
    fc.assert(
      fc.property(serviceArbitrary, (service) => {
        expect(service).toHaveProperty('id');
        expect(service).toHaveProperty('title');
        expect(service).toHaveProperty('description');
        expect(service).toHaveProperty('iconName');
        expect(typeof service.id).toBe('string');
        expect(typeof service.title).toBe('string');
        expect(typeof service.description).toBe('string');
        expect(typeof service.iconName).toBe('string');
        expect(service.id.trim().length).toBeGreaterThan(0);
        expect(service.title.trim().length).toBeGreaterThan(0);
        expect(service.description.trim().length).toBeGreaterThan(0);
        return true;
      }),
      { numRuns: 100 }
    );
  });

  test('Feature generator produces valid features', () => {
    fc.assert(
      fc.property(featureArbitrary, (feature) => {
        expect(feature).toHaveProperty('id');
        expect(feature).toHaveProperty('title');
        expect(feature).toHaveProperty('description');
        expect(feature).toHaveProperty('iconName');
        expect(typeof feature.id).toBe('string');
        expect(typeof feature.title).toBe('string');
        expect(typeof feature.description).toBe('string');
        expect(typeof feature.iconName).toBe('string');
        expect(feature.id.trim().length).toBeGreaterThan(0);
        expect(feature.title.trim().length).toBeGreaterThan(0);
        expect(feature.description.trim().length).toBeGreaterThan(0);
        return true;
      }),
      { numRuns: 100 }
    );
  });
});