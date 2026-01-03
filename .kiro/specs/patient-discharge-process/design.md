# Patient Discharge Process - Design Document

## Overview

The Patient Discharge Process is a multi-stage workflow that manages the complete discharge of patients from the hospital. The process involves three key roles (Doctor, Admin-Billing, Admin-Bed Management) and ensures proper medical authorization, financial settlement, and resource management. The system uses atomic transactions to maintain data consistency and provides comprehensive audit logging for compliance.

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ DoctorDashboard                                      │   │
│  │  ├─ PatientList (admitted patients)                  │   │
│  │  ├─ DischargeForm (medical discharge)                │   │
│  │  └─ DischargeConfirmation                            │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ AdminDashboard                                       │   │
│  │  ├─ BillingModule (calculate charges)                │   │
│  │  ├─ PaymentModule (process payment)                  │   │
│  │  ├─ BedManagementModule (release bed)                │   │
│  │  └─ DischargeAudit (view audit trail)                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  API Gateway & Middleware                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ requireAuth (Role-Based Access Control)              │   │
│  │  ├─ Verify doctor role for discharge                 │   │
│  │  ├─ Verify admin role for billing/payment            │   │
│  │  └─ Verify admin role for bed management             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Backend API (Node.js)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Discharge Endpoints                                  │   │
│  │  ├─ POST /discharge (doctor discharge)               │   │
│  │  ├─ GET /discharge/:id (get discharge record)        │   │
│  │  ├─ POST /billing (calculate bill)                   │   │
│  │  ├─ POST /payment (process payment)                  │   │
│  │  ├─ POST /bed-release (release bed)                  │   │
│  │  └─ GET /discharge-audit (audit trail)               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Database (SQLite)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Core Tables                                          │   │
│  │  ├─ discharge_records                                │   │
│  │  ├─ billing_records                                  │   │
│  │  ├─ billing_items                                    │   │
│  │  ├─ payment_records                                  │   │
│  │  ├─ bed_releases                                     │   │
│  │  └─ discharge_audit                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Frontend Components

#### DoctorDashboard
**Purpose:** Provide interface for doctors to discharge patients

**Props:**
- `doctorId`: string (required)
- `onDischargeComplete`: callback

**State:**
- `admittedPatients`: array of patients
- `selectedPatient`: patient object
- `dischargeNotes`: string
- `isSubmitting`: boolean
- `error`: string

**Features:**
- List of currently admitted patients
- Patient search and filter
- Discharge form with medical notes
- Confirmation dialog
- Success/error notifications

#### BillingModule
**Purpose:** Calculate and manage patient billing

**Props:**
- `dischargeId`: string (required)
- `onBillingComplete`: callback

**State:**
- `billableItems`: array of charges
- `totalAmount`: number
- `discounts`: number
- `finalAmount`: number
- `isCalculating`: boolean

**Features:**
- Retrieve billable items for patient stay
- Display itemized charges
- Apply discounts
- Calculate total bill
- Generate billing record

#### PaymentModule
**Purpose:** Process payment for patient bill

**Props:**
- `billingId`: string (required)
- `onPaymentComplete`: callback

**State:**
- `billAmount`: number
- `paymentAmount`: number
- `paymentMethod`: string
- `paymentStatus`: string
- `isProcessing`: boolean

**Features:**
- Display bill amount
- Accept payment amount
- Select payment method
- Process payment
- Record payment status

#### BedManagementModule
**Purpose:** Release bed and confirm availability

**Props:**
- `bedId`: string (required)
- `patientId`: string (required)
- `onBedReleased`: callback

**State:**
- `bedStatus`: string
- `releaseConfirmed`: boolean
- `isReleasing`: boolean

**Features:**
- Verify discharge and payment complete
- Confirm bed release
- Update bed status
- Log bed release action

### Backend API Endpoints

#### 1. POST /discharge - Doctor Discharge
**Authentication:** Required (doctor role)

