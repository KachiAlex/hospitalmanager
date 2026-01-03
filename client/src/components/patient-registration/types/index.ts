// Patient Registration System - Core Type Definitions
// Comprehensive TypeScript interfaces for patient registration functionality

export interface Patient {
  id: string;
  accountType: 'personal' | 'family';
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  nextOfKin: NextOfKin[];
  vitals?: VitalSigns;
  familyMembers?: FamilyMember[];
  createdAt: Date;
  createdBy: string;
  recordNumber: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
}

export interface ContactInfo {
  email: string;
  phoneNumber: string;
  address: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface NextOfKin {
  id: string;
  fullName: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
  isPrimary: boolean;
}

export interface VitalSigns {
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  heartRate: number;
  temperature: number;
  weight: number;
  height: number;
  recordedAt: Date;
  recordedBy: string;
}

export interface FamilyMember {
  id: string;
  personalInfo: PersonalInfo;
  relationshipToPrimary: string;
  isAccountHolder: boolean;
}

// Form Data Types
export interface PersonalAccountData {
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  nextOfKin: NextOfKin[];
}

export interface FamilyAccountData {
  primaryContact: PersonalInfo & ContactInfo;
  familyMembers: FamilyMember[];
  sharedContactInfo?: Partial<ContactInfo>;
}

// Validation Types
export interface ValidationErrors {
  [fieldName: string]: string[];
}

export interface ValidationRules {
  email: RegExp;
  phoneNumber: RegExp;
  postalCode: RegExp;
  vitalRanges: {
    bloodPressure: { systolic: { min: number; max: number }; diastolic: { min: number; max: number } };
    heartRate: { min: number; max: number };
    temperature: { min: number; max: number };
    weight: { min: number; max: number };
    height: { min: number; max: number };
  };
}

// API Request/Response Types
export interface CreatePatientRequest {
  accountType: 'personal' | 'family';
  personalInfo: PersonalInfo;
  nextOfKin?: NextOfKin;
  familyMembers?: FamilyMember[];
  createdBy: string;
}

export interface CreatePatientResponse {
  patient: Patient;
  nextOfKin?: NextOfKin;
  familyMembers?: FamilyMember[];
  message: string;
}

export interface RecordVitalsRequest {
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  recordedBy: string;
  recordedAt?: string;
}

export interface DuplicateCheckRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
}

export interface DuplicateCheckResponse {
  isDuplicate: boolean;
  potentialMatches: Patient[];
}

// Component Props Types
export interface PatientRegistrationContainerProps {
  currentUser: StaffUser;
  onRegistrationComplete: (patient: Patient) => void;
  onCancel: () => void;
}

export interface AccountTypeSelectorProps {
  onAccountTypeSelect: (type: 'personal' | 'family') => void;
  selectedType?: 'personal' | 'family';
}

export interface PersonalRegistrationFormProps {
  onSubmit: (data: PersonalAccountData) => void;
  initialData?: Partial<PersonalAccountData>;
  validationErrors?: ValidationErrors;
}

export interface FamilyRegistrationFormProps {
  onSubmit: (data: FamilyAccountData) => void;
  initialData?: Partial<FamilyAccountData>;
  validationErrors?: ValidationErrors;
}

export interface VitalsRecordingComponentProps {
  patientId: string;
  onVitalsRecorded: (vitals: VitalSigns) => void;
  isRequired?: boolean;
}

// Staff User Type (from existing system)
export interface StaffUser {
  id: string;
  name: string;
  role: 'admin' | 'receptionist' | 'doctor' | 'nurse';
  title: string;
  department?: string;
}

// Registration State Types
export interface RegistrationState {
  currentStep: number;
  accountType?: 'personal' | 'family';
  formData: Partial<PersonalAccountData | FamilyAccountData>;
  validationErrors: ValidationErrors;
  isSubmitting: boolean;
  autoSaveData?: any;
}

// Audit Log Types
export interface RegistrationAuditLog {
  id: string;
  patientId: string;
  action: string;
  staffId: string;
  details: string;
  timestamp: Date;
}