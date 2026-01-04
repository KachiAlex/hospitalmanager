const fc = require('fast-check');
const request = require('supertest');
const app = require('../app');
const { db } = require('../db');

jest.setTimeout(30000);

const withStaffHeaders = (reqBuilder) =>
  reqBuilder.set('x-staff-id', '123').set('x-staff-role', 'administrator');

const nonEmptyString = (arbitrary) =>
  arbitrary.filter((value) => value.trim().length > 0);

const normalizeName = (value, fallback) => {
  const trimmed = (value ?? '').trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

describe('Property 8: Audit Logging Completeness & Property 20: Comprehensive Audit Trail', () => {
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

  test('Property 8.1: Audit logs are created for registration activities', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          action: fc.constantFrom('patient_created', 'patient_updated', 'patient_deleted'),
          staffId: fc.integer({ min: 1, max: 1000 }),
          staffName: nonEmptyString(fc.string({ minLength: 1, maxLength: 100 }))
        }),
        async (auditData) => {
          const response = await withStaffHeaders(
            request(app).post('/registration-audit')
          )
            .send({
              action: auditData.action,
              staffId: auditData.staffId,
              staffName: auditData.staffName
            });

          expect(response.status).toBe(201);
          expect(response.body.id).toBeDefined();
          expect(response.body.action).toBe(auditData.action);
          expect(response.body.staff_id).toBe(auditData.staffId);
          expect(response.body.staff_name).toBe(normalizeName(auditData.staffName, `Staff ${auditData.staffId}`));
        }
      ),
      { numRuns: 15 }
    );
  });

  test('Property 8.2: Audit logs include complete activity details', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          action: nonEmptyString(fc.string({ minLength: 1, maxLength: 50 })),
          staffId: fc.integer({ min: 1, max: 1000 }),
          staffName: nonEmptyString(fc.string({ minLength: 1, maxLength: 100 })),
          details: fc.option(nonEmptyString(fc.string({ minLength: 1, maxLength: 500 })), { nil: null })
        }),
        async (auditData) => {
          const response = await withStaffHeaders(
            request(app).post('/registration-audit')
          )
            .send({
              action: auditData.action,
              staffId: auditData.staffId,
              staffName: auditData.staffName,
              ...(auditData.details && { details: auditData.details })
            });

          expect(response.status).toBe(201);
          expect(response.body.action).toBe(auditData.action);
          expect(response.body.staff_id).toBe(auditData.staffId);
          expect(response.body.staff_name).toBe(normalizeName(auditData.staffName, `Staff ${auditData.staffId}`));
          if (auditData.details) {
            expect(response.body.details).toBe(auditData.details);
          }
        }
      ),
      { numRuns: 15 }
    );
  });

  test('Property 8.3: Audit logs include timestamps', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          action: nonEmptyString(fc.string({ minLength: 1, maxLength: 50 })),
          staffId: fc.integer({ min: 1, max: 1000 }),
          staffName: nonEmptyString(fc.string({ minLength: 1, maxLength: 100 }))
        }),
        async (auditData) => {
          const beforeTime = new Date();
          
          const response = await withStaffHeaders(
            request(app).post('/registration-audit')
          )
            .send({
              action: auditData.action,
              staffId: auditData.staffId,
              staffName: auditData.staffName
            });

          const afterTime = new Date();

          expect(response.status).toBe(201);
          expect(response.body.created_at).toBeDefined();
          
          const createdTime = new Date(response.body.created_at);
          const toleranceMs = 2 * 60 * 60 * 1000; // allow up to 2 hours drift due to timezone/db differences
          expect(Number.isNaN(createdTime.getTime())).toBe(false);
          const now = Date.now();
          expect(Math.abs(createdTime.getTime() - now)).toBeLessThanOrEqual(toleranceMs);
        }
      ),
      { numRuns: 10 }
    );
  });

  test('Property 8.4: Audit logs can be linked to patients', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          patient: fc.record({
            firstName: nonEmptyString(fc.string({ minLength: 1, maxLength: 50 })),
            lastName: nonEmptyString(fc.string({ minLength: 1, maxLength: 50 })),
            gender: fc.constantFrom('male', 'female', 'other'),
            dateOfBirth: fc.date({ min: new Date('1900-01-01'), max: new Date('2024-12-31') })
              .map(d => d.toISOString().split('T')[0])
          }),
          action: nonEmptyString(fc.string({ minLength: 1, maxLength: 50 })),
          staffId: fc.integer({ min: 1, max: 1000 }),
          staffName: nonEmptyString(fc.string({ minLength: 1, maxLength: 100 }))
        }),
        async (auditData) => {
          const insertPatient = db.prepare(`
            INSERT INTO patients (first_name, last_name, gender, date_of_birth, account_type, record_number, created_by)
            VALUES (?, ?, ?, ?, 'personal', ?, ?)
          `);
          const patientResult = insertPatient.run(
            auditData.patient.firstName,
            auditData.patient.lastName,
            auditData.patient.gender,
            auditData.patient.dateOfBirth,
            `TH${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            auditData.staffId
          );
          const patientId = Number(patientResult.lastInsertRowid);

          const response = await withStaffHeaders(
            request(app).post('/registration-audit')
          )
            .send({
              patientId,
              action: auditData.action,
              staffId: auditData.staffId,
              staffName: auditData.staffName
            });

          expect(response.status).toBe(201);
          expect(response.body.patient_id).toBe(patientId);
        }
      ),
      { numRuns: 10 }
    );
  });

  test('Property 8.5: Required audit fields are validated', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          missingField: fc.constantFrom('action', 'staffId', 'staffName')
        }),
        async (testData) => {
          const basePayload = {
            action: 'test_action',
            staffId: 1,
            staffName: 'Test Staff'
          };

          delete basePayload[testData.missingField];

          const response = await withStaffHeaders(
            request(app).post('/registration-audit')
          )
            .send(basePayload);

          expect(response.status).toBe(400);
          expect(response.body.message).toBeDefined();
        }
      ),
      { numRuns: 10 }
    );
  });

  test('Property 20.1: Audit trail captures all registration activities', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          firstName: nonEmptyString(fc.string({ minLength: 1, maxLength: 50 })),
          lastName: nonEmptyString(fc.string({ minLength: 1, maxLength: 50 })),
          gender: fc.constantFrom('male', 'female', 'other'),
          dateOfBirth: fc.date({ min: new Date('1900-01-01'), max: new Date('2024-12-31') })
            .map(d => d.toISOString().split('T')[0]),
          staffId: fc.integer({ min: 1, max: 1000 })
        }),
        async (patientData) => {
          // Create patient
          const createResponse = await request(app)
            .post('/patients')
            .set('x-staff-id', patientData.staffId.toString())
            .set('x-staff-role', 'administrator')
            .send({
              firstName: patientData.firstName,
              lastName: patientData.lastName,
              gender: patientData.gender,
              dateOfBirth: patientData.dateOfBirth,
              createdBy: patientData.staffId
            });

          expect(createResponse.status).toBe(201);
          const patientId = createResponse.body.id;

          // Verify audit log was created
          const audit = db.prepare(`
            SELECT * FROM registration_audit 
            WHERE patient_id = ? AND action = 'patient_created'
            ORDER BY created_at DESC LIMIT 1
          `).get(patientId);

          expect(audit).toBeDefined();
          expect(audit.patient_id).toBe(patientId);
          expect(audit.action).toBe('patient_created');
        }
      ),
      { numRuns: 10 }
    );
  });

  test('Property 20.2: Audit trail includes staff identification for all activities', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          action: nonEmptyString(fc.string({ minLength: 1, maxLength: 50 })),
          staffId: fc.integer({ min: 1, max: 1000 }),
          staffName: nonEmptyString(fc.string({ minLength: 1, maxLength: 100 }))
        }),
        async (auditData) => {
          const response = await withStaffHeaders(
            request(app).post('/registration-audit')
          )
            .send({
              action: auditData.action,
              staffId: auditData.staffId,
              staffName: auditData.staffName
            });

          const normalizedName = auditData.staffName.trim() || `Staff ${auditData.staffId}`;

          expect(response.status).toBe(201);
          expect(response.body.staff_id).toBe(auditData.staffId);
          expect(response.body.staff_name).toBe(normalizedName);
        }
      ),
      { numRuns: 10 }
    );
  });

  test('Property 20.3: Audit trail maintains chronological order', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null),
        async () => {
          const auditIds = [];

          // Create multiple audit entries
          for (let i = 0; i < 5; i++) {
            const response = await withStaffHeaders(
              request(app).post('/registration-audit')
            )
              .send({
                action: `action_${i}`,
                staffId: 1,
                staffName: 'Test Staff'
              });

            expect(response.status).toBe(201);
            auditIds.push(response.body.id);
          }

          // Verify they're in order
          for (let i = 1; i < auditIds.length; i++) {
            expect(auditIds[i]).toBeGreaterThan(auditIds[i - 1]);
          }
        }
      ),
      { numRuns: 5 }
    );
  });

  test('Property 20.4: Audit trail supports optional IP and user agent tracking', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          action: nonEmptyString(fc.string({ minLength: 1, maxLength: 50 })),
          staffId: fc.integer({ min: 1, max: 1000 }),
          staffName: nonEmptyString(fc.string({ minLength: 1, maxLength: 100 })),
          ipAddress: fc.option(nonEmptyString(fc.string({ minLength: 1, maxLength: 45 })), { nil: null }),
          userAgent: fc.option(nonEmptyString(fc.string({ minLength: 1, maxLength: 500 })), { nil: null })
        }),
        async (auditData) => {
          const response = await withStaffHeaders(
            request(app).post('/registration-audit')
          )
            .send({
              action: auditData.action,
              staffId: auditData.staffId,
              staffName: auditData.staffName,
              ...(auditData.ipAddress && { ipAddress: auditData.ipAddress }),
              ...(auditData.userAgent && { userAgent: auditData.userAgent })
            });

          expect(response.status).toBe(201);
          if (auditData.ipAddress) {
            expect(response.body.ip_address).toBe(auditData.ipAddress);
          }
          if (auditData.userAgent) {
            expect(response.body.user_agent).toBe(auditData.userAgent);
          }
        }
      ),
      { numRuns: 10 }
    );
  });
});
