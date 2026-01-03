const express = require('express');
const path = require('path');
const {
  patientSchema,
  enhancedPatientRegistrationSchema,
  nextOfKinSchema,
  familyMemberSchema,
  patientVitalsSchema,
  registrationAuditSchema,
  doctorSchema,
  encounterSchema,
  diagnosisSchema,
  labOrderSchema,
  labUpdateSchema,
  prescriptionSchema,
  admissionSchema,
  dischargeSchema,
  doctorDischargeSchema,
  billingSchema,
  paymentSchema,
  bedReleaseSchema,
} = require('./schemas');
const { init, db } = require('./db');
const { getEmailService } = require('./services/emailService');

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
    middleName: row.middle_name,
    lastName: row.last_name,
    gender: row.gender,
    dateOfBirth: row.date_of_birth,
    contactInfo: row.contact_info,
    accountType: row.account_type,
    recordNumber: row.record_number,
    createdBy: row.created_by,
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

function generateRecordNumber() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TH${timestamp}${random}`;
}

// Staff authorization middleware
function requireStaffAuth(req, res, next) {
  const staffId = req.headers['x-staff-id'];
  const staffRole = req.headers['x-staff-role'];
  
  if (!staffId) {
    res.status(401).json({ message: 'Staff authentication required: missing Staff ID header' });
    return;
  }
  
  if (!staffRole) {
    res.status(401).json({ message: 'Staff authentication required: missing Staff role header' });
    return;
  }
  
  // Verify staff role is authorized for registration
  const authorizedRoles = ['admin', 'receptionist', 'administrator'];
  if (!authorizedRoles.includes(staffRole.toLowerCase())) {
    res.status(403).json({ message: `Insufficient permissions: role '${staffRole}' is not authorized for patient registration` });
    return;
  }
  
  // Attach staff info to request for audit logging
  req.staff = {
    id: staffId,
    role: staffRole.toLowerCase()
  };
  
  next();
}

// Authorization middleware for doctor discharge operations
function requireDoctorAuth(req, res, next) {
  const staffId = req.headers['x-staff-id'];
  const staffRole = req.headers['x-staff-role'];
  
  if (!staffId) {
    res.status(401).json({ message: 'Staff ID is required' });
    return;
  }
  
  if (!staffRole) {
    res.status(401).json({ message: 'Staff role is required' });
    return;
  }
  
  // Verify staff has doctor role for discharge
  if (staffRole.toLowerCase() !== 'doctor') {
    res.status(403).json({ message: 'Only doctors can initiate patient discharge' });
    return;
  }
  
  // Attach staff info to request for logging
  req.staff = {
    id: staffId,
    role: staffRole
  };
  
  next();
}

// Authorization middleware for admin operations (billing, payment, bed release)
function requireAdminAuth(req, res, next) {
  const staffId = req.headers['x-staff-id'];
  const staffRole = req.headers['x-staff-role'];
  
  if (!staffId) {
    res.status(401).json({ message: 'Staff ID is required' });
    return;
  }
  
  if (!staffRole) {
    res.status(401).json({ message: 'Staff role is required' });
    return;
  }
  
  // Verify staff has admin role
  const allowedRoles = ['admin', 'administrator'];
  if (!allowedRoles.includes(staffRole.toLowerCase())) {
    res.status(403).json({ message: 'Only administrators can perform this operation' });
    return;
  }
  
  // Attach staff info to request for logging
  req.staff = {
    id: staffId,
    role: staffRole
  };
  
  next();
}

// Verify staff exists and is active
function verifyStaffExists(req, res, next) {
  const staffId = req.staff?.id;
  
  if (!staffId) {
    res.status(401).json({ message: 'Staff authentication required' });
    return;
  }
  
  // In a real implementation, this would query a staff table
  // For now, we'll accept any valid staff ID
  if (!/^\d+$/.test(staffId)) {
    res.status(400).json({ message: 'Invalid staff ID format' });
    return;
  }
  
  next();
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

app.post('/patients', requireStaffAuth, (req, res, next) => {
  try {
    // Check if this is an enhanced registration request
    const isEnhancedRequest = req.body.accountType && req.body.personalInfo;
    
    if (isEnhancedRequest) {
      // Enhanced patient registration with account types, next of kin, and family members
      const payload = validate(enhancedPatientRegistrationSchema, req.body);
      
      // Generate unique record number
      const recordNumber = generateRecordNumber();
      
      // Start atomic transaction for multi-table operations
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
          `Staff ${payload.createdBy}`, // This should be enhanced with actual staff name lookup
          auditDetails
        );
        
        return {
          patientId,
          recordNumber,
          nextOfKinId,
          familyMemberIds: familyMemberIds || []
        };
      });
      
      const result = createPatientWithRelations();
      
      // Fetch the created patient with all details
      const patient = mapPatient(db.prepare('SELECT * FROM patients WHERE id = ?').get(result.patientId));
      
      // Fetch next of kin if created
      let nextOfKin = null;
      if (result.nextOfKinId) {
        nextOfKin = db.prepare('SELECT * FROM next_of_kin WHERE id = ?').get(result.nextOfKinId);
      }
      
      // Fetch family members if created
      let familyMembers = [];
      if (result.familyMemberIds && result.familyMemberIds.length > 0) {
        const familyMemberQuery = db.prepare(`
          SELECT p.*, fm.relationship, fm.is_primary
          FROM patients p
          JOIN family_members fm ON p.id = fm.member_patient_id
          WHERE fm.primary_patient_id = ?
        `);
        const familyRows = familyMemberQuery.all(result.patientId);
        familyMembers = familyRows.map(row => ({
          ...mapPatient(row),
          relationship: row.relationship,
          isPrimary: row.is_primary === 1
        }));
      }
      
      res.status(201).json({
        patient,
        nextOfKin,
        familyMembers,
        message: 'Patient registration completed successfully'
      });
      
    } else {
      // Legacy patient registration (backward compatibility)
      const payload = validate(patientSchema, req.body);
      const recordNumber = generateRecordNumber();
      
      const stmt = db.prepare(`
        INSERT INTO patients (first_name, middle_name, last_name, gender, date_of_birth, contact_info, account_type, record_number, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        payload.firstName,
        payload.middleName || null,
        payload.lastName,
        payload.gender,
        payload.dateOfBirth,
        payload.contactInfo || null,
        payload.accountType || 'personal',
        recordNumber,
        payload.createdBy || null
      );
      
      const patient = mapPatient(db.prepare('SELECT * FROM patients WHERE id = ?').get(result.lastInsertRowid));
      res.status(201).json(patient);
    }
  } catch (error) {
    next(error);
  }
});