**Request Body:**
```json
{
  "patientId": "integer (required)",
  "doctorId": "integer (required)",
  "dischargeNotes": "string (optional)",
  "dischargeDate": "string (YYYY-MM-DD, optional - defaults to today)"
}
```

**Response (201 Created):**
```json
{
  "dischargeId": "integer",
  "patientId": "integer",
  "doctorId": "integer",
  "status": "medical_discharge_complete",
  "dischargeDate": "timestamp",
  "createdAt": "timestamp"
}
```

#### 2. GET /discharge/:id - Get Discharge Record
**Authentication:** Required

**Response (200 OK):**
```json
{
  "dischargeId": "integer",
  "patientId": "integer",
  "patientName": "string",
  "doctorId": "integer",
  "doctorName": "string",
  "status": "string",
  "dischargeDate": "timestamp",
  "dischargeNotes": "string",
  "billing": { ... },
  "payment": { ... },
  "bedRelease": { ... }
}
```

#### 3. POST /billing - Calculate Bill
**Authentication:** Required (admin role)

**Request Body:**
```json
{
  "dischargeId": "integer (required)",
  "patientId": "integer (required)",
  "discountPercentage": "number (optional, 0-100)",
  "discountAmount": "number (optional)"
}
```

**Response (201 Created):**
```json
{
  "billingId": "integer",
  "dischargeId": "integer",
  "patientId": "integer",
  "billableItems": [
    {
      "itemId": "integer",
      "description": "string",
      "amount": "number"
    }
  ],
  "subtotal": "number",
  "discount": "number",
  "totalAmount": "number",
  "status": "billing_complete",
  "createdAt": "timestamp"
}
```

#### 4. POST /payment - Process Payment
**Authentication:** Required (admin role)

**Request Body:**
```json
{
  "billingId": "integer (required)",
  "paymentAmount": "number (required)",
  "paymentMethod": "string (required, enum: cash/card/check/insurance)",
  "adminId": "integer (required)",
  "notes": "string (optional)"
}
```

**Response (201 Created):**
```json
{
  "paymentId": "integer",
  "billingId": "integer",
  "paymentAmount": "number",
  "paymentMethod": "string",
  "paymentStatus": "complete|partial",
  "remainingBalance": "number",
  "createdAt": "timestamp"
}
```

#### 5. POST /bed-release - Release Bed
**Authentication:** Required (admin role)

**Request Body:**
```json
{
  "bedId": "integer (required)",
  "patientId": "integer (required)",
  "dischargeId": "integer (required)",
  "adminId": "integer (required)"
}
```

**Response (201 Created):**
```json
{
  "releaseId": "integer",
  "bedId": "integer",
  "patientId": "integer",
  "status": "available",
  "releaseDate": "timestamp",
  "createdAt": "timestamp"
}
```

#### 6. GET /discharge-audit - Get Audit Trail
**Authentication:** Required

**Query Parameters:**
- `dischargeId`: integer (optional)
- `patientId`: integer (optional)
- `action`: string (optional)
- `limit`: integer (optional, default: 100)

**Response (200 OK):**
```json
{
  "auditEntries": [
    {
      "id": "integer",
      "dischargeId": "integer",
      "action": "string",
      "staffId": "integer",
      "staffName": "string",
      "details": "string",
      "timestamp": "timestamp"
    }
  ],
  "total": "integer"
}
```

## Data Models

### Discharge Record
```sql
CREATE TABLE discharge_records (
  id INTEGER PRIMARY KEY,
  patient_id INTEGER NOT NULL,
  doctor_id INTEGER NOT NULL,
  admission_id INTEGER,
  status TEXT DEFAULT 'medical_discharge_pending',
  discharge_date TIMESTAMP,
  discharge_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id),
  FOREIGN KEY (admission_id) REFERENCES admissions(id)
);
```

