const fc = require('fast-check');
const path = require('path');
const Database = require('better-sqlite3');
const { init } = require('../db');

describe('Discharge Schema Property Tests', () => {
  let db;
  let testDbPath;

  beforeEach(() => {
    // Create a unique test database for each test
    testDbPath = path.join(__dirname, `../../data/test-discharge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.db`);
    db = new Database(testDbPath);
    
    // Initialize database with schema
    const originalDbPath = process.env.DATABASE_PATH;
    process.env.DATABASE_PATH = testDbPath;
    init();
    process.env.DATABASE_PATH = originalDbPath;
  });

  afterEach(() => {
    try {
      db.close();
      const fs = require('fs');
      if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath);
      }
    } catch (error) {
      console.error('Cleanup error:', error.message);
    }
  });

  describe('Property 10: Discharge Record Completeness', () => {
    it('should create complete discharge records with all required fields', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000 }),
          fc.integer({ min: 1, max: 1000 }),
          fc.string({ minLength: 1, maxLength: 500 }),
          (patientId, doctorId, notes) => {
            // Insert test data
            db.prepare('INSERT INTO patients (first_name, last_name, gender, date_of_birth) VALUES (?, ?, ?, ?)').run(
              'Test', 'Patient', 'male', '1990-01-01'
            );
            const actualPatientId = db.prepare('SELECT last_insert_rowid() as id').get().id;

            db.prepare('INSERT INTO doctors (first_name, last_name, specialty) VALUES (?, ?, ?)').run(
              'Test', 'Doctor', 'General'
            );
            const actualDoctorId = db.prepare('SELECT last_insert_rowid() as id').get().id;

            // Create discharge record
            const insertStmt = db.prepare(`
              INSERT INTO discharge_records (patient_id, doctor_id, status, discharge_notes)
              VALUES (?, ?, ?, ?)
            `);
            insertStmt.run(actualPatientId, actualDoctorId, 'medical_discharge_complete', notes);

            // Verify record was created with all fields
            const record = db.prepare('SELECT * FROM discharge_records WHERE patient_id = ?').get(actualPatientId);
            
            return (
              record !== undefined &&
              record.patient_id === actualPatientId &&
              record.doctor_id === actualDoctorId &&
              record.status === 'medical_discharge_complete' &&
              record.discharge_notes === notes &&
              record.created_at !== null &&
              record.updated_at !== null
            );
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should create billing records with correct structure', () => {
      fc.assert(
        fc.property(
          fc.number({ min: 0, max: 10000 }),
          fc.number({ min: 0, max: 100 }),
          (subtotal, discountPercentage) => {
            // Setup discharge record
            db.prepare('INSERT INTO patients (first_name, last_name, gender, date_of_birth) VALUES (?, ?, ?, ?)').run(
              'Test', 'Patient', 'male', '1990-01-01'
            );
            const patientId = db.prepare('SELECT last_insert_rowid() as id').get().id;

            db.prepare('INSERT INTO doctors (first_name, last_name, specialty) VALUES (?, ?, ?)').run(
              'Test', 'Doctor', 'General'
            );
            const doctorId = db.prepare('SELECT last_insert_rowid() as id').get().id;

            db.prepare('INSERT INTO discharge_records (patient_id, doctor_id, status) VALUES (?, ?, ?)').run(
              patientId, doctorId, 'medical_discharge_complete'
            );
            const dischargeId = db.prepare('SELECT last_insert_rowid() as id').get().id;

            // Create billing record
            const discountAmount = (subtotal * discountPercentage) / 100;
            const totalAmount = subtotal - discountAmount;

            db.prepare(`
              INSERT INTO billing_records (discharge_id, patient_id, subtotal, discount_percentage, discount_amount, total_amount, status)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(dischargeId, patientId, subtotal, discountPercentage, discountAmount, totalAmount, 'billing_complete');

            // Verify billing record
            const billing = db.prepare('SELECT * FROM billing_records WHERE discharge_id = ?').get(dischargeId);
            
            return (
              billing !== undefined &&
              billing.discharge_id === dischargeId &&
              billing.patient_id === patientId &&
              billing.subtotal === subtotal &&
              billing.discount_percentage === discountPercentage &&
              Math.abs(billing.total_amount - totalAmount) < 0.01 &&
              billing.status === 'billing_complete'
            );
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should create payment records with valid amounts', () => {
      fc.assert(
        fc.property(
          fc.number({ min: 0.01, max: 10000 }),
          fc.constantFrom('cash', 'card', 'check', 'insurance'),
          (paymentAmount, paymentMethod) => {
            // Setup discharge and billing
            db.prepare('INSERT INTO patients (first_name, last_name, gender, date_of_birth) VALUES (?, ?, ?, ?)').run(
              'Test', 'Patient', 'male', '1990-01-01'
            );
            const patientId = db.prepare('SELECT last_insert_rowid() as id').get().id;

            db.prepare('INSERT INTO doctors (first_name, last_name, specialty) VALUES (?, ?, ?)').run(
              'Test', 'Doctor', 'General'
            );
            const doctorId = db.prepare('SELECT last_insert_rowid() as id').get().id;

            db.prepare('INSERT INTO discharge_records (patient_id, doctor_id, status) VALUES (?, ?, ?)').run(
              patientId, doctorId, 'medical_discharge_complete'
            );
            const dischargeId = db.prepare('SELECT last_insert_rowid() as id').get().id;

            db.prepare(`
              INSERT INTO billing_records (discharge_id, patient_id, subtotal, total_amount, status)
              VALUES (?, ?, ?, ?, ?)
            `).run(dischargeId, patientId, 1000, 1000, 'billing_complete');
            const billingId = db.prepare('SELECT last_insert_rowid() as id').get().id;

            // Create payment record
            const remainingBalance = 1000 - paymentAmount;
            db.prepare(`
              INSERT INTO payment_records (billing_id, payment_amount, payment_method, payment_status, remaining_balance, admin_id)
              VALUES (?, ?, ?, ?, ?, ?)
            `).run(billingId, paymentAmount, paymentMethod, 'complete', remainingBalance, 1);

            // Verify payment record
            const payment = db.prepare('SELECT * FROM payment_records WHERE billing_id = ?').get(billingId);
            
            return (
              payment !== undefined &&
              payment.billing_id === billingId &&
              payment.payment_amount === paymentAmount &&
              payment.payment_method === paymentMethod &&
              Math.abs(payment.remaining_balance - remainingBalance) < 0.01
            );
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should create bed release records with proper linkage', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          (bedNumber) => {
            // Setup discharge
            db.prepare('INSERT INTO patients (first_name, last_name, gender, date_of_birth) VALUES (?, ?, ?, ?)').run(
              'Test', 'Patient', 'male', '1990-01-01'
            );
            const patientId = db.prepare('SELECT last_insert_rowid() as id').get().id;

            db.prepare('INSERT INTO doctors (first_name, last_name, specialty) VALUES (?, ?, ?)').run(
              'Test', 'Doctor', 'General'
            );
            const doctorId = db.prepare('SELECT last_insert_rowid() as id').get().id;

            db.prepare('INSERT INTO discharge_records (patient_id, doctor_id, status) VALUES (?, ?, ?)').run(
              patientId, doctorId, 'medical_discharge_complete'
            );
            const dischargeId = db.prepare('SELECT last_insert_rowid() as id').get().id;

            // Get a bed
            const bed = db.prepare('SELECT id FROM beds LIMIT 1').get();
            const bedId = bed.id;

            // Create bed release
            db.prepare(`
              INSERT INTO bed_releases (discharge_id, bed_id, patient_id, status, admin_id)
              VALUES (?, ?, ?, ?, ?)
            `).run(dischargeId, bedId, patientId, 'available', 1);

            // Verify bed release
            const release = db.prepare('SELECT * FROM bed_releases WHERE discharge_id = ?').get(dischargeId);
            
            return (
              release !== undefined &&
              release.discharge_id === dischargeId &&
              release.bed_id === bedId &&
              release.patient_id === patientId &&
              release.status === 'available'
            );
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should create audit records for all discharge actions', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('discharge_initiated', 'billing_calculated', 'payment_processed', 'bed_released'),
          fc.string({ minLength: 1, maxLength: 500 }),
          (action, details) => {
            // Setup discharge
            db.prepare('INSERT INTO patients (first_name, last_name, gender, date_of_birth) VALUES (?, ?, ?, ?)').run(
              'Test', 'Patient', 'male', '1990-01-01'
            );
            const patientId = db.prepare('SELECT last_insert_rowid() as id').get().id;

            db.prepare('INSERT INTO doctors (first_name, last_name, specialty) VALUES (?, ?, ?)').run(
              'Test', 'Doctor', 'General'
            );
            const doctorId = db.prepare('SELECT last_insert_rowid() as id').get().id;

            db.prepare('INSERT INTO discharge_records (patient_id, doctor_id, status) VALUES (?, ?, ?)').run(
              patientId, doctorId, 'medical_discharge_complete'
            );
            const dischargeId = db.prepare('SELECT last_insert_rowid() as id').get().id;

            // Create audit record
            db.prepare(`
              INSERT INTO discharge_audit (discharge_id, action, staff_id, staff_name, staff_role, details)
              VALUES (?, ?, ?, ?, ?, ?)
            `).run(dischargeId, action, 1, 'Test Staff', 'doctor', details);

            // Verify audit record
            const audit = db.prepare('SELECT * FROM discharge_audit WHERE discharge_id = ?').get(dischargeId);
            
            return (
              audit !== undefined &&
              audit.discharge_id === dischargeId &&
              audit.action === action &&
              audit.staff_id === 1 &&
              audit.staff_name === 'Test Staff' &&
              audit.details === details &&
              audit.created_at !== null
            );
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});