app.get('/patients/check-duplicate', (req, res, next) => {
  try {
    const { firstName, lastName, dateOfBirth, phone } = req.query;
    
    if (!firstName || !lastName || !dateOfBirth) {
      return res.status(400).json({ 
        message: 'firstName, lastName, and dateOfBirth are required parameters' 
      });
    }
    
    // Build dynamic query based on available parameters
    let query = `
      SELECT id, first_name, middle_name, last_name, gender, date_of_birth, 
             contact_info, account_type, record_number, created_at
      FROM patients 
      WHERE LOWER(first_name) = LOWER(?) 
        AND LOWER(last_name) = LOWER(?) 
        AND date_of_birth = ?
    `;
    
    const params = [firstName, lastName, dateOfBirth];
    
    // Add phone matching if provided
    if (phone) {
      query += ` AND (contact_info LIKE ? OR contact_info LIKE ?)`;
      // Match phone in various formats within contact_info JSON
      params.push(`%${phone}%`, `%${phone.replace(/\D/g, '')}%`);
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const duplicates = db.prepare(query).all(...params);
    
    const result = {
      hasDuplicates: duplicates.length > 0,
      duplicateCount: duplicates.length,
      duplicates: duplicates.map(mapPatient)
    };
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.post('/patients/:id/vitals', requireStaffAuth, (req, res, next) => {
  try {
    const payload = validate(patientVitalsSchema, req.body);
    
    // Verify patient exists
    const patient = db.prepare('SELECT id FROM patients WHERE id = ?').get(req.params.id);
    if (!patient) {
      res.status(404).json({ message: 'Patient not found' });
      return;
    }
    
    // Insert vital signs record
    const stmt = db.prepare(`
      INSERT INTO patient_vitals (
        patient_id, blood_pressure_systolic, blood_pressure_diastolic, 
        heart_rate, temperature, height, weight, respiratory_rate, 
        oxygen_saturation, recorded_by, recorded_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      req.params.id,
      payload.bloodPressureSystolic || null,
      payload.bloodPressureDiastolic || null,
      payload.heartRate || null,
      payload.temperature || null,
      payload.height || null,
      payload.weight || null,
      payload.respiratoryRate || null,
      payload.oxygenSaturation || null,
      payload.recordedBy,
      new Date().toISOString()
    );
    
    const vitals = db.prepare('SELECT * FROM patient_vitals WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(vitals);
  } catch (error) {
    next(error);
  }
});

app.post('/patients/:id/resend-welcome-email', requireStaffAuth, async (req, res, next) => {
  try {
    const { staffId, reason } = req.body;
    
    if (!staffId) {
      res.status(400).json({ message: 'staffId is required' });
      return;
    }
    
    // Verify patient exists
    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
    if (!patient) {
      res.status(404).json({ message: 'Patient not found' });
      return;
    }
    
    // Check if patient has email
    if (!patient.email) {
      res.status(400).json({ message: 'Patient does not have an email address on file' });
      return;
    }
    
    // Get email service
    const emailService = getEmailService();
    
    // Send welcome email
    let emailResult = null;
    try {
      emailResult = await emailService.sendWelcomeEmail({
        to: patient.email,
        patientName: `${patient.first_name} ${patient.last_name}`,
        recordNumber: patient.record_number,
        hospitalName: 'CareWell Hospital'
      });
    } catch (emailError) {
      console.error('Email send error:', emailError.message);
      // Continue to log audit even if email fails
      emailResult = {
        success: false,
        error: emailError.message
      };
    }
    
    // Log email resend attempt in audit
    const insertAudit = db.prepare(`
      INSERT INTO registration_audit (patient_id, action, staff_id, staff_name, details)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const auditDetails = JSON.stringify({
      reason: reason || 'Manual resend',
      emailType: 'welcome_email',
      emailStatus: emailResult.success ? 'sent' : 'failed',
      emailError: emailResult.error || null,
      messageId: emailResult.messageId || null
    });
    
    insertAudit.run(
      req.params.id,
      'welcome_email_resent',
      staffId,
      `Staff ${staffId}`,
      auditDetails
    );
    
    res.json({
      message: emailResult.success ? 'Welcome email sent successfully' : 'Welcome email send failed',
      patientId: req.params.id,
      status: emailResult.success ? 'sent' : 'failed',
      emailStatus: emailResult
    });
  } catch (error) {
    next(error);
  }
});

app.post('/registration-audit', requireStaffAuth, (req, res, next) => {
  try {
    const payload = validate(registrationAuditSchema, req.body);
    
    const stmt = db.prepare(`
      INSERT INTO registration_audit (patient_id, action, staff_id, staff_name, details, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      payload.patientId || null,
      payload.action,
      payload.staffId,
      payload.staffName,
      payload.details || null,
      payload.ipAddress || null,
      payload.userAgent || null
    );
    
    const audit = db.prepare('SELECT * FROM registration_audit WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(audit);
  } catch (error) {
    next(error);
  }
});

app.get('/patients', (_req, res) => {
  const rows = db.prepare('SELECT * FROM patients ORDER BY created_at DESC').all();
  res.json(rows.map(mapPatient));
});

app.get('/patients/generate-record-number', (_req, res) => {
  try {
    const recordNumber = generateRecordNumber();
    
    // Verify uniqueness (retry if collision)
    let isUnique = false;
    let finalRecordNumber = recordNumber;
    let attempts = 0;
    const maxAttempts = 5;
    
    while (!isUnique && attempts < maxAttempts) {
      const existing = db.prepare('SELECT id FROM patients WHERE record_number = ?').get(finalRecordNumber);
      if (!existing) {
        isUnique = true;
      } else {
        finalRecordNumber = generateRecordNumber();
        attempts++;
      }
    }
    
    if (!isUnique) {
      res.status(500).json({ message: 'Failed to generate unique record number' });
      return;
    }
    
    res.json({ recordNumber: finalRecordNumber });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to generate record number' });
  }
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

// Doctor discharge endpoint - initiates patient discharge
app.post('/discharge', requireDoctorAuth, (req, res, next) => {
  try {
    const payload = validate(doctorDischargeSchema, req.body);
    
    // Verify patient exists
    const patient = db.prepare('SELECT id FROM patients WHERE id = ?').get(payload.patientId);
    if (!patient) {
      res.status(404).json({ message: 'Patient not found' });
      return;
    }
    
    // Verify admission exists and is active
    const admission = db.prepare('SELECT * FROM admissions WHERE id = ? AND patient_id = ?').get(payload.admissionId, payload.patientId);
    if (!admission) {
      res.status(404).json({ message: 'Admission not found for this patient' });
      return;
    }
    
    if (admission.status !== 'active') {
      res.status(409).json({ message: 'Patient is not currently admitted' });
      return;
    }
    
    // Create discharge record in transaction
    const createDischarge = db.transaction(() => {
      // Create discharge record
      const insertDischarge = db.prepare(`
        INSERT INTO discharge_records (patient_id, doctor_id, admission_id, status, discharge_notes, discharge_date)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      const dischargeResult = insertDischarge.run(
        payload.patientId,
        req.staff.id, // doctor_id from staff auth
        payload.admissionId,
        'medical_discharge_complete',
        payload.dischargeNotes,
        new Date().toISOString()
      );
      
      const dischargeId = dischargeResult.lastInsertRowid;
      
      // Create audit log entry
      const insertAudit = db.prepare(`
        INSERT INTO discharge_audit (discharge_id, action, staff_id, staff_name, staff_role, details)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      insertAudit.run(
        dischargeId,
        'discharge_initiated',
        req.staff.id,
        `Doctor ${req.staff.id}`,
        'doctor',
        JSON.stringify({
          patientId: payload.patientId,
          admissionId: payload.admissionId,
          dischargeNotes: payload.dischargeNotes
        })
      );
      
      return dischargeId;
    });
    
    const dischargeId = createDischarge();
    
    // Fetch the created discharge record
    const discharge = db.prepare('SELECT * FROM discharge_records WHERE id = ?').get(dischargeId);
    
    res.status(201).json({
      id: discharge.id,
      patientId: discharge.patient_id,
      doctorId: discharge.doctor_id,
      admissionId: discharge.admission_id,
      status: discharge.status,
      dischargeDate: discharge.discharge_date,
      dischargeNotes: discharge.discharge_notes,
      createdAt: discharge.created_at,
      message: 'Patient discharge initiated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get discharge record by ID
app.get('/discharge/:id', (req, res, next) => {
  try {
    const discharge = db.prepare('SELECT * FROM discharge_records WHERE id = ?').get(req.params.id);
    
    if (!discharge) {
      res.status(404).json({ message: 'Discharge record not found' });
      return;
    }
    
    // Fetch related data
    const patient = mapPatient(db.prepare('SELECT * FROM patients WHERE id = ?').get(discharge.patient_id));
    const doctor = mapDoctor(db.prepare('SELECT * FROM doctors WHERE id = ?').get(discharge.doctor_id));
    const admission = db.prepare('SELECT * FROM admissions WHERE id = ?').get(discharge.admission_id);
    
    // Fetch billing if exists
    const billing = db.prepare('SELECT * FROM billing_records WHERE discharge_id = ?').get(discharge.id);
    
    // Fetch payment if exists
    const payment = billing ? db.prepare('SELECT * FROM payment_records WHERE billing_id = ?').get(billing.id) : null;
    
    // Fetch bed release if exists
    const bedRelease = db.prepare('SELECT * FROM bed_releases WHERE discharge_id = ?').get(discharge.id);
    
    res.json({
      id: discharge.id,
      patient,
      doctor,
      admission,
      status: discharge.status,
      dischargeDate: discharge.discharge_date,
      dischargeNotes: discharge.discharge_notes,
      billing,
      payment,
      bedRelease,
      createdAt: discharge.created_at,
      updatedAt: discharge.updated_at
    });
  } catch (error) {
    next(error);
  }
});

// Get discharge audit trail
app.get('/discharge/:id/audit', (req, res, next) => {
  try {
    const discharge = db.prepare('SELECT id FROM discharge_records WHERE id = ?').get(req.params.id);
    
    if (!discharge) {
      res.status(404).json({ message: 'Discharge record not found' });
      return;
    }
    
    const auditTrail = db.prepare(`
      SELECT * FROM discharge_audit 
      WHERE discharge_id = ? 
      ORDER BY created_at DESC
    `).all(req.params.id);
    
    res.json({
      dischargeId: req.params.id,
      auditTrail
    });
  } catch (error) {
    next(error);
  }
});

// Admin billing endpoint - calculates patient bill
app.post('/billing', requireAdminAuth, (req, res, next) => {
  try {
    const payload = validate(billingSchema, req.body);
    
    // Verify discharge record exists
    const discharge = db.prepare('SELECT * FROM discharge_records WHERE id = ?').get(payload.dischargeId);
    if (!discharge) {
      res.status(404).json({ message: 'Discharge record not found' });
      return;
    }
    
    // Check if billing already exists for this discharge
    const existingBilling = db.prepare('SELECT id FROM billing_records WHERE discharge_id = ?').get(payload.dischargeId);
    if (existingBilling) {
      res.status(409).json({ message: 'Billing already calculated for this discharge' });
      return;
    }
    
    // Calculate billing in transaction
    const createBilling = db.transaction(() => {
      // Calculate discount amount
      const discountAmount = (payload.subtotal * payload.discountPercentage) / 100;
      const totalAmount = payload.subtotal - discountAmount;
      
      // Create billing record
      const insertBilling = db.prepare(`
        INSERT INTO billing_records (discharge_id, patient_id, subtotal, discount_percentage, discount_amount, total_amount, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      const billingResult = insertBilling.run(
        payload.dischargeId,
        discharge.patient_id,
        payload.subtotal,
        payload.discountPercentage,
        discountAmount,
        totalAmount,
        'billing_complete'
      );
      
      const billingId = billingResult.lastInsertRowid;
      
      // Create audit log entry
      const insertAudit = db.prepare(`
        INSERT INTO discharge_audit (discharge_id, action, staff_id, staff_name, staff_role, details)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      insertAudit.run(
        payload.dischargeId,
        'billing_calculated',
        req.staff.id,
        `Admin ${req.staff.id}`,
        'admin',
        JSON.stringify({
          subtotal: payload.subtotal,
          discountPercentage: payload.discountPercentage,
          discountAmount,
          totalAmount
        })
      );
      
      return billingId;
    });
    
    const billingId = createBilling();
    
    // Fetch the created billing record
    const billing = db.prepare('SELECT * FROM billing_records WHERE id = ?').get(billingId);
    
    res.status(201).json({
      id: billing.id,
      dischargeId: billing.discharge_id,
      patientId: billing.patient_id,
      subtotal: billing.subtotal,
      discountPercentage: billing.discount_percentage,
      discountAmount: billing.discount_amount,
      totalAmount: billing.total_amount,
      status: billing.status,
      createdAt: billing.created_at,
      message: 'Billing calculated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get billing record by ID
app.get('/billing/:id', (req, res, next) => {
  try {
    const billing = db.prepare('SELECT * FROM billing_records WHERE id = ?').get(req.params.id);
    
    if (!billing) {
      res.status(404).json({ message: 'Billing record not found' });
      return;
    }
    
    // Fetch billing items
    const items = db.prepare('SELECT * FROM billing_items WHERE billing_id = ?').all(req.params.id);
    
    res.json({
      id: billing.id,
      dischargeId: billing.discharge_id,
      patientId: billing.patient_id,
      subtotal: billing.subtotal,
      discountPercentage: billing.discount_percentage,
      discountAmount: billing.discount_amount,
      totalAmount: billing.total_amount,
      status: billing.status,
      items,
      createdAt: billing.created_at
    });
  } catch (error) {
    next(error);
  }
});

// Admin payment endpoint - processes payment for billing
app.post('/payment', requireAdminAuth, (req, res, next) => {
  try {
    const payload = validate(paymentSchema, req.body);
    
    // Verify billing record exists
    const billing = db.prepare('SELECT * FROM billing_records WHERE id = ?').get(payload.billingId);
    if (!billing) {
      res.status(404).json({ message: 'Billing record not found' });
      return;
    }
    
    // Verify payment amount is valid
    if (payload.paymentAmount > billing.total_amount) {
      res.status(400).json({ message: 'Payment amount exceeds total bill' });
      return;
    }
    
    // Check if payment already exists for this billing
    const existingPayment = db.prepare('SELECT id FROM payment_records WHERE billing_id = ?').get(payload.billingId);
    if (existingPayment) {
      res.status(409).json({ message: 'Payment already processed for this billing' });
      return;
    }
    
    // Process payment in transaction
    const processPayment = db.transaction(() => {
      // Calculate remaining balance
      const remainingBalance = billing.total_amount - payload.paymentAmount;
      
      // Create payment record
      const insertPayment = db.prepare(`
        INSERT INTO payment_records (billing_id, payment_amount, payment_method, payment_status, remaining_balance, admin_id, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      const paymentResult = insertPayment.run(
        payload.billingId,
        payload.paymentAmount,
        payload.paymentMethod,
        'complete',
        remainingBalance,
        req.staff.id,
        payload.notes || null
      );
      
      const paymentId = paymentResult.lastInsertRowid;
      
      // Get discharge ID from billing
      const discharge = db.prepare('SELECT discharge_id FROM billing_records WHERE id = ?').get(payload.billingId);
      
      // Create audit log entry
      const insertAudit = db.prepare(`
        INSERT INTO discharge_audit (discharge_id, action, staff_id, staff_name, staff_role, details)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      insertAudit.run(
        discharge.discharge_id,
        'payment_processed',
        req.staff.id,
        `Admin ${req.staff.id}`,
        'admin',
        JSON.stringify({
          billingId: payload.billingId,
          paymentAmount: payload.paymentAmount,
          paymentMethod: payload.paymentMethod,
          remainingBalance
        })
      );
      
      return paymentId;
    });
    
    const paymentId = processPayment();
    
    // Fetch the created payment record
    const payment = db.prepare('SELECT * FROM payment_records WHERE id = ?').get(paymentId);
    
    res.status(201).json({
      id: payment.id,
      billingId: payment.billing_id,
      paymentAmount: payment.payment_amount,
      paymentMethod: payment.payment_method,
      paymentStatus: payment.payment_status,
      remainingBalance: payment.remaining_balance,
      notes: payment.notes,
      createdAt: payment.created_at,
      message: 'Payment processed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get payment record by ID
app.get('/payment/:id', (req, res, next) => {
  try {
    const payment = db.prepare('SELECT * FROM payment_records WHERE id = ?').get(req.params.id);
    
    if (!payment) {
      res.status(404).json({ message: 'Payment record not found' });
      return;
    }
    
    // Fetch related billing
    const billing = db.prepare('SELECT * FROM billing_records WHERE id = ?').get(payment.billing_id);
    
    res.json({
      id: payment.id,
      billingId: payment.billing_id,
      billing,
      paymentAmount: payment.payment_amount,
      paymentMethod: payment.payment_method,
      paymentStatus: payment.payment_status,
      remainingBalance: payment.remaining_balance,
      notes: payment.notes,
      createdAt: payment.created_at
    });
  } catch (error) {
    next(error);
  }
});

// Admin bed release endpoint - releases bed after discharge and payment
app.post('/bed-release', requireAdminAuth, (req, res, next) => {
  try {
    const payload = validate(bedReleaseSchema, req.body);
    
    // Verify discharge record exists
    const discharge = db.prepare('SELECT * FROM discharge_records WHERE id = ?').get(payload.dischargeId);
    if (!discharge) {
      res.status(404).json({ message: 'Discharge record not found' });
      return;
    }
    
    // Verify bed exists
    const bed = db.prepare('SELECT * FROM beds WHERE id = ?').get(payload.bedId);
    if (!bed) {
      res.status(404).json({ message: 'Bed not found' });
      return;
    }
    
    // Verify discharge and payment are complete
    const billing = db.prepare('SELECT * FROM billing_records WHERE discharge_id = ?').get(payload.dischargeId);
    if (!billing) {
      res.status(409).json({ message: 'Billing not calculated for this discharge' });
      return;
    }
    
    const payment = db.prepare('SELECT * FROM payment_records WHERE billing_id = ?').get(billing.id);
    if (!payment) {
      res.status(409).json({ message: 'Payment not processed for this discharge' });
      return;
    }
    
    // Check if bed release already exists
    const existingRelease = db.prepare('SELECT id FROM bed_releases WHERE discharge_id = ?').get(payload.dischargeId);
    if (existingRelease) {
      res.status(409).json({ message: 'Bed already released for this discharge' });
      return;
    }
    
    // Release bed in transaction
    const releaseBed = db.transaction(() => {
      // Create bed release record
      const insertRelease = db.prepare(`
        INSERT INTO bed_releases (discharge_id, bed_id, patient_id, status, release_date, admin_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      const releaseResult = insertRelease.run(
        payload.dischargeId,
        payload.bedId,
        discharge.patient_id,
        'available',
        new Date().toISOString(),
        req.staff.id
      );
      
      const releaseId = releaseResult.lastInsertRowid;
      
      // Update bed status to available
      db.prepare('UPDATE beds SET status = ? WHERE id = ?').run('available', payload.bedId);
      
      // Create audit log entry
      const insertAudit = db.prepare(`
        INSERT INTO discharge_audit (discharge_id, action, staff_id, staff_name, staff_role, details)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      insertAudit.run(
        payload.dischargeId,
        'bed_released',
        req.staff.id,
        `Admin ${req.staff.id}`,
        'admin',
        JSON.stringify({
          bedId: payload.bedId,
          patientId: discharge.patient_id,
          releaseDate: new Date().toISOString()
        })
      );
      
      return releaseId;
    });
    
    const releaseId = releaseBed();
    
    // Fetch the created bed release record
    const release = db.prepare('SELECT * FROM bed_releases WHERE id = ?').get(releaseId);
    
    res.status(201).json({
      id: release.id,
      dischargeId: release.discharge_id,
      bedId: release.bed_id,
      patientId: release.patient_id,
      status: release.status,
      releaseDate: release.release_date,
      createdAt: release.created_at,
      message: 'Bed released successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get bed release record by ID
app.get('/bed-release/:id', (req, res, next) => {
  try {
    const release = db.prepare('SELECT * FROM bed_releases WHERE id = ?').get(req.params.id);
    
    if (!release) {
      res.status(404).json({ message: 'Bed release record not found' });
      return;
    }
    
    // Fetch related bed and discharge
    const bed = db.prepare('SELECT * FROM beds WHERE id = ?').get(release.bed_id);
    const discharge = db.prepare('SELECT * FROM discharge_records WHERE id = ?').get(release.discharge_id);
    
    res.json({
      id: release.id,
      dischargeId: release.discharge_id,
      bedId: release.bed_id,
      bed,
      discharge,
      patientId: release.patient_id,
      status: release.status,
      releaseDate: release.release_date,
      createdAt: release.created_at
    });
  } catch (error) {
    next(error);
  }
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
