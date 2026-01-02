const express = require('express');
const path = require('path');
const {
  patientSchema,
  doctorSchema,
  encounterSchema,
  diagnosisSchema,
  labOrderSchema,
  labUpdateSchema,
  prescriptionSchema,
  admissionSchema,
  dischargeSchema,
} = require('./schemas');
const { init, db } = require('./db');

console.log('Starting T-Happy Hospital Server...');
console.log('Initializing database...');
init();
console.log('Database initialized successfully!');

const app = express();

// CORS middleware to allow frontend access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

function validate(schema, payload) {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    const details = parsed.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('; ');
    const error = new Error(details);
    error.status = 400;
    throw error;
  }
  return parsed.data;
}

function mapPatient(row) {
  if (!row) return null;
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    gender: row.gender,
    dateOfBirth: row.date_of_birth,
    contactInfo: row.contact_info,
    createdAt: row.created_at,
  };
}

function mapDoctor(row) {
  if (!row) return null;
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    specialty: row.specialty,
    contactInfo: row.contact_info,
    createdAt: row.created_at,
  };
}

app.get('/', (_req, res) => {
  // Temporary log to confirm traffic reaches this route.
  // eslint-disable-next-line no-console
  console.log('Serving landing page from', publicDir);
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.post('/patients', (req, res, next) => {
  try {
    const payload = validate(patientSchema, req.body);
    const stmt = db.prepare(`
      INSERT INTO patients (first_name, last_name, gender, date_of_birth, contact_info)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      payload.firstName,
      payload.lastName,
      payload.gender,
      payload.dateOfBirth,
      payload.contactInfo ?? null,
    );
    const patient = mapPatient(db.prepare('SELECT * FROM patients WHERE id = ?').get(result.lastInsertRowid));
    res.status(201).json(patient);
  } catch (error) {
    next(error);
  }
});

app.get('/patients', (_req, res) => {
  const rows = db.prepare('SELECT * FROM patients ORDER BY created_at DESC').all();
  res.json(rows.map(mapPatient));
});

app.get('/patients/:id', (req, res, next) => {
  try {
    const patient = mapPatient(db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id));
    if (!patient) {
      res.status(404).json({ message: 'Patient not found' });
      return;
    }

    const encounters = db
      .prepare('SELECT * FROM encounters WHERE patient_id = ? ORDER BY visit_date DESC')
      .all(req.params.id);
    const diagnosisStmt = db.prepare('SELECT * FROM diagnoses WHERE encounter_id = ? ORDER BY created_at DESC');
    const labsStmt = db.prepare('SELECT * FROM lab_orders WHERE encounter_id = ? ORDER BY requested_at DESC');
    const prescriptionStmt = db.prepare(
      'SELECT * FROM prescriptions WHERE encounter_id = ? ORDER BY created_at DESC',
    );

    const history = encounters.map((enc) => ({
      id: enc.id,
      doctorId: enc.doctor_id,
      visitDate: enc.visit_date,
      reason: enc.reason,
      notes: enc.notes,
      diagnoses: diagnosisStmt.all(enc.id),
      labs: labsStmt.all(enc.id),
      prescriptions: prescriptionStmt.all(enc.id),
    }));

    const admissions = db
      .prepare(
        `SELECT admissions.*, beds.ward, beds.bed_number
         FROM admissions
         LEFT JOIN beds ON beds.id = admissions.bed_id
         WHERE patient_id = ?
         ORDER BY admit_date DESC`,
      )
      .all(req.params.id)
      .map((row) => ({
        id: row.id,
        encounterId: row.encounter_id,
        bedId: row.bed_id,
        ward: row.ward,
        bedNumber: row.bed_number,
        admitDate: row.admit_date,
        dischargeDate: row.discharge_date,
        status: row.status,
        notes: row.notes,
      }));

    res.json({ patient, history, admissions });
  } catch (error) {
    next(error);
  }
});

app.post('/doctors', (req, res, next) => {
  try {
    const payload = validate(doctorSchema, req.body);
    const stmt = db.prepare(`
      INSERT INTO doctors (first_name, last_name, specialty, contact_info)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(
      payload.firstName,
      payload.lastName,
      payload.specialty,
      payload.contactInfo ?? null,
    );
    const doctor = mapDoctor(db.prepare('SELECT * FROM doctors WHERE id = ?').get(result.lastInsertRowid));
    res.status(201).json(doctor);
  } catch (error) {
    next(error);
  }
});

app.get('/doctors', (_req, res) => {
  const rows = db.prepare('SELECT * FROM doctors ORDER BY created_at DESC').all();
  res.json(rows.map(mapDoctor));
});

app.post('/encounters', (req, res, next) => {
  try {
    const payload = validate(encounterSchema, req.body);
    const stmt = db.prepare(`
      INSERT INTO encounters (patient_id, doctor_id, visit_date, reason, notes)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      payload.patientId,
      payload.doctorId,
      payload.visitDate,
      payload.reason ?? null,
      payload.notes ?? null,
    );
    const encounter = db.prepare('SELECT * FROM encounters WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(encounter);
  } catch (error) {
    next(error);
  }
});

app.post('/diagnoses', (req, res, next) => {
  try {
    const payload = validate(diagnosisSchema, req.body);
    const stmt = db.prepare(`
      INSERT INTO diagnoses (encounter_id, summary, details)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(payload.encounterId, payload.summary, payload.details ?? null);
    const record = db.prepare('SELECT * FROM diagnoses WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
});

app.post('/lab-orders', (req, res, next) => {
  try {
    const payload = validate(labOrderSchema, req.body);
    const stmt = db.prepare(`
      INSERT INTO lab_orders (encounter_id, test_type)
      VALUES (?, ?)
    `);
    const result = stmt.run(payload.encounterId, payload.testType);
    const record = db.prepare('SELECT * FROM lab_orders WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
});

app.patch('/lab-orders/:id', (req, res, next) => {
  try {
    const payload = validate(labUpdateSchema, req.body);
    const stmt = db.prepare(`
      UPDATE lab_orders
      SET status = ?, results = COALESCE(?, results), completed_at = COALESCE(?, completed_at)
      WHERE id = ?
    `);
    const result = stmt.run(payload.status, payload.results ?? null, payload.completedAt ?? null, req.params.id);
    if (result.changes === 0) {
      res.status(404).json({ message: 'Lab order not found' });
      return;
    }
    const record = db.prepare('SELECT * FROM lab_orders WHERE id = ?').get(req.params.id);
    res.json(record);
  } catch (error) {
    next(error);
  }
});

app.post('/prescriptions', (req, res, next) => {
  try {
    const payload = validate(prescriptionSchema, req.body);
    const stmt = db.prepare(`
      INSERT INTO prescriptions (encounter_id, medication, dosage, frequency, duration, instructions)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      payload.encounterId,
      payload.medication,
      payload.dosage,
      payload.frequency,
      payload.duration ?? null,
      payload.instructions ?? null,
    );
    const record = db.prepare('SELECT * FROM prescriptions WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
});

app.get('/beds', (req, res) => {
  let query = 'SELECT * FROM beds';
  const params = [];
  if (req.query.status) {
    query += ' WHERE status = ?';
    params.push(req.query.status);
  }
  query += ' ORDER BY ward, bed_number';
  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

app.post('/admissions', (req, res, next) => {
  try {
    const payload = validate(admissionSchema, req.body);
    const bed = db.prepare('SELECT * FROM beds WHERE id = ?').get(payload.bedId);
    if (!bed) {
      res.status(404).json({ message: 'Bed not found' });
      return;
    }
    if (bed.status !== 'available') {
      res.status(400).json({ message: 'Bed not available' });
      return;
    }

    const createAdmission = db.transaction(() => {
      db.prepare('UPDATE beds SET status = ? WHERE id = ?').run('occupied', payload.bedId);
      const result = db
        .prepare(
          `INSERT INTO admissions (patient_id, encounter_id, bed_id, notes)
           VALUES (?, ?, ?, ?)`,
        )
        .run(payload.patientId, payload.encounterId ?? null, payload.bedId, payload.notes ?? null);
      return result.lastInsertRowid;
    });

    const admissionId = createAdmission();
    const admission = db.prepare('SELECT * FROM admissions WHERE id = ?').get(admissionId);
    res.status(201).json(admission);
  } catch (error) {
    next(error);
  }
});

app.post('/admissions/:id/discharge', (req, res, next) => {
  try {
    const payload = validate(dischargeSchema, { admissionId: Number(req.params.id), ...req.body });
    const admission = db.prepare('SELECT * FROM admissions WHERE id = ?').get(payload.admissionId);
    if (!admission) {
      res.status(404).json({ message: 'Admission not found' });
      return;
    }
    if (admission.status !== 'active') {
      res.status(400).json({ message: 'Admission already closed' });
      return;
    }
    const dischargeTx = db.transaction(() => {
      db.prepare(
        `UPDATE admissions
         SET status = 'discharged', discharge_date = CURRENT_TIMESTAMP, notes = COALESCE(?, notes)
         WHERE id = ?`,
      ).run(payload.notes ?? admission.notes, payload.admissionId);
      if (admission.bed_id) {
        db.prepare('UPDATE beds SET status = ? WHERE id = ?').run('available', admission.bed_id);
      }
    });
    dischargeTx();
    const updated = db.prepare('SELECT * FROM admissions WHERE id = ?').get(payload.admissionId);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

app.get('/admissions', (_req, res) => {
  const rows = db
    .prepare(
      `SELECT admissions.*, patients.first_name || ' ' || patients.last_name AS patient_name,
              beds.ward, beds.bed_number
       FROM admissions
       LEFT JOIN patients ON patients.id = admissions.patient_id
       LEFT JOIN beds ON beds.id = admissions.bed_id
       ORDER BY admit_date DESC`,
    )
    .all()
    .map((row) => ({
      id: row.id,
      patientId: row.patient_id,
      patientName: row.patient_name,
      encounterId: row.encounter_id,
      bedId: row.bed_id,
      ward: row.ward,
      bedNumber: row.bed_number,
      status: row.status,
      admitDate: row.admit_date,
      dischargeDate: row.discharge_date,
      notes: row.notes,
    }));
  res.json(rows);
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Unexpected error' });
});

const PORT = process.env.PORT || 3001;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🏥 T-Happy Hospital Management API running on http://localhost:${PORT}`);
    console.log(`📊 Health check available at http://localhost:${PORT}/health`);
    console.log('🚀 Server ready to accept connections!');
  });
}

module.exports = app;
