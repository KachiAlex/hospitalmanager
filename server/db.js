const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, '..', 'data', 'hospital.db');
const db = new Database(dbPath);

function init() {
  db.pragma('foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      gender TEXT CHECK(gender IN ('male','female','other')) NOT NULL,
      date_of_birth TEXT NOT NULL,
      contact_info TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

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
