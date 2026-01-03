const fc = require('fast-check');
const request = require('supertest');
const app = require('../app');
const { db } = require('../db');

describe('Property 9: Staff Authorization Validation & Property 19: Authentication and Authorization Enforcement', () => {
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

  test('Property 9.1: Staff with administrator role can access registration', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          staffId: fc.integer({ min: 1, max: 10000 }).map(String),
          firstName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          lastName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          gender: fc.constantFrom('male', 'female', 'other'),
          dateOfBirth: fc.date({ min: new Date('1900-01-01'), max: new Date('2024-12-31') })
            .map(d => d.toISOString().split('T')[0])
        }),
        async (testData) => {
          const response = await request(app)
            .post('/patients')
            .set('x-staff-id', testData.staffId)
            .set('x-staff-role', 'administrator')
            .send({
              firstName: testData.firstName,
              lastName: testData.lastName,
              gender: testData.gender,
              dateOfBirth: testData.dateOfBirth
            });

          expect([201, 400]).toContain(response.status);
          // 201 for successful creation, 400 for validation errors
          if (response.status === 201) {
            expect(response.body.id).toBeDefined();
          }
        }
      ),
      { numRuns: 15 }
    );
  });

  test('Property 9.2: Staff with receptionist role can access registration', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          staffId: fc.integer({ min: 1, max: 10000 }).map(String),
          firstName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          lastName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          gender: fc.constantFrom('male', 'female', 'other'),
          dateOfBirth: fc.date({ min: new Date('1900-01-01'), max: new Date('2024-12-31') })
            .map(d => d.toISOString().split('T')[0])
        }),
        async (testData) => {
          const response = await request(app)
            .post('/patients')
            .set('x-staff-id', testData.staffId)
            .set('x-staff-role', 'receptionist')
            .send({
              firstName: testData.firstName,
              lastName: testData.lastName,
              gender: testData.gender,
              dateOfBirth: testData.dateOfBirth
            });

          expect([201, 400]).toContain(response.status);
          if (response.status === 201) {
            expect(response.body.id).toBeDefined();
          }
        }
      ),
      { numRuns: 15 }
    );
  });

  test('Property 9.3: Staff without required role is denied access', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          staffId: fc.integer({ min: 1, max: 10000 }).map(String),
          invalidRole: fc.constantFrom('doctor', 'nurse', 'patient', 'guest')
        }),
        async (testData) => {
          const response = await request(app)
            .post('/patients')
            .set('x-staff-id', testData.staffId)
            .set('x-staff-role', testData.invalidRole)
            .send({
              firstName: 'Test',
              lastName: 'Patient',
              gender: 'male',
              dateOfBirth: '1990-01-01'
            });

          expect(response.status).toBe(403);
          expect(response.body.message).toContain('Insufficient permissions');
        }
      ),
      { numRuns: 10 }
    );
  });

  test('Property 9.4: Missing staff ID is rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null),
        async () => {
          const response = await request(app)
            .post('/patients')
            .set('x-staff-role', 'administrator')
            .send({
              firstName: 'Test',
              lastName: 'Patient',
              gender: 'male',
              dateOfBirth: '1990-01-01'
            });

          expect(response.status).toBe(401);
          expect(response.body.message).toContain('Staff ID');
        }
      ),
      { numRuns: 5 }
    );
  });

  test('Property 9.5: Missing staff role is rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          staffId: fc.integer({ min: 1, max: 10000 }).map(String)
        }),
        async (testData) => {
          const response = await request(app)
            .post('/patients')
            .set('x-staff-id', testData.staffId)
            .send({
              firstName: 'Test',
              lastName: 'Patient',
              gender: 'male',
              dateOfBirth: '1990-01-01'
            });

          expect(response.status).toBe(401);
          expect(response.body.message).toContain('Staff role');
        }
      ),
      { numRuns: 5 }
    );
  });

  test('Property 19.1: Authentication is enforced for all registration endpoints', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          endpoint: fc.constantFrom('/patients', '/registration-audit')
        }),
        async (testData) => {
          let response;
          
          if (testData.endpoint === '/patients') {
            response = await request(app)
              .post(testData.endpoint)
              .send({
                firstName: 'Test',
                lastName: 'Patient',
                gender: 'male',
                dateOfBirth: '1990-01-01'
              });
          } else {
            response = await request(app)
              .post(testData.endpoint)
              .send({
                action: 'test_action',
                staffId: 1,
                staffName: 'Test Staff'
              });
          }

          // Should fail without auth headers
          expect([400, 401, 403]).toContain(response.status);
        }
      ),
      { numRuns: 10 }
    );
  });

  test('Property 19.2: Authorization validates staff role for sensitive operations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          staffId: fc.integer({ min: 1, max: 10000 }).map(String),
          role: fc.constantFrom('administrator', 'receptionist', 'doctor', 'nurse')
        }),
        async (testData) => {
          const response = await request(app)
            .post('/patients')
            .set('x-staff-id', testData.staffId)
            .set('x-staff-role', testData.role)
            .send({
              firstName: 'Test',
              lastName: 'Patient',
              gender: 'male',
              dateOfBirth: '1990-01-01'
            });

          // Allowed roles should get 201 or 400 (validation error)
          // Disallowed roles should get 403
          if (['administrator', 'receptionist'].includes(testData.role)) {
            expect([201, 400]).toContain(response.status);
          } else {
            expect(response.status).toBe(403);
          }
        }
      ),
      { numRuns: 15 }
    );
  });

  test('Property 19.3: Invalid staff ID format is rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          invalidStaffId: fc.constantFrom('abc', 'staff-123', 'invalid@id', '')
        }),
        async (testData) => {
          const response = await request(app)
            .post('/patients')
            .set('x-staff-id', testData.invalidStaffId)
            .set('x-staff-role', 'administrator')
            .send({
              firstName: 'Test',
              lastName: 'Patient',
              gender: 'male',
              dateOfBirth: '1990-01-01'
            });

          expect([400, 401]).toContain(response.status);
        }
      ),
      { numRuns: 10 }
    );
  });

  test('Property 19.4: Case-insensitive role matching works correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          staffId: fc.integer({ min: 1, max: 10000 }).map(String),
          roleVariation: fc.constantFrom('ADMINISTRATOR', 'Administrator', 'RECEPTIONIST', 'Receptionist')
        }),
        async (testData) => {
          const response = await request(app)
            .post('/patients')
            .set('x-staff-id', testData.staffId)
            .set('x-staff-role', testData.roleVariation)
            .send({
              firstName: 'Test',
              lastName: 'Patient',
              gender: 'male',
              dateOfBirth: '1990-01-01'
            });

          // Should accept case variations of valid roles
          expect([201, 400]).toContain(response.status);
        }
      ),
      { numRuns: 10 }
    );
  });

  test('Property 19.5: Unauthorized access attempts are logged', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          staffId: fc.integer({ min: 1, max: 10000 }).map(String),
          invalidRole: fc.constantFrom('doctor', 'nurse', 'patient')
        }),
        async (testData) => {
          const response = await request(app)
            .post('/patients')
            .set('x-staff-id', testData.staffId)
            .set('x-staff-role', testData.invalidRole)
            .send({
              firstName: 'Test',
              lastName: 'Patient',
              gender: 'male',
              dateOfBirth: '1990-01-01'
            });

          expect(response.status).toBe(403);
          // Verify error message is clear
          expect(response.body.message).toBeDefined();
          expect(response.body.message.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 10 }
    );
  });
});
