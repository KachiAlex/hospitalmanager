const fc = require('fast-check');
const request = require('supertest');
const app = require('../app');
const { db } = require('../db');

describe('Property 7: Unique Record Number Generation', () => {
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

  test('Property 7.1: Generated record numbers follow correct format', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null),
        async () => {
          const response = await request(app)
            .get('/patients/generate-record-number');

          expect(response.status).toBe(200);
          expect(response.body.recordNumber).toBeDefined();
          
          // Format should be TH{6 digits}{3 digits}
          const recordNumber = response.body.recordNumber;
          expect(recordNumber).toMatch(/^TH\d{9}$/);
          expect(recordNumber.startsWith('TH')).toBe(true);
          expect(recordNumber.length).toBe(11);
        }
      ),
      { numRuns: 20 }
    );
  });

  test('Property 7.2: Generated record numbers are unique across multiple requests', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null),
        async () => {
          const recordNumbers = new Set();
          const responses = [];

          // Generate multiple record numbers
          for (let i = 0; i < 10; i++) {
            const response = await request(app)
              .get('/patients/generate-record-number');

            expect(response.status).toBe(200);
            responses.push(response.body.recordNumber);
            recordNumbers.add(response.body.recordNumber);
          }

          // All should be unique
          expect(recordNumbers.size).toBe(10);
        }
      ),
      { numRuns: 5 }
    );
  });

  test('Property 7.3: Generated record numbers are not duplicated in database', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null),
        async () => {
          // Generate a record number
          const genResponse = await request(app)
            .get('/patients/generate-record-number');

          expect(genResponse.status).toBe(200);
          const recordNumber = genResponse.body.recordNumber;

          // Create a patient with this record number
          const createResponse = await request(app)
            .post('/patients')
            .send({
              firstName: 'Test',
              lastName: 'Patient',
              gender: 'male',
              dateOfBirth: '1990-01-01',
              accountType: 'personal',
              recordNumber: recordNumber,
              createdBy: 1
            });

          expect(createResponse.status).toBe(201);

          // Generate another record number - should be different
          const genResponse2 = await request(app)
            .get('/patients/generate-record-number');

          expect(genResponse2.status).toBe(200);
          expect(genResponse2.body.recordNumber).not.toBe(recordNumber);
        }
      ),
      { numRuns: 10 }
    );
  });

  test('Property 7.4: Record number generation handles concurrent requests', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null),
        async () => {
          // Simulate concurrent requests
          const promises = [];
          for (let i = 0; i < 5; i++) {
            promises.push(
              request(app).get('/patients/generate-record-number')
            );
          }

          const responses = await Promise.all(promises);
          const recordNumbers = new Set();

          responses.forEach(response => {
            expect(response.status).toBe(200);
            expect(response.body.recordNumber).toBeDefined();
            recordNumbers.add(response.body.recordNumber);
          });

          // All should be unique even with concurrent requests
          expect(recordNumbers.size).toBe(5);
        }
      ),
      { numRuns: 5 }
    );
  });

  test('Property 7.5: Record numbers start with TH prefix', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null),
        async () => {
          const response = await request(app)
            .get('/patients/generate-record-number');

          expect(response.status).toBe(200);
          expect(response.body.recordNumber.substring(0, 2)).toBe('TH');
        }
      ),
      { numRuns: 10 }
    );
  });
});
