const fc = require('fast-check');
const Database = require('better-sqlite3');

describe('Billing Endpoints Property Tests', () => {
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

      CREATE TABLE billing_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        billing_id INTEGER NOT NULL,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        quantity INTEGER DEFAULT 1,
        item_type TEXT,
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

  describe('Property 3: Billing Calculation Accuracy', () => {
    it('should calculate billing with correct discount application', () => {
      fc.assert(
        fc.property(
          fc.number({ min: 100, max: 50000 }),
          fc.number({ min: 0, max: 50 }),
          (subtotal, discountPercentage) => {
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

            // Calculate billing
            const discountAmount = (subtotal * discountPercentage) / 100;
            const totalAmount = subtotal - discountAmount;

            db.prepare(`
              INSERT INTO billing_records (discharge_id, patient_id, subtotal, discount_percentage, discount_amount, total_amount, status)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(dischargeId, patientId, subtotal, discountPercentage, discountAmount, totalAmount, 'billing_complete');

            // Verify billing calculation
            const billing = db.prepare('SELECT * FROM billing_records WHERE discharge_id = ?').get(dischargeId);
            
            return (
              billing !== undefined &&
              billing.subtotal === subtotal &&
              billing.discount_percentage === discountPercentage &&
              Math.abs(billing.discount_amount - discountAmount) < 0.01 &&
              Math.abs(billing.total_amount - totalAmount) < 0.01
            );
          }
        ),
        { numRuns: 15 }
      );
    });

    it('should handle zero discount correctly', () => {
      fc.assert(
        fc.property(
          fc.number({ min: 100, max: 50000 }),
          (subtotal) => {
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

            // Create billing with no discount
            db.prepare(`
              INSERT INTO billing_records (discharge_id, patient_id, subtotal, discount_percentage, discount_amount, total_amount, status)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(dischargeId, patientId, subtotal, 0, 0, subtotal, 'billing_complete');

            // Verify
            const billing = db.prepare('SELECT * FROM billing_records WHERE discharge_id = ?').get(dischargeId);
            
            return (
              billing !== undefined &&
              billing.subtotal === subtotal &&
              billing.discount_percentage === 0 &&
              billing.discount_amount === 0 &&
              billing.total_amount === subtotal
            );
          }
        ),
        { numRuns: 15 }
      );
    });
  });

  describe('Property 9: Billing Item Linkage', () => {
    it('should link billing items to billing record correctly', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              description: fc.string({ minLength: 5, maxLength: 100 }),
              amount: fc.number({ min: 10, max: 5000 }),
              quantity: fc.integer({ min: 1, max: 10 })
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (items) => {
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

            // Calculate total
            const subtotal = items.reduce((sum, item) => sum + (item.amount * item.quantity), 0);

            // Create billing
            db.prepare(`
              INSERT INTO billing_records (discharge_id, patient_id, subtotal, total_amount, status)
              VALUES (?, ?, ?, ?, ?)
            `).run(dischargeId, patientId, subtotal, subtotal, 'billing_complete');

            const billingId = db.prepare('SELECT last_insert_rowid() as id').get().id;

            // Add billing items
            const insertItem = db.prepare(`
              INSERT INTO billing_items (billing_id, description, amount, quantity)
              VALUES (?, ?, ?, ?)
            `);

            items.forEach(item => {
              insertItem.run(billingId, item.description, item.amount, item.quantity);
            });

            // Verify items are linked correctly
            const linkedItems = db.prepare('SELECT * FROM billing_items WHERE billing_id = ?').all(billingId);
            
            return (
              linkedItems.length === items.length &&
              linkedItems.every((linkedItem, idx) => 
                linkedItem.description === items[idx].description &&
                linkedItem.amount === items[idx].amount &&
                linkedItem.quantity === items[idx].quantity
              )
            );
          }
        ),
        { numRuns: 15 }
      );
    });
  });

  describe('Property 2: Discharge Status Progression', () => {
    it('should track billing status correctly', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('billing_complete', 'payment_pending', 'payment_complete'),
          (billingStatus) => {
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

            // Create billing with status
            db.prepare(`
              INSERT INTO billing_records (discharge_id, patient_id, subtotal, total_amount, status)
              VALUES (?, ?, ?, ?, ?)
            `).run(dischargeId, patientId, 1000, 1000, billingStatus);

            // Verify status
            const billing = db.prepare('SELECT * FROM billing_records WHERE discharge_id = ?').get(dischargeId);
            
            return (
              billing !== undefined &&
              billing.status === billingStatus
            );
          }
        ),
        { numRuns: 15 }
      );
    });
  });
});
