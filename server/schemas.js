const { z } = require('zod');

const nameSchema = z.string().min(1).max(100);

const patientSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  gender: z.enum(['male', 'female', 'other']),
  dateOfBirth: z.string(),
  contactInfo: z.string().optional(),
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

module.exports = {
  patientSchema,
  doctorSchema,
  encounterSchema,
  diagnosisSchema,
  labOrderSchema,
  labUpdateSchema,
  prescriptionSchema,
  admissionSchema,
  dischargeSchema,
};
