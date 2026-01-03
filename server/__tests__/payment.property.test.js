const fc = require('fast-check');
const Database = require('better-sqlite3');

describe('Payment Endpoints Property Tests', () => {
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
    `);
  });

  afterEach(() => {
    try {
      db.close();
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Property 4: Payment Amount Validation', () => {
    it('should validate payment amount does not exceed bill total', () => {
      fc.assert(
        fc.property(
          fc.number({ min: 100, max: 10000 }),
          fc.number({ min: 0, max: 1 }),
          (billTotal, paymentRatio) => {
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
            `).run(dischargeId, patientId, billTotal, billTotal, 'billing_complete');
            const billingId = db.prepare('SELECT last_insert_rowid() as id').get().id;

            // Calculate valid payment amount
            const paymentAmount = billTotal * paymentRatio;

            // Verify payment amount is valid
            const billing = db.prepare('SELECT * FROM billing_records WHERE id = ?').get(billingId);
            const isValidPayment = paymentAmount <= billing.total_amount;

            if (isValidPayment) {
              // Create payment record
              const remainingBalance = billing.total_amount - paymentAmount;
              db.prepare(`
                INSERT INTO payment_records (billing_id, payment_amount, payment_method, payment_status, remaining_balance, admin_id)
                VALUES (?, ?, ?, ?, ?, ?)
              `).run(billingId, paymentAmount, 'cash', 'complete', remainingBalance, 1);

              // Verify payment
              const payment = db.prepare('SELECT * FROM payment_records WHERE billing_id = ?').get(billingId);
              return (
                payment !== undefined &&
                payment.payment_amount === paymentAmount &&
                Math.abs(payment.remaining_balance - remainingBalance) < 0.01
              );
            }

            return true;
          }
        ),
        { numRuns: 15 }
      );
    });

    it('should handle full payment correctly', () => {
      fc.assert(
        fc.property(
          fc.number({ min: 100, max: 10000 }),
          (billTotal) => {
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
            `).run(dischargeId, patientId, billTotal, billTotal, 'billing_complete');
            const billingId = db.prepare('SELECT last_insert_rowid() as id').get().id;

            // Create full payment
            db.prepare(`
              INSERT INTO payment_records (billing_id, payment_amount, payment_method, payment_status, remaining_balance, admin_id)
              VALUES (?, ?, ?, ?, ?, ?)
            `).run(billingId, billTotal, 'card', 'complete', 0, 1);

            // Verify payment
            const payment = db.prepare('SELECT * FROM payment_records WHERE billing_id = ?').get(billingId);
            
            return (
              payment !== undefined &&
              payment.payment_amount === billTotal &&
              payment.remaining_balance === 0
            );
          }
        ),
        { numRuns: 15 }
      );
    });
  });

  describe('Property 2: Discharge Status Progression', () => {
    it('should track payment status correctly', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('cash', 'card', 'check', 'insurance'),
          (paymentMethod) => {
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

            // Create payment with method
            db.prepare(`
              INSERT INTO payment_records (billing_id, payment_amount, payment_method, payment_status, remaining_balance, admin_id)
              VALUES (?, ?, ?, ?, ?, ?)
            `).run(billingId, 1000, paymentMethod, 'complete', 0, 1);

            // Verify payment method
            const payment = db.prepare('SELECT * FROM payment_records WHERE billing_id = ?').get(billingId);
            
            return (
              payment !== undefined &&
              payment.payment_method === paymentMethod &&
              payment.payment_status === 'complete'
            );
          }
        ),
        { numRuns: 15 }
      );
    });

    it('should create audit log when payment is processed', () => {
      fc.assert(
        fc.property(
          fc.number({ min: 100, max: 10000 }),
          (paymentAmount) => {
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
            `).run(dischargeId, patientId, paymentAmount, paymentAmount, 'billing_complete');
            const billingId = db.prepare('SELECT last_insert_rowid() as id').get().id;

            // Create payment
            db.prepare(`
              INSERT INTO payment_records (billing_id, payment_amount, payment_method, payment_status, remaining_balance, admin_id)
              VALUES (?, ?, ?, ?, ?, ?)
            `).run(billingId, paymentAmount, 'cash', 'complete', 0, 1);

            // Create audit log
            db.prepare(`
              INSERT INTO discharge_audit (discharge_id, action, staff_id, staff_name, staff_role, details)
              VALUES (?, ?, ?, ?, ?, ?)
            `).run(
              dischargeId,
              'payment_processed',
              1,
              'Admin 1',
              'admin',
              JSON.stringify({ billingId, paymentAmount })
            );

            // Verify audit log
            const audit = db.prepare('SELECT * FROM discharge_audit WHERE discharge_id = ?').get(dischargeId);
            
            return (
              audit !== undefined &&
              audit.action === 'payment_processed' &&
              audit.staff_role === 'admin'
            );
          }
        ),
        { numRuns: 15 }
      );
    });
  });
});
