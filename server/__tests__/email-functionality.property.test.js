const fc = require('fast-check');
const request = require('supertest');
const app = require('../app');
const { db } = require('../db');

describe('Property 6: Email Service Reliability & Property 14: Email Content Completeness', () => {
  let testPatientId;

  beforeEach(() => {
    // Clean up test data
    db.prepare('DELETE FROM registration_audit').run();
    db.prepare('DELETE FROM family_members').run();
    db.prepare('DELETE FROM next_of_kin').run();
    db.prepare('DELETE FROM patients').run();

    // Create a test patient
    const result = db.prepare(`
      INSERT INTO patients (first_name, last_name, gender, date_of_birth, account_type, record_number, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run('Test', 'Patient', 'male', '1990-01-01', 'personal', 'TH000001', 1);

    testPatientId = result.lastInsertRowid;
  });

  afterAll(() => {
    // Clean up after all tests
    db.prepare('DELETE FROM registration_audit').run();
    db.prepare('DELETE FROM family_members').run();
    db.prepare('DELETE FROM next_of_kin').run();
    db.prepare('DELETE FROM patients').run();
  });

  test('Property 6.1: Welcome email resend succeeds for valid patient', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          staffId: fc.integer({ min: 1, max: 1000 }),
          reason: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: null })
        }),
        async (emailData) => {
          const response = await request(app)
            .post(`/patients/${testPatientId}/resend-welcome-email`)
            .send({
              staffId: emailData.staffId,
              ...(emailData.reason && { reason: emailData.reason })
            });

          expect(response.status).toBe(200);
          expect(response.body.message).toBeDefined();
          expect(response.body.patientId).toBe(testPatientId);
          expect(response.body.status).toBe('pending');
        }
      ),
      { numRuns: 15 }
    );
  });

  test('Property 6.2: Email resend creates audit log entry', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          staffId: fc.integer({ min: 1, max: 1000 })
        }),
        async (emailData) => {
          const response = await request(app)
            .post(`/patients/${testPatientId}/resend-welcome-email`)
            .send({
              staffId: emailData.staffId
            });

          expect(response.status).toBe(200);

          // Verify audit log was created
          const audit = db.prepare(`
            SELECT * FROM registration_audit 
            WHERE patient_id = ? AND action = 'welcome_email_resent'
            ORDER BY created_at DESC LIMIT 1
          `).get(testPatientId);

          expect(audit).toBeDefined();
          expect(audit.staff_id).toBe(emailData.staffId);
          expect(audit.action).toBe('welcome_email_resent');
        }
      ),
      { numRuns: 10 }
    );
  });

  test('Property 6.3: Email resend fails for non-existent patient', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          staffId: fc.integer({ min: 1, max: 1000 })
        }),
        async (emailData) => {
          const response = await request(app)
            .post('/patients/99999/resend-welcome-email')
            .send({
              staffId: emailData.staffId
            });

          expect(response.status).toBe(404);
          expect(response.body.message).toContain('Patient not found');
        }
      ),
      { numRuns: 5 }
    );
  });

  test('Property 6.4: Email resend requires staffId', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null),
        async () => {
          const response = await request(app)
            .post(`/patients/${testPatientId}/resend-welcome-email`)
            .send({});

          expect(response.status).toBe(400);
          expect(response.body.message).toContain('staffId');
        }
      ),
      { numRuns: 5 }
    );
  });

  test('Property 14.1: Audit log contains complete email details', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          staffId: fc.integer({ min: 1, max: 1000 }),
          reason: fc.string({ minLength: 1, maxLength: 100 })
        }),
        async (emailData) => {
          const response = await request(app)
            .post(`/patients/${testPatientId}/resend-welcome-email`)
            .send({
              staffId: emailData.staffId,
              reason: emailData.reason
            });

          expect(response.status).toBe(200);

          // Verify audit log contains complete details
          const audit = db.prepare(`
            SELECT * FROM registration_audit 
            WHERE patient_id = ? AND action = 'welcome_email_resent'
            ORDER BY created_at DESC LIMIT 1
          `).get(testPatientId);

          expect(audit).toBeDefined();
          expect(audit.details).toBeDefined();
          
          const details = JSON.parse(audit.details);
          expect(details.reason).toBe(emailData.reason);
          expect(details.emailType).toBe('welcome_email');
        }
      ),
      { numRuns: 10 }
    );
  });

  test('Property 14.2: Email audit logs include staff identification', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          staffId: fc.integer({ min: 1, max: 1000 })
        }),
        async (emailData) => {
          const response = await request(app)
            .post(`/patients/${testPatientId}/resend-welcome-email`)
            .send({
              staffId: emailData.staffId
            });

          expect(response.status).toBe(200);

          // Verify audit log includes staff info
          const audit = db.prepare(`
            SELECT * FROM registration_audit 
            WHERE patient_id = ? AND action = 'welcome_email_resent'
            ORDER BY created_at DESC LIMIT 1
          `).get(testPatientId);

          expect(audit).toBeDefined();
          expect(audit.staff_id).toBe(emailData.staffId);
          expect(audit.staff_name).toBeDefined();
        }
      ),
      { numRuns: 10 }
    );
  });

  test('Property 15.1: Email service handles missing staffId gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null),
        async () => {
          const response = await request(app)
            .post(`/patients/${testPatientId}/resend-welcome-email`)
            .send({});

          expect(response.status).toBe(400);
          expect(response.body.message).toBeDefined();
        }
      ),
      { numRuns: 5 }
    );
  });

  test('Property 15.2: Email service handles invalid patient gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          staffId: fc.integer({ min: 1, max: 1000 })
        }),
        async (emailData) => {
          const response = await request(app)
            .post('/patients/invalid-id/resend-welcome-email')
            .send({
              staffId: emailData.staffId
            });

          expect([400, 404]).toContain(response.status);
          expect(response.body.message).toBeDefined();
        }
      ),
      { numRuns: 5 }
    );
  });
});
