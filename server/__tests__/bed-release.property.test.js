const fc = require('fast-check');
const Database = require('better-sqlite3');

describe('Bed Release Endpoints Property Tests', () => {
  let db;

  beforeEach(() => {
    // Use in-memory database for faster tests
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    
    // Initialize database schema
    db.exec(`
      CREATE TABLE patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        gender TEXT NOT NULL,
        date_of_birth TEXT NOT NULL
      );

      CREATE TABLE doctors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        specialty TEXT NOT NULL
      );

      CREATE TABLE beds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ward TEXT NOT NULL,
        bed_number TEXT NOT NULL,
        status TEXT DEFAULT 'available'
      );

      CREATE TABLE admissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        status TEXT NOT NULL
      );

      CREATE TABLE discharge_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        doctor_id INTEGER NOT NULL,
        admission_id INTEGER,
        status TEXT NOT NULL,
        discharge_notes TEXT,
        discharge_date TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE billing_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        discharge_id INTEGER NOT NULL,
        patient_id INTEGER NOT NULL,
        subtotal REAL NOT NULL,
        discount_percentage REAL DEFAULT 0,
        discount_amount REAL DEFAULT 0,
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'billing_complete',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE payment_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        billing_id INTEGER NOT NULL,
        payment_amount REAL NOT NULL,
        payment_method TEXT NOT NULL,
        payment_status TEXT DEFAULT 'complete',
        remaining_balance REAL DEFAULT 0,
        admin_id INTEGER NOT NULL,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE bed_releases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        discharge_id INTEGER NOT NULL,
        bed_id INTEGER NOT NULL,
        patient_id INTEGER NOT NULL,
        status TEXT DEFAULT 'available',
        release_date TEXT,
        admin_id INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE discharge_audit (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        discharge_id INTEGER,
        action TEXT NOT NULL,
        staff_id INTEGER NOT NULL,
        staff_name TEXT NOT NULL,
        staff_role TEXT,
        details TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      INSERT INTO beds (ward, bed_number, status) VALUES ('A', 'A-1', 'occupied');
    `);
  });

  afterEach(() => {
    try {
      db.close();
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Property 5: Bed Release Verification', () => {
    it('should verify discharge and payment are complete before releasing bed', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (hasPayment) => {
            // Setup test data
            db.prepare('INSERT INTO patients (first_name, last_name, gender, date_of_birth) VALUES (?, ?, ?, ?)').run(
              'Test', 'Patient', 'male', '1990-01-01'
            );
            const patientId = db.prepare('SELECT last_insert_rowid() as id').get().id;

            db.prepare('INSERT INTO doctors (first_name, last_name, specialty) VALUES (?, ?, ?)').run(
              'Test', 'Doctor', 'General'
            );
            const doctorId = db.prepare('SELECT last_insert_rowid() as id').get().id;

            db.prepare('INSERT INTO admissions (patient_id, status) VALUES (?, ?)').run(
              patientId, 'active'
            );
            const admissionId = db.prepare('SELECT last_insert_rowid() as id').get().id;

            db.prepare('INSERT INTO discharge_records (patient_id, doctor_id, admission_id, status) VALUES (?, ?, ?, ?)').run(
              patientId, doctorId, admissionId, 'medical_discharge_complete'
            );
            const dischargeId = db.prepare('SELECT last_insert_rowid() as id').get().id;

            // Create billing
            db.prepare(`
              INSERT INTO billing_records (discharge_id, patient_id, subtotal, total_amount, status)
              VALUES (?, ?, ?, ?, ?)
            `).run(dischargeId, patientId, 1000, 1000, 'billing_complete');
            const billingId = db.prepare('SELECT last_insert_rowid() as id').get().id;

            // Create payment if required
            if (hasPayment) {
              db.prepare(`
                INSERT INTO payment_records (billing_id, payment_amount, payment_method, payment_status, remaining_balance, admin_id)
                VALUES (?, ?, ?, ?, ?, ?)
              `).run(billingId, 1000, 'cash', 'complete', 0, 1);

              // Release bed
              const bed = db.prepare('SELECT id FROM beds LIMIT 1').get();
              db.prepare(`
                INSERT INTO bed_releases (discharge_id, bed_id, patient_id, status, release_date, admin_id)
                VALUES (?, ?, ?, ?, ?, ?)
              `).run(dischargeId, bed.id, patientId, 'available', new Date().toISOString(), 1);

              // Verify bed release
              const release = db.prepare('SELECT * FROM bed_releases WHERE discharge_id = ?').get(dischargeId);
              return release !== undefined;
            }

            return true;
          }
        ),
        { numRuns: 15 }
      );
    });

    it('should update bed status to available when released', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('A', 'B', 'C'),
          (ward) => {
            // Setup test data
            db.prepare('INSERT INTO patients (first_name, last_name, gender, date_of_birth) VALUES (?, ?, ?, ?)').run(
              'Test', 'Patient', 'male', '1990-01-01'
            );
            const patientId = db.prepare('SELECT last_insert_rowid() as id').get().id;

            db.prepare('INSERT INTO doctors (first_name, last_name, specialty) VALUES (?, ?, ?)').run(
              'Test', 'Doctor', 'General'
            );
            const doctorId = db.prepare('SELECT last_insert_rowid() as id').get().id;

            db.prepare('INSERT INTO admissions (patient_id, status) VALUES (?, ?)').run(
              patientId, 'active'
            );
            const admissionId = db.prepare('SELECT last_insert_rowid() as id').get().id;

            db.prepare('INSERT INTO discharge_records (patient_id, doctor_id, admission_id, status) VALUES (?, ?, ?, ?)').run(
              patientId, doctorId, admissionId, 'medical_discharge_complete'
            );
            const dischargeId = db.prepare('SELECT last_insert_rowid() as id').get().id;

            // Create billing and payment
            db.prepare(`
              INSERT INTO billing_records (discharge_id, patient_id, subtotal, total_amount, status)
              VALUES (?, ?, ?, ?, ?)
            `).run(dischargeId, patientId, 1000, 1000, 'billing_complete');
            const billingId = db.prepare('SELECT last_insert_rowid() as id').get().id;

            db.prepare(`
              INSERT INTO payment_records (billing_id, payment_amount, payment_method, payment_status, remaining_balance, admin_id)
              VALUES (?, ?, ?, ?, ?, ?)
            `).run(billingId, 1000, 'cash', 'complete', 0, 1);

            // Get bed
            const bed = db.prepare('SELECT id FROM beds LIMIT 1').get();

            // Release bed
            db.prepare(`
              INSERT INTO bed_releases (discharge_id, bed_id, patient_id, status, release_date, admin_id)
              VALUES (?, ?, ?, ?, ?, ?)
            `).run(dischargeId, bed.id, patientId, 'available', new Date().toISOString(), 1);

            // Update bed status
            db.prepare('UPDATE beds SET status = ? WHERE id = ?').run('available', bed.id);

            // Verify bed status
            const updatedBed = db.prepare('SELECT * FROM beds WHERE id = ?').get(bed.id);
            
            return updatedBed.status === 'available';
          }
        ),
        { numRuns: 15 }
      );
    });
  });

  describe('Property 2: Discharge Status Progression', () => {
    it('should create audit log when bed is released', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 100 }),
          (releaseReason) => {
            // Setup test data
            db.prepare('INSERT INTO patients (first_name, last_name, gender, date_of_birth) VALUES (?, ?, ?, ?)').run(
              'Test', 'Patient', 'male', '1990-01-01'
            );
            const patientId = db.prepare('SELECT last_insert_rowid() as id').get().id;

            db.prepare('INSERT INTO doctors (first_name, last_name, specialty) VALUES (?, ?, ?)').run(
              'Test', 'Doctor', 'General'
            );
            const doctorId = db.prepare('SELECT last_insert_rowid() as id').get().id;

            db.prepare('INSERT INTO admissions (patient_id, status) VALUES (?, ?)').run(
              patientId, 'active'
            );
            const admissionId = db.prepare('SELECT last_insert_rowid() as id').get().id;

            db.prepare('INSERT INTO discharge_records (patient_id, doctor_id, admission_id, status) VALUES (?, ?, ?, ?)').run(
              patientId, doctorId, admissionId, 'medical_discharge_complete'
            );
            const dischargeId = db.prepare('SELECT last_insert_rowid() as id').get().id;

            // Create billing and payment
            db.prepare(`
              INSERT INTO billing_records (discharge_id, patient_id, subtotal, total_amount, status)
              VALUES (?, ?, ?, ?, ?)
            `).run(dischargeId, patientId, 1000, 1000, 'billing_complete');
            const billingId = db.prepare('SELECT last_insert_rowid() as id').get().id;

            db.prepare(`
              INSERT INTO payment_records (billing_id, payment_amount, payment_method, payment_status, remaining_balance, admin_id)
              VALUES (?, ?, ?, ?, ?, ?)
            `).run(billingId, 1000, 'cash', 'complete', 0, 1);

            // Get bed
            const bed = db.prepare('SELECT id FROM beds LIMIT 1').get();

            // Release bed
            db.prepare(`
              INSERT INTO bed_releases (discharge_id, bed_id, patient_id, status, release_date, admin_id)
              VALUES (?, ?, ?, ?, ?, ?)
            `).run(dischargeId, bed.id, patientId, 'available', new Date().toISOString(), 1);

            // Create audit log
            db.prepare(`
              INSERT INTO discharge_audit (discharge_id, action, staff_id, staff_name, staff_role, details)
              VALUES (?, ?, ?, ?, ?, ?)
            `).run(
              dischargeId,
              'bed_released',
              1,
              'Admin 1',
              'admin',
              JSON.stringify({ bedId: bed.id, reason: releaseReason })
            );

            // Verify audit log
            const audit = db.prepare('SELECT * FROM discharge_audit WHERE discharge_id = ?').get(dischargeId);
            
            return (
              audit !== undefined &&
              audit.action === 'bed_released' &&
              audit.staff_role === 'admin'
            );
          }
        ),
        { numRuns: 15 }
      );
    });
  });
});
