const { z } = require('zod');

const nameSchema = z.string().min(1).max(100);

// Enhanced patient schema for comprehensive registration
const patientSchema = z.object({
  firstName: nameSchema,
  middleName: nameSchema.optional(),
  lastName: nameSchema,
  gender: z.enum(['male', 'female', 'other']),
  dateOfBirth: z.string(),
  contactInfo: z.string().optional(),
  accountType: z.enum(['personal', 'family']).default('personal'),
  recordNumber: z.string().optional(),
  createdBy: z.number().int().positive().optional(),
});

// Next of kin schema
const nextOfKinSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  relationship: z.enum(['spouse', 'parent', 'child', 'sibling', 'friend', 'other']),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  isEmergencyContact: z.boolean().default(true),
});

// Family member schema
const familyMemberSchema = z.object({
  firstName: nameSchema,
  middleName: nameSchema.optional(),
  lastName: nameSchema,
  gender: z.enum(['male', 'female', 'other']),
  dateOfBirth: z.string(),
  relationship: z.enum(['spouse', 'parent', 'child', 'sibling']),
  isPrimary: z.boolean().default(false),
});

// Enhanced patient registration schema
const enhancedPatientRegistrationSchema = z.object({
  accountType: z.enum(['personal', 'family']),
  personalInfo: patientSchema,
  nextOfKin: nextOfKinSchema.optional(),
  familyMembers: z.array(familyMemberSchema).optional(),
  createdBy: z.number().int().positive(),
});

// Patient vitals schema
const patientVitalsSchema = z.object({
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  bloodPressureSystolic: z.number().int().min(70).max(250).optional(),
  bloodPressureDiastolic: z.number().int().min(40).max(150).optional(),
  heartRate: z.number().int().min(30).max(220).optional(),
  temperature: z.number().min(35.0).max(42.0).optional(),
  respiratoryRate: z.number().int().min(8).max(50).optional(),
  oxygenSaturation: z.number().int().min(70).max(100).optional(),
  recordedBy: z.number().int().positive(),
});

// Registration audit schema
const registrationAuditSchema = z.object({
  patientId: z.number().int().positive().optional(),
  action: z.string().min(1),
  staffId: z.number().int().positive(),
  staffName: z.string().min(1),
  details: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

const doctorSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  specialty: z.string().min(2).max(100),
  contactInfo: z.string().optional(),
});

const encounterSchema = z.object({
  patientId: z.number().int().positive(),
  doctorId: z.number().int().positive(),
  visitDate: z.string(),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

const diagnosisSchema = z.object({
  encounterId: z.number().int().positive(),
  summary: z.string().min(3),
  details: z.string().optional(),
});

const labOrderSchema = z.object({
  encounterId: z.number().int().positive(),
  testType: z.string().min(3),
});

const labUpdateSchema = z.object({
  status: z.enum(['requested', 'in_progress', 'completed', 'cancelled']),
  results: z.string().optional(),
  completedAt: z.string().optional(),
});

const prescriptionSchema = z.object({
  encounterId: z.number().int().positive(),
  medication: z.string().min(1),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
  duration: z.string().optional(),
  instructions: z.string().optional(),
});

const admissionSchema = z.object({
  patientId: z.number().int().positive(),
  encounterId: z.number().int().positive().optional(),
  bedId: z.number().int().positive(),
  notes: z.string().optional(),
});

const dischargeSchema = z.object({
  admissionId: z.number().int().positive(),
  notes: z.string().optional(),
});

// Doctor discharge schema for new discharge process
const doctorDischargeSchema = z.object({
  patientId: z.number().int().positive(),
  admissionId: z.number().int().positive(),
  dischargeNotes: z.string().min(1).max(2000),
});

// Billing schema for calculating patient bill
const billingSchema = z.object({
  dischargeId: z.number().int().positive(),
  subtotal: z.number().min(0),
  discountPercentage: z.number().min(0).max(100).optional().default(0),
});

// Payment schema for processing payment
const paymentSchema = z.object({
  billingId: z.number().int().positive(),
  paymentAmount: z.number().min(0.01),
  paymentMethod: z.enum(['cash', 'card', 'check', 'insurance']),
  notes: z.string().optional(),
});

module.exports = {
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
};