### Billing Record
```sql
CREATE TABLE billing_records (
  id INTEGER PRIMARY KEY,
  discharge_id INTEGER NOT NULL,
  patient_id INTEGER NOT NULL,
  subtotal REAL NOT NULL,
  discount_percentage REAL DEFAULT 0,
  discount_amount REAL DEFAULT 0,
  total_amount REAL NOT NULL,
  status TEXT DEFAULT 'billing_complete',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (discharge_id) REFERENCES discharge_records(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);
```

### Billing Items
```sql
CREATE TABLE billing_items (
  id INTEGER PRIMARY KEY,
  billing_id INTEGER NOT NULL,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  quantity INTEGER DEFAULT 1,
  item_type TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (billing_id) REFERENCES billing_records(id)
);
```

### Payment Record
```sql
CREATE TABLE payment_records (
  id INTEGER PRIMARY KEY,
  billing_id INTEGER NOT NULL,
  payment_amount REAL NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'complete',
  remaining_balance REAL DEFAULT 0,
  admin_id INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (billing_id) REFERENCES billing_records(id)
);
```

### Bed Release
```sql
CREATE TABLE bed_releases (
  id INTEGER PRIMARY KEY,
  discharge_id INTEGER NOT NULL,
  bed_id INTEGER NOT NULL,
  patient_id INTEGER NOT NULL,
  status TEXT DEFAULT 'available',
  release_date TIMESTAMP,
  admin_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (discharge_id) REFERENCES discharge_records(id),
  FOREIGN KEY (bed_id) REFERENCES beds(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);
```

