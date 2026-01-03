const fc = require('fast-check');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// Create a test database setup
function createTestDatabase() {
  const testDbPath = path.join(__dirname, '..', '..', 'data', 'test-hospital.db');
  
  // Remove existing test database
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
  
  const db = new Database(testDbPath);
  
  // Initialize the test database with our schema directly
  db.pragma('foreign_keys = ON');
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      middle_name TEXT,
      last_name TEXT NOT NULL,
      gender TEXT CHECK(gender IN ('male','female','other')) NOT NULL,
      date_of_birth TEXT NOT NULL,
      contact_info TEXT,
      account_type TEXT CHECK(account_type IN ('personal','family')) NOT NULL DEFAULT 'personal',
      record_number TEXT UNIQUE,
      created_by INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS next_of_kin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      relationship TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      is_emergency_contact BOOLEAN DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS family_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      primary_patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      member_patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      relationship TEXT NOT NULL,
      is_primary BOOLEAN DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(primary_patient_id, member_patient_id)
    );

    CREATE TABLE IF NOT EXISTS patient_vitals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      height REAL,
      weight REAL,
      blood_pressure_systolic INTEGER,
      blood_pressure_diastolic INTEGER,
      heart_rate INTEGER,
      temperature REAL,
      respiratory_rate INTEGER,
      oxygen_saturation INTEGER,
      recorded_by INTEGER,
      recorded_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS registration_audit (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER REFERENCES patients(id),
      action TEXT NOT NULL,
      staff_id INTEGER NOT NULL,
      staff_name TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for better query performance
    CREATE INDEX IF NOT EXISTS idx_patients_record_number ON patients(record_number);
    CREATE INDEX IF NOT EXISTS idx_patients_created_by ON patients(created_by);
    CREATE INDEX IF NOT EXISTS idx_patients_account_type ON patients(account_type);
    CREATE INDEX IF NOT EXISTS idx_next_of_kin_patient_id ON next_of_kin(patient_id);
    CREATE INDEX IF NOT EXISTS idx_family_members_primary ON family_members(primary_patient_id);
    CREATE INDEX IF NOT EXISTS idx_family_members_member ON family_members(member_patient_id);
    CREATE INDEX IF NOT EXISTS idx_patient_vitals_patient_id ON patient_vitals(patient_id);
    CREATE INDEX IF NOT EXISTS idx_patient_vitals_recorded_at ON patient_vitals(recorded_at);
    CREATE INDEX IF NOT EXISTS idx_registration_audit_patient_id ON registration_audit(patient_id);
    CREATE INDEX IF NOT EXISTS idx_registration_audit_staff_id ON registration_audit(staff_id);
    CREATE INDEX IF NOT EXISTS idx_registration_audit_created_at ON registration_audit(created_at);
  `);
  
  return db;
}

describe('Database Schema Property Tests', () => {
  let testDb;
  
  beforeEach(() => {
    testDb = createTestDatabase();
  });
  
  afterEach(() => {
    if (testDb) {
      testDb.close();
    }
  });

  /**
   * Property 10: Database Schema Integrity
   * Feature: patient-registration-gaps, Property 10: Database Schema Integrity
   * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
   */
  test('Property 10: Database schema maintains referential integrity for all extended tables', () => {
    fc.assert(
      fc.property(
        // Generate test data for patients
        fc.record({
          firstName: fc.string({ minLength: 1, maxLength: 50 }),
          lastName: fc.string({ minLength: 1, maxLength: 50 }),
          middleName: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
          gender: fc.constantFrom('male', 'female', 'other'),
          dateOfBirth: fc.date({ min: new Date('1900-01-01'), max: new Date() }).map(d => d.toISOString().split('T')[0]),
          contactInfo: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
          accountType: fc.constantFrom('personal', 'family'),
          recordNumber: fc.option(fc.string({ minLength: 5, maxLength: 20 })),
          createdBy: fc.option(fc.integer({ min: 1, max: 1000 }))
        }),
        // Generate test data for next of kin
        fc.record({
          firstName: fc.string({ minLength: 1, maxLength: 50 }),
          lastName: fc.string({ minLength: 1, maxLength: 50 }),
          relationship: fc.constantFrom('spouse', 'parent', 'child', 'sibling', 'friend', 'other'),
          phone: fc.option(fc.string({ minLength: 10, maxLength: 15 })),
          email: fc.option(fc.emailAddress()),
          address: fc.option(fc.string({ minLength: 1, maxLength: 200 })),
          isEmergencyContact: fc.boolean()
        }),
        // Generate test data for vitals
        fc.record({
          height: fc.option(fc.float({ min: 50, max: 250 })), // cm
          weight: fc.option(fc.float({ min: 20, max: 300 })), // kg
          bloodPressureSystolic: fc.option(fc.integer({ min: 80, max: 200 })),
          bloodPressureDiastolic: fc.option(fc.integer({ min: 40, max: 120 })),
          heartRate: fc.option(fc.integer({ min: 40, max: 200 })),
          temperature: fc.option(fc.float({ min: 35.0, max: 42.0 })), // Celsius
          respiratoryRate: fc.option(fc.integer({ min: 8, max: 40 })),
          oxygenSaturation: fc.option(fc.integer({ min: 70, max: 100 })),
          recordedBy: fc.option(fc.integer({ min: 1, max: 1000 }))
        }),
        (patientData, nextOfKinData, vitalsData) => {
          // Test 1: Patient creation with extended schema
          const insertPatient = testDb.prepare(`
            INSERT INTO patients (first_name, middle_name, last_name, gender, date_of_birth, contact_info, account_type, record_number, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          
          const patientResult = insertPatient.run(
            patientData.firstName,
            patientData.middleName || null,
            patientData.lastName,
            patientData.gender,
            patientData.dateOfBirth,
            patientData.contactInfo || null,
            patientData.accountType,
            patientData.recordNumber || null,
            patientData.createdBy || null
          );
          
          const patientId = patientResult.lastInsertRowid;
          
          // Verify patient was created with all columns
          const patient = testDb.prepare('SELECT * FROM patients WHERE id = ?').get(patientId);
          expect(patient).toBeDefined();
          expect(patient.first_name).toBe(patientData.firstName);
          expect(patient.last_name).toBe(patientData.lastName);
          expect(patient.middle_name).toBe(patientData.middleName || null);
          expect(patient.account_type).toBe(patientData.accountType);
          expect(patient.record_number).toBe(patientData.recordNumber || null);
          expect(patient.created_by).toBe(patientData.createdBy || null);
          
          // Test 2: Next of kin referential integrity
          const insertNextOfKin = testDb.prepare(`
            INSERT INTO next_of_kin (patient_id, first_name, last_name, relationship, phone, email, address, is_emergency_contact)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);
          
          const nextOfKinResult = insertNextOfKin.run(
            patientId,
            nextOfKinData.firstName,
            nextOfKinData.lastName,
            nextOfKinData.relationship,
            nextOfKinData.phone || null,
            nextOfKinData.email || null,
            nextOfKinData.address || null,
            nextOfKinData.isEmergencyContact ? 1 : 0
          );
          
          // Verify next of kin was created and linked properly
          const nextOfKin = testDb.prepare('SELECT * FROM next_of_kin WHERE id = ?').get(nextOfKinResult.lastInsertRowid);
          expect(nextOfKin).toBeDefined();
          expect(nextOfKin.patient_id).toBe(patientId);
          expect(nextOfKin.first_name).toBe(nextOfKinData.firstName);
          expect(nextOfKin.relationship).toBe(nextOfKinData.relationship);
          
          // Test 3: Patient vitals referential integrity
          const insertVitals = testDb.prepare(`
            INSERT INTO patient_vitals (patient_id, height, weight, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, temperature, respiratory_rate, oxygen_saturation, recorded_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          
          const vitalsResult = insertVitals.run(
            patientId,
            vitalsData.height || null,
            vitalsData.weight || null,
            vitalsData.bloodPressureSystolic || null,
            vitalsData.bloodPressureDiastolic || null,
            vitalsData.heartRate || null,
            vitalsData.temperature || null,
            vitalsData.respiratoryRate || null,
            vitalsData.oxygenSaturation || null,
            vitalsData.recordedBy || null
          );
          
          // Verify vitals were created and linked properly
          const vitals = testDb.prepare('SELECT * FROM patient_vitals WHERE id = ?').get(vitalsResult.lastInsertRowid);
          expect(vitals).toBeDefined();
          expect(vitals.patient_id).toBe(patientId);
          
          // Test 4: Cascade deletion integrity
          // When patient is deleted, related records should be deleted
          const nextOfKinCountBefore = testDb.prepare('SELECT COUNT(*) as count FROM next_of_kin WHERE patient_id = ?').get(patientId).count;
          const vitalsCountBefore = testDb.prepare('SELECT COUNT(*) as count FROM patient_vitals WHERE patient_id = ?').get(patientId).count;
          
          expect(nextOfKinCountBefore).toBe(1);
          expect(vitalsCountBefore).toBe(1);
          
          // Delete patient
          testDb.prepare('DELETE FROM patients WHERE id = ?').run(patientId);
          
          // Verify cascade deletion worked
          const nextOfKinCountAfter = testDb.prepare('SELECT COUNT(*) as count FROM next_of_kin WHERE patient_id = ?').get(patientId).count;
          const vitalsCountAfter = testDb.prepare('SELECT COUNT(*) as count FROM patient_vitals WHERE patient_id = ?').get(patientId).count;
          
          expect(nextOfKinCountAfter).toBe(0);
          expect(vitalsCountAfter).toBe(0);
          
          // Test 5: Registration audit table integrity
          const insertAudit = testDb.prepare(`
            INSERT INTO registration_audit (patient_id, action, staff_id, staff_name, details)
            VALUES (?, ?, ?, ?, ?)
          `);
          
          // Create a new patient for audit testing
          const auditPatientResult = insertPatient.run(
            'Test', null, 'Patient', 'male', '1990-01-01', null, 'personal', null, 1
          );
          const auditPatientId = auditPatientResult.lastInsertRowid;
          
          const auditResult = insertAudit.run(
            auditPatientId,
            'patient_created',
            1,
            'Test Staff',
            'Test registration'
          );
          
          // Verify audit record was created
          const audit = testDb.prepare('SELECT * FROM registration_audit WHERE id = ?').get(auditResult.lastInsertRowid);
          expect(audit).toBeDefined();
          expect(audit.patient_id).toBe(auditPatientId);
          expect(audit.action).toBe('patient_created');
          expect(audit.staff_id).toBe(1);
          expect(audit.staff_name).toBe('Test Staff');
          
          return true; // Property holds
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in requirements
    );
  });

  test('Property 10b: Family members table maintains unique relationships and proper constraints', () => {
    fc.assert(
      fc.property(
        // Generate two patients for family relationship testing
        fc.tuple(
          fc.record({
            firstName: fc.string({ minLength: 1, maxLength: 50 }),
            lastName: fc.string({ minLength: 1, maxLength: 50 }),
            gender: fc.constantFrom('male', 'female', 'other'),
            dateOfBirth: fc.date({ min: new Date('1900-01-01'), max: new Date() }).map(d => d.toISOString().split('T')[0]),
            accountType: fc.constant('family')
          }),
          fc.record({
            firstName: fc.string({ minLength: 1, maxLength: 50 }),
            lastName: fc.string({ minLength: 1, maxLength: 50 }),
            gender: fc.constantFrom('male', 'female', 'other'),
            dateOfBirth: fc.date({ min: new Date('1900-01-01'), max: new Date() }).map(d => d.toISOString().split('T')[0]),
            accountType: fc.constant('personal')
          }),
          fc.constantFrom('spouse', 'parent', 'child', 'sibling')
        ),
        ([primaryPatient, memberPatient, relationship]) => {
          // Create primary patient
          const insertPatient = testDb.prepare(`
            INSERT INTO patients (first_name, last_name, gender, date_of_birth, account_type)
            VALUES (?, ?, ?, ?, ?)
          `);
          
          const primaryResult = insertPatient.run(
            primaryPatient.firstName,
            primaryPatient.lastName,
            primaryPatient.gender,
            primaryPatient.dateOfBirth,
            primaryPatient.accountType
          );
          const primaryPatientId = primaryResult.lastInsertRowid;
          
          // Create member patient
          const memberResult = insertPatient.run(
            memberPatient.firstName,
            memberPatient.lastName,
            memberPatient.gender,
            memberPatient.dateOfBirth,
            memberPatient.accountType
          );
          const memberPatientId = memberResult.lastInsertRowid;
          
          // Create family relationship
          const insertFamilyMember = testDb.prepare(`
            INSERT INTO family_members (primary_patient_id, member_patient_id, relationship, is_primary)
            VALUES (?, ?, ?, ?)
          `);
          
          const familyResult = insertFamilyMember.run(
            primaryPatientId,
            memberPatientId,
            relationship,
            1 // is_primary
          );
          
          // Verify family relationship was created
          const familyMember = testDb.prepare('SELECT * FROM family_members WHERE id = ?').get(familyResult.lastInsertRowid);
          expect(familyMember).toBeDefined();
          expect(familyMember.primary_patient_id).toBe(primaryPatientId);
          expect(familyMember.member_patient_id).toBe(memberPatientId);
          expect(familyMember.relationship).toBe(relationship);
          
          // Test unique constraint - attempting to insert duplicate should fail
          expect(() => {
            insertFamilyMember.run(primaryPatientId, memberPatientId, relationship, 0);
          }).toThrow();
          
          // Test cascade deletion - deleting primary patient should remove family relationships
          testDb.prepare('DELETE FROM patients WHERE id = ?').run(primaryPatientId);
          
          const familyCountAfter = testDb.prepare('SELECT COUNT(*) as count FROM family_members WHERE primary_patient_id = ?').get(primaryPatientId).count;
          expect(familyCountAfter).toBe(0);
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
});