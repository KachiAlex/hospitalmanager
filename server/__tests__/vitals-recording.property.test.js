const fc = require('fast-check');
const request = require('supertest');
const app = require('../app');
const { db } = require('../db');

describe('Property 5: Vitals Recording Validation', () => {
  let testPatientId;

  beforeEach(() => {
    // Clean up test data
    db.prepare('DELETE FROM patient_vitals').run();
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
    db.prepare('DELETE FROM patient_vitals').run();
    db.prepare('DELETE FROM registration_audit').run();
    db.prepare('DELETE FROM family_members').run();
    db.prepare('DELETE FROM next_of_kin').run();
    db.prepare('DELETE FROM patients').run();
  });

  test('Property 5.1: Valid vitals within medical ranges are recorded successfully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          bloodPressureSystolic: fc.integer({ min: 70, max: 250 }),
          bloodPressureDiastolic: fc.integer({ min: 40, max: 150 }),
          heartRate: fc.integer({ min: 30, max: 220 }),
          temperature: fc.double({ min: 35.0, max: 42.0 }),
          height: fc.double({ min: 50, max: 250 }),
          weight: fc.double({ min: 20, max: 300 }),
          respiratoryRate: fc.integer({ min: 8, max: 50 }),
          oxygenSaturation: fc.integer({ min: 70, max: 100 }),
          recordedBy: fc.integer({ min: 1, max: 1000 })
        }),
        async (vitalsData) => {
          const response = await request(app)
            .post(`/patients/${testPatientId}/vitals`)
            .send(vitalsData);

          expect(response.status).toBe(201);
          expect(response.body).toHaveProperty('id');
          expect(response.body.patient_id).toBe(testPatientId);
          expect(response.body.blood_pressure_systolic).toBe(vitalsData.bloodPressureSystolic);
          expect(response.body.blood_pressure_diastolic).toBe(vitalsData.bloodPressureDiastolic);
          expect(response.body.heart_rate).toBe(vitalsData.heartRate);
          expect(response.body.temperature).toBe(vitalsData.temperature);
          expect(response.body.height).toBe(vitalsData.height);
          expect(response.body.weight).toBe(vitalsData.weight);
          expect(response.body.respiratory_rate).toBe(vitalsData.respiratoryRate);
          expect(response.body.oxygen_saturation).toBe(vitalsData.oxygenSaturation);
          expect(response.body.recorded_by).toBe(vitalsData.recordedBy);
          expect(response.body.recorded_at).toBeDefined();
        }
      ),
      { numRuns: 15 }
    );
  });

  test('Property 5.2: Invalid blood pressure values are rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          bloodPressureSystolic: fc.oneof(
            fc.integer({ min: -1000, max: 69 }),
            fc.integer({ min: 251, max: 10000 })
          ),
          recordedBy: fc.integer({ min: 1, max: 1000 })
        }),
        async (vitalsData) => {
          const response = await request(app)
            .post(`/patients/${testPatientId}/vitals`)
            .send(vitalsData);

          expect(response.status).toBe(400);
          expect(response.body.message).toBeDefined();
        }
      ),
      { numRuns: 10 }
    );
  });

  test('Property 5.3: Invalid temperature values are rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          temperature: fc.oneof(
            fc.double({ min: -100, max: 34.9 }),
            fc.double({ min: 42.1, max: 100 })
          ),
          recordedBy: fc.integer({ min: 1, max: 1000 })
        }),
        async (vitalsData) => {
          const response = await request(app)
            .post(`/patients/${testPatientId}/vitals`)
            .send(vitalsData);

          expect(response.status).toBe(400);
          expect(response.body.message).toBeDefined();
        }
      ),
      { numRuns: 10 }
    );
  });

  test('Property 5.4: Vitals are recorded with proper timestamps', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          heartRate: fc.integer({ min: 30, max: 220 }),
          recordedBy: fc.integer({ min: 1, max: 1000 })
        }),
        async (vitalsData) => {
          const beforeTime = new Date();
          
          const response = await request(app)
            .post(`/patients/${testPatientId}/vitals`)
            .send(vitalsData);

          const afterTime = new Date();

          expect(response.status).toBe(201);
          expect(response.body.recorded_at).toBeDefined();
          
          const recordedTime = new Date(response.body.recorded_at);
          expect(recordedTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
          expect(recordedTime.getTime()).toBeLessThanOrEqual(afterTime.getTime() + 1000);
        }
      ),
      { numRuns: 10 }
    );
  });

  test('Property 5.5: Vitals for non-existent patient returns 404', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          heartRate: fc.integer({ min: 30, max: 220 }),
          recordedBy: fc.integer({ min: 1, max: 1000 })
        }),
        async (vitalsData) => {
          const response = await request(app)
            .post('/patients/99999/vitals')
            .send(vitalsData);

          expect(response.status).toBe(404);
          expect(response.body.message).toContain('Patient not found');
        }
      ),
      { numRuns: 5 }
    );
  });

  test('Property 5.6: Missing recordedBy field is rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          heartRate: fc.integer({ min: 30, max: 220 })
        }),
        async (vitalsData) => {
          const response = await request(app)
            .post(`/patients/${testPatientId}/vitals`)
            .send(vitalsData);

          expect(response.status).toBe(400);
          expect(response.body.message).toBeDefined();
        }
      ),
      { numRuns: 5 }
    );
  });

  test('Property 5.7: Optional vitals fields can be omitted', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          recordedBy: fc.integer({ min: 1, max: 1000 })
        }),
        async (vitalsData) => {
          const response = await request(app)
            .post(`/patients/${testPatientId}/vitals`)
            .send(vitalsData);

          expect(response.status).toBe(201);
          expect(response.body.id).toBeDefined();
          expect(response.body.patient_id).toBe(testPatientId);
        }
      ),
      { numRuns: 5 }
    );
  });
});
