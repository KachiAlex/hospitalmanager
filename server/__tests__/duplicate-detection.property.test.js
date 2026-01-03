const fc = require('fast-check');
const request = require('supertest');
const app = require('../app');
const { db } = require('../db');

describe('Property 4: Duplicate Detection Accuracy', () => {
  beforeEach(() => {
    // Clean up test data
    db.prepare('DELETE FROM registration_audit').run();
    db.prepare('DELETE FROM family_members').run();
    db.prepare('DELETE FROM next_of_kin').run();
    db.prepare('DELETE FROM patients').run();
  });

  afterAll(() => {
    // Clean up after all tests
    db.prepare('DELETE FROM registration_audit').run();
    db.prepare('DELETE FROM family_members').run();
    db.prepare('DELETE FROM next_of_kin').run();
    db.prepare('DELETE FROM patients').run();
  });

  test('Property 4.1: Duplicate detection finds exact matches', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          firstName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          lastName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          dateOfBirth: fc.date({ min: new Date('1900-01-01'), max: new Date('2024-12-31') })
            .map(d => d.toISOString().split('T')[0]),
          gender: fc.constantFrom('male', 'female', 'other'),
          phone: fc.option(fc.string({ minLength: 10, maxLength: 15 }).filter(s => /^\d+$/.test(s)), { nil: null })
        }),
        async (patientData) => {
          // Create a patient
          const contactInfo = patientData.phone ? JSON.stringify({ phone: patientData.phone }) : null;
          
          const createResponse = await request(app)
            .post('/patients')
            .send({
              firstName: patientData.firstName,
              lastName: patientData.lastName,
              gender: patientData.gender,
              dateOfBirth: patientData.dateOfBirth,
              contactInfo: contactInfo
            });

          expect(createResponse.status).toBe(201);

          // Check for duplicates with exact match
          const duplicateResponse = await request(app)
            .get('/patients/check-duplicate')
            .query({
              firstName: patientData.firstName,
              lastName: patientData.lastName,
              dateOfBirth: patientData.dateOfBirth,
              ...(patientData.phone && { phone: patientData.phone })
            });

          expect(duplicateResponse.status).toBe(200);
          expect(duplicateResponse.body.hasDuplicates).toBe(true);
          expect(duplicateResponse.body.duplicateCount).toBe(1);
          expect(duplicateResponse.body.duplicates).toHaveLength(1);
          expect(duplicateResponse.body.duplicates[0].firstName).toBe(patientData.firstName);
          expect(duplicateResponse.body.duplicates[0].lastName).toBe(patientData.lastName);
          expect(duplicateResponse.body.duplicates[0].dateOfBirth).toBe(patientData.dateOfBirth);
        }
      ),
      { numRuns: 25 }
    );
  });

  test('Property 4.2: Duplicate detection is case-insensitive for names', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          firstName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          lastName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          dateOfBirth: fc.date({ min: new Date('1900-01-01'), max: new Date('2024-12-31') })
            .map(d => d.toISOString().split('T')[0]),
          gender: fc.constantFrom('male', 'female', 'other')
        }),
        async (patientData) => {
          // Create a patient with original case
          const createResponse = await request(app)
            .post('/patients')
            .send({
              firstName: patientData.firstName,
              lastName: patientData.lastName,
              gender: patientData.gender,
              dateOfBirth: patientData.dateOfBirth
            });

          expect(createResponse.status).toBe(201);

          // Check for duplicates with different case
          const duplicateResponse = await request(app)
            .get('/patients/check-duplicate')
            .query({
              firstName: patientData.firstName.toUpperCase(),
              lastName: patientData.lastName.toLowerCase(),
              dateOfBirth: patientData.dateOfBirth
            });

          expect(duplicateResponse.status).toBe(200);
          expect(duplicateResponse.body.hasDuplicates).toBe(true);
          expect(duplicateResponse.body.duplicateCount).toBe(1);
        }
      ),
      { numRuns: 25 }
    );
  });

  test('Property 4.3: No duplicates found for non-matching data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          firstName1: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          lastName1: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          firstName2: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          lastName2: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          dateOfBirth1: fc.date({ min: new Date('1900-01-01'), max: new Date('2024-12-31') })
            .map(d => d.toISOString().split('T')[0]),
          dateOfBirth2: fc.date({ min: new Date('1900-01-01'), max: new Date('2024-12-31') })
            .map(d => d.toISOString().split('T')[0]),
          gender: fc.constantFrom('male', 'female', 'other')
        }).filter(data => 
          data.firstName1.toLowerCase() !== data.firstName2.toLowerCase() ||
          data.lastName1.toLowerCase() !== data.lastName2.toLowerCase() ||
          data.dateOfBirth1 !== data.dateOfBirth2
        ),
        async (patientData) => {
          // Create first patient
          const createResponse1 = await request(app)
            .post('/patients')
            .send({
              firstName: patientData.firstName1,
              lastName: patientData.lastName1,
              gender: patientData.gender,
              dateOfBirth: patientData.dateOfBirth1
            });

          expect(createResponse1.status).toBe(201);

          // Check for duplicates with different patient data
          const duplicateResponse = await request(app)
            .get('/patients/check-duplicate')
            .query({
              firstName: patientData.firstName2,
              lastName: patientData.lastName2,
              dateOfBirth: patientData.dateOfBirth2
            });

          expect(duplicateResponse.status).toBe(200);
          expect(duplicateResponse.body.hasDuplicates).toBe(false);
          expect(duplicateResponse.body.duplicateCount).toBe(0);
          expect(duplicateResponse.body.duplicates).toHaveLength(0);
        }
      ),
      { numRuns: 25 }
    );
  });

  test('Property 4.4: Required parameters validation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          missingParam: fc.constantFrom('firstName', 'lastName', 'dateOfBirth')
        }),
        async (testData) => {
          const baseQuery = {
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: '1990-01-01'
          };

          // Remove one required parameter
          delete baseQuery[testData.missingParam];

          const response = await request(app)
            .get('/patients/check-duplicate')
            .query(baseQuery);

          expect(response.status).toBe(400);
          expect(response.body.message).toContain('required');
        }
      ),
      { numRuns: 10 }
    );
  });
});