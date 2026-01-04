const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, '..', 'data', 'hospital.db');
const db = new Database(dbPath);

function init() {
  db.pragma('foreign_keys = ON');
  
  // First, check if we need to migrate the existing patients table
  const tableInfo = db.prepare("PRAGMA table_info(patients)").all();
  const columnNames = tableInfo.map(col => col.name);
  const needsMigration = !columnNames.includes('middle_name') || !columnNames.includes('account_type');
  
  if (needsMigration && tableInfo.length > 0) {
    // Migrate existing patients table
    console.log('Migrating existing patients table...');
    db.exec(`
      -- Create new patients table with all columns
      CREATE TABLE IF NOT EXISTS patients_new (
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
      
      -- Copy existing data
      INSERT INTO patients_new (id, first_name, last_name, gender, date_of_birth, contact_info, created_at)
      SELECT id, first_name, last_name, gender, date_of_birth, contact_info, created_at FROM patients;
      
      -- Drop old table and rename new one
      DROP TABLE patients;
      ALTER TABLE patients_new RENAME TO patients;
    `);
  } else {
    // Create patients table normally
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
    `);
  }
  
  db.exec(`

    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      specialty TEXT NOT NULL,
      contact_info TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS encounters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      doctor_id INTEGER NOT NULL REFERENCES doctors(id),
      visit_date TEXT NOT NULL,
      reason TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS diagnoses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      encounter_id INTEGER NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
      summary TEXT NOT NULL,
      details TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS lab_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      encounter_id INTEGER NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
      test_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'requested',
      results TEXT,
      requested_at TEXT DEFAULT CURRENT_TIMESTAMP,
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS prescriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      encounter_id INTEGER NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
      medication TEXT NOT NULL,
      dosage TEXT NOT NULL,
      frequency TEXT NOT NULL,
      duration TEXT,
      instructions TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS beds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ward TEXT NOT NULL,
      bed_number TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'available',
      UNIQUE(ward, bed_number)
    );

    CREATE TABLE IF NOT EXISTS admissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(id),
      encounter_id INTEGER REFERENCES encounters(id),
      bed_id INTEGER REFERENCES beds(id),
      admit_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      discharge_date TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      notes TEXT
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

    CREATE TABLE IF NOT EXISTS discharge_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      doctor_id INTEGER NOT NULL REFERENCES doctors(id),
      admission_id INTEGER REFERENCES admissions(id),
      status TEXT NOT NULL DEFAULT 'medical_discharge_pending',
      discharge_date TEXT,
      discharge_notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS billing_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discharge_id INTEGER NOT NULL REFERENCES discharge_records(id) ON DELETE CASCADE,
      patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      subtotal REAL NOT NULL DEFAULT 0,
      discount_percentage REAL DEFAULT 0,
      discount_amount REAL DEFAULT 0,
      total_amount REAL NOT NULL DEFAULT 0,
      status TEXT DEFAULT 'billing_complete',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS billing_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      billing_id INTEGER NOT NULL REFERENCES billing_records(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      quantity INTEGER DEFAULT 1,
      item_type TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payment_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      billing_id INTEGER NOT NULL REFERENCES billing_records(id) ON DELETE CASCADE,
      payment_amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT DEFAULT 'complete',
      remaining_balance REAL DEFAULT 0,
      admin_id INTEGER NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bed_releases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discharge_id INTEGER NOT NULL REFERENCES discharge_records(id) ON DELETE CASCADE,
      bed_id INTEGER NOT NULL REFERENCES beds(id),
      patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      status TEXT DEFAULT 'available',
      release_date TEXT,
      admin_id INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS discharge_audit (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discharge_id INTEGER REFERENCES discharge_records(id) ON DELETE CASCADE,
      action TEXT NOT NULL,
      staff_id INTEGER NOT NULL,
      staff_name TEXT NOT NULL,
      staff_role TEXT,
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
    CREATE INDEX IF NOT EXISTS idx_discharge_records_patient_id ON discharge_records(patient_id);
    CREATE INDEX IF NOT EXISTS idx_discharge_records_doctor_id ON discharge_records(doctor_id);
    CREATE INDEX IF NOT EXISTS idx_discharge_records_status ON discharge_records(status);
    CREATE INDEX IF NOT EXISTS idx_billing_records_discharge_id ON billing_records(discharge_id);
    CREATE INDEX IF NOT EXISTS idx_payment_records_billing_id ON payment_records(billing_id);
    CREATE INDEX IF NOT EXISTS idx_bed_releases_bed_id ON bed_releases(bed_id);
    CREATE INDEX IF NOT EXISTS idx_discharge_audit_discharge_id ON discharge_audit(discharge_id);
    CREATE INDEX IF NOT EXISTS idx_discharge_audit_staff_id ON discharge_audit(staff_id);
  `);

  const bedCount = db.prepare('SELECT COUNT(*) as count FROM beds').get().count;
  if (bedCount === 0) {
    const insert = db.prepare('INSERT INTO beds (ward, bed_number, status) VALUES (?, ?, ?)');
    const wards = ['A', 'B', 'C'];
    const bedsPerWard = 5;
    const insertMany = db.transaction(() => {
      wards.forEach((ward) => {
        for (let i = 1; i <= bedsPerWard; i += 1) {
          insert.run(ward, `${ward}-${i}`, 'available');
        }
      });
    });
    insertMany();
  }
}

module.exports = {
  db,
  init,
};
