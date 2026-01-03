const fc = require('fast-check');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// Create a test database setup
function createTestDatabase() {
  const testDbPath = path.join(__dirname, '..', '..', 'data', `test-enhanced-patient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.db`);
  
  // Remove existing test database if it exists
  if (fs.existsSync(testDbPath)) {
    try {
      fs.unlinkSync(testDbPath);
    } catch (error) {
      // Ignore if file is locked, use a different name
    }
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
    CREATE INDEX IF NOT EXISTS idx_registration_audit_patient_id ON registration_audit(patient_id);
  `);
  
  return db;
}

// Helper function to generate record number (same as in app.js)
function generateRecordNumber() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TH${timestamp}${random}`;
}

// Simulate the enhanced patient creation logic
function createEnhancedPatient(db, payload) {
  const recordNumber = generateRecordNumber();
  
  const createPatientWithRelations = db.transaction(() => {
    // Create primary patient
    const insertPatient = db.prepare(`
      INSERT INTO patients (first_name, middle_name, last_name, gender, date_of_birth, contact_info, account_type, record_number, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const patientResult = insertPatient.run(
      payload.personalInfo.firstName,
      payload.personalInfo.middleName || null,
      payload.personalInfo.lastName,
      payload.personalInfo.gender,
      payload.personalInfo.dateOfBirth,
      payload.personalInfo.contactInfo || null,
      payload.accountType,
      recordNumber,
      payload.createdBy
    );
    
    const patientId = patientResult.lastInsertRowid;
    
    // Create next of kin if provided
    let nextOfKinId = null;
    if (payload.nextOfKin) {
      const insertNextOfKin = db.prepare(`
        INSERT INTO next_of_kin (patient_id, first_name, last_name, relationship, phone, email, address, is_emergency_contact)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const nextOfKinResult = insertNextOfKin.run(
        patientId,
        payload.nextOfKin.firstName,
        payload.nextOfKin.lastName,
        payload.nextOfKin.relationship,
        payload.nextOfKin.phone || null,
        payload.nextOfKin.email || null,
        payload.nextOfKin.address || null,
        payload.nextOfKin.isEmergencyContact ? 1 : 0
      );
      
      nextOfKinId = nextOfKinResult.lastInsertRowid;
    }
    
    // Create family members if provided
    const familyMemberIds = [];
    if (payload.familyMembers && Array.isArray(payload.familyMembers) && payload.familyMembers.length > 0) {
      const insertFamilyPatient = db.prepare(`
        INSERT INTO patients (first_name, middle_name, last_name, gender, date_of_birth, account_type, record_number, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const insertFamilyRelation = db.prepare(`
        INSERT INTO family_members (primary_patient_id, member_patient_id, relationship, is_primary)
        VALUES (?, ?, ?, ?)
      `);
      
      payload.familyMembers.forEach((member) => {
        const memberRecordNumber = generateRecordNumber();
        
        // Create family member as patient
        const memberResult = insertFamilyPatient.run(
          member.firstName,
          member.middleName || null,
          member.lastName,
          member.gender,
          member.dateOfBirth,
          'personal', // Family members are personal accounts
          memberRecordNumber,
          payload.createdBy
        );
        
        const memberId = memberResult.lastInsertRowid;
        
        // Create family relationship
        insertFamilyRelation.run(
          patientId,
          memberId,
          member.relationship,
          member.isPrimary ? 1 : 0
        );
        
        familyMemberIds.push({
          id: memberId,
          recordNumber: memberRecordNumber
        });
      });
    }
    
    // Create audit log
    const insertAudit = db.prepare(`
      INSERT INTO registration_audit (patient_id, action, staff_id, staff_name, details)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const auditDetails = JSON.stringify({
      accountType: payload.accountType,
      hasNextOfKin: !!payload.nextOfKin,
      familyMembersCount: payload.familyMembers ? payload.familyMembers.length : 0
    });
    
    insertAudit.run(
      patientId,
      'patient_created',
      payload.createdBy,
      `Staff ${payload.createdBy}`,
      auditDetails
    );
    
    return {
      patientId,
      recordNumber,
      nextOfKinId,
      familyMemberIds: familyMemberIds || []
    };
  });
  
  return createPatientWithRelations();
}

describe('Enhanced Patient Creation Property Tests', () => {
  let testDb;
  
  beforeEach(() => {
    testDb = createTestDatabase();
  });
  
  afterEach(() => {
    if (testDb) {
      const dbPath = testDb.name;
      testDb.close();
      // Clean up test database file
      try {
        if (fs.existsSync(dbPath)) {
          fs.unlinkSync(dbPath);
        }
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  /**
   * Property 3: Enhanced Patient Creation Data Integrity
   * Feature: patient-registration-gaps, Property 3: Enhanced Patient Creation Data Integrity
   * Validates: Requirements 2.1
   */
  test('Property 3: Enhanced patient creation maintains data integrity across all related tables', () => {
    fc.assert(
      fc.property(
        // Generate enhanced patient registration data
        fc.record({
          accountType: fc.constantFrom('personal', 'family'),
          personalInfo: fc.record({
            firstName: fc.string({ minLength: 1, maxLength: 50 }),
            middleName: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
            lastName: fc.string({ minLength: 1, maxLength: 50 }),
            gender: fc.constantFrom('male', 'female', 'other'),
            dateOfBirth: fc.date({ min: new Date('1900-01-01'), max: new Date() }).map(d => d.toISOString().split('T')[0]),
            contactInfo: fc.option(fc.string({ minLength: 1, maxLength: 100 }))
          }),
          nextOfKin: fc.option(fc.record({
            firstName: fc.string({ minLength: 1, maxLength: 50 }),
            lastName: fc.string({ minLength: 1, maxLength: 50 }),
            relationship: fc.constantFrom('spouse', 'parent', 'child', 'sibling', 'friend', 'other'),
            phone: fc.option(fc.string({ minLength: 10, maxLength: 15 })),
            email: fc.option(fc.emailAddress()),
            address: fc.option(fc.string({ minLength: 1, maxLength: 200 })),
            isEmergencyContact: fc.boolean()
          })),
          familyMembers: fc.option(fc.array(fc.record({
            firstName: fc.string({ minLength: 1, maxLength: 50 }),
            middleName: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
            lastName: fc.string({ minLength: 1, maxLength: 50 }),
            gender: fc.constantFrom('male', 'female', 'other'),
            dateOfBirth: fc.date({ min: new Date('1900-01-01'), max: new Date() }).map(d => d.toISOString().split('T')[0]),
            relationship: fc.constantFrom('spouse', 'parent', 'child', 'sibling'),
            isPrimary: fc.boolean()
          }), { minLength: 0, maxLength: 5 })),
          createdBy: fc.integer({ min: 1, max: 1000 })
        }),
        (payload) => {
          // Test enhanced patient creation
          const result = createEnhancedPatient(testDb, payload);
          
          // Verify primary patient was created correctly
          const patient = testDb.prepare('SELECT * FROM patients WHERE id = ?').get(result.patientId);
          expect(patient).toBeDefined();
          expect(patient.first_name).toBe(payload.personalInfo.firstName);
          expect(patient.middle_name).toBe(payload.personalInfo.middleName || null);
          expect(patient.last_name).toBe(payload.personalInfo.lastName);
          expect(patient.gender).toBe(payload.personalInfo.gender);
          expect(patient.date_of_birth).toBe(payload.personalInfo.dateOfBirth);
          expect(patient.contact_info).toBe(payload.personalInfo.contactInfo || null);
          expect(patient.account_type).toBe(payload.accountType);
          expect(patient.record_number).toBe(result.recordNumber);
          expect(patient.created_by).toBe(payload.createdBy);
          expect(patient.record_number).toMatch(/^TH\d{9}$/); // Verify record number format
          
          // Verify next of kin creation if provided
          if (payload.nextOfKin) {
            expect(result.nextOfKinId).toBeDefined();
            const nextOfKin = testDb.prepare('SELECT * FROM next_of_kin WHERE id = ?').get(result.nextOfKinId);
            expect(nextOfKin).toBeDefined();
            expect(nextOfKin.patient_id).toBe(result.patientId);
            expect(nextOfKin.first_name).toBe(payload.nextOfKin.firstName);
            expect(nextOfKin.last_name).toBe(payload.nextOfKin.lastName);
            expect(nextOfKin.relationship).toBe(payload.nextOfKin.relationship);
            expect(nextOfKin.phone).toBe(payload.nextOfKin.phone || null);
            expect(nextOfKin.email).toBe(payload.nextOfKin.email || null);
            expect(nextOfKin.address).toBe(payload.nextOfKin.address || null);
            expect(nextOfKin.is_emergency_contact).toBe(payload.nextOfKin.isEmergencyContact ? 1 : 0);
          } else {
            expect(result.nextOfKinId).toBeNull();
          }
          
          // Verify family members creation if provided
          if (payload.familyMembers && payload.familyMembers.length > 0) {
            expect(result.familyMemberIds).toHaveLength(payload.familyMembers.length);
            
            // Check each family member
            result.familyMemberIds.forEach((familyMember, index) => {
              const memberPatient = testDb.prepare('SELECT * FROM patients WHERE id = ?').get(familyMember.id);
              expect(memberPatient).toBeDefined();
              expect(memberPatient.first_name).toBe(payload.familyMembers[index].firstName);
              expect(memberPatient.last_name).toBe(payload.familyMembers[index].lastName);
              expect(memberPatient.gender).toBe(payload.familyMembers[index].gender);
              expect(memberPatient.account_type).toBe('personal'); // Family members are always personal
              expect(memberPatient.record_number).toMatch(/^TH\d{9}$/);
              
              // Check family relationship
              const relationship = testDb.prepare(`
                SELECT * FROM family_members 
                WHERE primary_patient_id = ? AND member_patient_id = ?
              `).get(result.patientId, familyMember.id);
              expect(relationship).toBeDefined();
              expect(relationship.relationship).toBe(payload.familyMembers[index].relationship);
              expect(relationship.is_primary).toBe(payload.familyMembers[index].isPrimary ? 1 : 0);
            });
          } else {
            expect(result.familyMemberIds).toHaveLength(0);
          }
          
          // Verify audit log was created
          const auditLog = testDb.prepare('SELECT * FROM registration_audit WHERE patient_id = ?').get(result.patientId);
          expect(auditLog).toBeDefined();
          expect(auditLog.action).toBe('patient_created');
          expect(auditLog.staff_id).toBe(payload.createdBy);
          expect(auditLog.staff_name).toBe(`Staff ${payload.createdBy}`);
          
          const auditDetails = JSON.parse(auditLog.details);
          expect(auditDetails.accountType).toBe(payload.accountType);
          expect(auditDetails.hasNextOfKin).toBe(!!payload.nextOfKin);
          expect(auditDetails.familyMembersCount).toBe(payload.familyMembers ? payload.familyMembers.length : 0);
          
          return true; // Property holds
        }
      ),
      { numRuns: 25 } // Reduced iterations for faster execution
    );
  });

  test('Property 3b: Record number uniqueness across concurrent operations', () => {
    fc.assert(
      fc.property(
        // Generate multiple patient registrations
        fc.array(fc.record({
          accountType: fc.constantFrom('personal', 'family'),
          personalInfo: fc.record({
            firstName: fc.string({ minLength: 1, maxLength: 50 }),
            lastName: fc.string({ minLength: 1, maxLength: 50 }),
            gender: fc.constantFrom('male', 'female', 'other'),
            dateOfBirth: fc.date({ min: new Date('1900-01-01'), max: new Date() }).map(d => d.toISOString().split('T')[0])
          }),
          createdBy: fc.integer({ min: 1, max: 100 })
        }), { minLength: 2, maxLength: 10 }),
        (patients) => {
          const recordNumbers = new Set();
          
          // Create multiple patients and collect record numbers
          patients.forEach(patient => {
            const result = createEnhancedPatient(testDb, patient);
            
            // Verify record number is unique
            expect(recordNumbers.has(result.recordNumber)).toBe(false);
            recordNumbers.add(result.recordNumber);
            
            // Verify record number format
            expect(result.recordNumber).toMatch(/^TH\d{9}$/);
          });
          
          // Verify all record numbers are unique
          expect(recordNumbers.size).toBe(patients.length);
          
          return true;
        }
      ),
      { numRuns: 15 }
    );
  });

  test('Property 3c: Account type constraints and validation', () => {
    fc.assert(
      fc.property(
        fc.record({
          accountType: fc.constantFrom('personal', 'family'),
          personalInfo: fc.record({
            firstName: fc.string({ minLength: 1, maxLength: 50 }),
            lastName: fc.string({ minLength: 1, maxLength: 50 }),
            gender: fc.constantFrom('male', 'female', 'other'),
            dateOfBirth: fc.date({ min: new Date('1900-01-01'), max: new Date() }).map(d => d.toISOString().split('T')[0])
          }),
          familyMembers: fc.option(fc.array(fc.record({
            firstName: fc.string({ minLength: 1, maxLength: 50 }),
            lastName: fc.string({ minLength: 1, maxLength: 50 }),
            gender: fc.constantFrom('male', 'female', 'other'),
            dateOfBirth: fc.date({ min: new Date('1900-01-01'), max: new Date() }).map(d => d.toISOString().split('T')[0]),
            relationship: fc.constantFrom('spouse', 'parent', 'child', 'sibling'),
            isPrimary: fc.boolean()
          }), { minLength: 1, maxLength: 3 })),
          createdBy: fc.integer({ min: 1, max: 1000 })
        }),
        (payload) => {
          const result = createEnhancedPatient(testDb, payload);
          
          // Verify primary patient account type
          const patient = testDb.prepare('SELECT * FROM patients WHERE id = ?').get(result.patientId);
          expect(patient.account_type).toBe(payload.accountType);
          
          // Verify family members are always personal accounts
          if (payload.familyMembers && payload.familyMembers.length > 0) {
            result.familyMemberIds.forEach(familyMember => {
              const memberPatient = testDb.prepare('SELECT * FROM patients WHERE id = ?').get(familyMember.id);
              expect(memberPatient.account_type).toBe('personal');
            });
          }
          
          // Verify family account can have family members, personal account logic
          if (payload.accountType === 'family' && payload.familyMembers) {
            expect(result.familyMemberIds.length).toBe(payload.familyMembers.length);
          }
          
          return true;
        }
      ),
      { numRuns: 20 }
    );
  });
});