### Discharge Audit
```sql
CREATE TABLE discharge_audit (
  id INTEGER PRIMARY KEY,
  discharge_id INTEGER,
  action TEXT NOT NULL,
  staff_id INTEGER NOT NULL,
  staff_name TEXT NOT NULL,
  staff_role TEXT,
  details TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (discharge_id) REFERENCES discharge_records(id)
);
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Doctor Discharge Authorization
**For any** discharge request, if the user is not a doctor, the system SHALL reject the request with 403 Forbidden.
**Validates: Requirements 6.1, 6.4**

### Property 2: Discharge Status Progression
**For any** discharge, the status SHALL progress through states in order: medical_discharge_pending → medical_discharge_complete → billing_complete → payment_complete → discharge_complete.
**Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**

### Property 3: Billing Calculation Accuracy
**For any** billing calculation, the total amount SHALL equal the sum of all billable items minus discounts, and all amounts SHALL be non-negative.
**Validates: Requirements 2.2, 2.3, 2.4, 8.4**

### Property 4: Payment Amount Validation
**For any** payment, the payment amount SHALL be positive and the remaining balance SHALL equal (bill total - payment amount).
**Validates: Requirements 3.2, 3.3, 3.5, 8.4**

### Property 5: Bed Release Verification
**For any** bed release, the bed SHALL be marked as available only after discharge is complete and payment is processed.
**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

### Property 6: Atomic Transaction Consistency
**For any** discharge operation, if any step fails, all changes SHALL be rolled back and the discharge status SHALL remain unchanged.
**Validates: Requirements 8.1, 8.2, 8.3**

### Property 7: Audit Trail Completeness
**For any** discharge action, an audit entry SHALL be created with staff identification, timestamp, and action details.
**Validates: Requirements 5.5, 6.5, 6.6, 6.7**

### Property 8: Patient Admission Verification
**For any** discharge request, the patient SHALL have an active admission record, otherwise the request SHALL be rejected.
**Validates: Requirements 1.6, 8.5**

### Property 9: Billing Item Linkage
**For any** billing record, all billable items SHALL be properly linked to the patient's stay period.
**Validates: Requirements 2.1, 8.3, 8.6**

### Property 10: Discharge Record Completeness
**For any** completed discharge, the discharge record SHALL include patient info, doctor info, billing info, payment status, and bed release confirmation.
**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

## Error Handling

### Error Response Format
```json
{
  "status": "integer (HTTP status code)",
  "message": "string (error description)",
  "code": "string (error code)",
  "details": "string (optional, additional context)"
}
```

### Common Error Scenarios

1. **Patient Not Found (404)**
   - Discharge initiated for non-existent patient
   - Response: `{ "status": 404, "message": "Patient not found", "code": "PATIENT_NOT_FOUND" }`

2. **Patient Not Admitted (409)**
   - Discharge initiated for patient without active admission
   - Response: `{ "status": 409, "message": "Patient is not currently admitted", "code": "PATIENT_NOT_ADMITTED" }`

3. **Already Discharged (409)**
   - Discharge initiated for already discharged patient
   - Response: `{ "status": 409, "message": "Patient has already been discharged", "code": "ALREADY_DISCHARGED" }`

4. **Unauthorized (401/403)**
   - User lacks required authorization
   - Response: `{ "status": 403, "message": "Insufficient permissions", "code": "UNAUTHORIZED" }`

5. **Invalid Payment Amount (400)**
   - Payment amount is negative or zero
   - Response: `{ "status": 400, "message": "Payment amount must be positive", "code": "INVALID_PAYMENT_AMOUNT" }`

6. **Bed Not Available (409)**
   - Bed is not currently occupied by patient
   - Response: `{ "status": 409, "message": "Bed is not occupied by this patient", "code": "BED_NOT_OCCUPIED" }`

## Testing Strategy

### Unit Tests
- Test discharge authorization for different user roles
- Test billing calculation with various discount scenarios
- Test payment processing with different payment methods
- Test bed release verification
- Test error handling for invalid inputs
- Test audit trail creation

### Property-Based Tests
- Property 1: Doctor Discharge Authorization (20 iterations)
- Property 2: Discharge Status Progression (25 iterations)
- Property 3: Billing Calculation Accuracy (20 iterations)
- Property 4: Payment Amount Validation (20 iterations)
- Property 5: Bed Release Verification (20 iterations)
- Property 6: Atomic Transaction Consistency (15 iterations)
- Property 7: Audit Trail Completeness (20 iterations)
- Property 8: Patient Admission Verification (20 iterations)
- Property 9: Billing Item Linkage (20 iterations)
- Property 10: Discharge Record Completeness (20 iterations)

### Integration Tests
- Complete discharge workflow from doctor discharge to bed release
- Multi-user concurrent discharge operations
- Error recovery and rollback scenarios
- Audit trail verification across all operations

## Performance Considerations

### Database Indexes
- `discharge_records(patient_id)` - Patient discharge lookup
- `discharge_records(doctor_id)` - Doctor discharge lookup
- `discharge_records(status)` - Status filtering
- `billing_records(discharge_id)` - Billing lookup
- `payment_records(billing_id)` - Payment lookup
- `bed_releases(bed_id)` - Bed release lookup
- `discharge_audit(discharge_id)` - Audit trail lookup
- `discharge_audit(staff_id)` - Staff activity lookup

### Query Optimization
- Use indexes for common queries
- Batch billing item retrieval
- Cache discharge status lookups
- Optimize audit trail queries with date ranges

## Security Considerations

### Authentication
- Verify user role for each operation
- Require doctor role for discharge
- Require admin role for billing and payment
- Require admin role for bed management

### Authorization
- Check user permissions before operation
- Verify staff identification for audit logging
- Validate user has access to patient data

### Data Protection
- Encrypt sensitive payment information
- Audit all financial transactions
- Maintain complete audit trail
- Validate all input data

## Deployment Considerations

### Database Migration
- Create new tables for discharge process
- Add indexes for performance
- Migrate existing discharge data if applicable

### API Deployment
- Deploy new endpoints with proper authentication
- Configure role-based access control
- Set up audit logging
- Configure error handling

### Frontend Deployment
- Deploy new React components
- Update dashboards with discharge functionality
- Configure notifications
- Test cross-browser compatibility
