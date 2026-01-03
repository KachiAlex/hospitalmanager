# Bed Management and Patient Admission System Design

## Overview

The Bed Management and Patient Admission System provides comprehensive functionality for managing hospital bed inventory, processing patient admission requests, and coordinating the workflow from doctor recommendations to bed assignments. The system integrates with existing patient records and provides real-time bed availability tracking with role-based access for doctors and administrators.

## Architecture

The system follows a layered architecture that integrates seamlessly with the existing T-Happy Hospital Management System:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                           │
├─────────────────────────────────────────────────────────────┤
│ Doctor Interface                │ Administrator Interface   │
│ ├── AdmissionRecommendation     │ ├── BedManagementDashboard│
│ ├── PatientSearch              │ ├── AdmissionRequestQueue │
│ └── RecommendationHistory      │ ├── BedInventoryManager   │
│                                │ ├── BedAssignmentInterface│
│                                │ └── WardManagementPanel   │
├─────────────────────────────────────────────────────────────┤
│                    API Layer                               │
├─────────────────────────────────────────────────────────────┤
│ Admission Management APIs       │ Bed Management APIs       │
│ ├── POST /api/admissions        │ ├── GET /api/beds         │
│ ├── GET /api/admissions         │ ├── PUT /api/beds/:id     │
│ ├── PUT /api/admissions/:id     │ ├── GET /api/wards        │
│ └── POST /api/notifications     │ └── GET /api/bed-availability│
├─────────────────────────────────────────────────────────────┤
│                    Business Logic Layer                    │
├─────────────────────────────────────────────────────────────┤
│ ├── AdmissionWorkflowManager                               │
│ ├── BedAllocationEngine                                    │
│ ├── NotificationService                                    │
│ └── ReportingEngine                                        │
├─────────────────────────────────────────────────────────────┤
│                    Data Layer                              │
├─────────────────────────────────────────────────────────────┤
│ ├── admission_requests         │ ├── beds                  │
│ ├── bed_assignments           │ ├── wards                 │
│ ├── admission_notifications   │ ├── rooms                 │
│ └── admission_audit           │ └── bed_status_history    │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Frontend Components

#### Doctor Interface Components

**AdmissionRecommendationForm**
```typescript
interface AdmissionRecommendationFormProps {
  patientId?: string;
  onSubmit: (recommendation: AdmissionRecommendation) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

interface AdmissionRecommendation {
  patientId: string;
  doctorId: string;
  admissionReason: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  careType: 'general' | 'icu' | 'surgery' | 'maternity' | 'pediatric';
  estimatedStay: number; // days
  specialRequirements?: string;
  medicalNotes: string;
}
```

**PatientSearchForAdmission**
```typescript
interface PatientSearchProps {
  onPatientSelect: (patient: Patient) => void;
  searchFilters?: PatientSearchFilters;
}
```

#### Administrator Interface Components

**BedManagementDashboard**
```typescript
interface BedManagementDashboardProps {
  adminId: string;
  onBedAssignment: (assignment: BedAssignment) => void;
  onBedStatusUpdate: (bedId: string, status: BedStatus) => void;
}

interface BedManagementState {
  pendingAdmissions: AdmissionRequest[];
  availableBeds: Bed[];
  wardOccupancy: WardOccupancy[];
  notifications: AdmissionNotification[];
}
```

**AdmissionRequestQueue**
```typescript
interface AdmissionRequestQueueProps {
  requests: AdmissionRequest[];
  onProcessRequest: (requestId: string, action: 'approve' | 'defer' | 'reject') => void;
  onAssignBed: (requestId: string, bedId: string) => void;
  sortBy: 'urgency' | 'date' | 'ward';
  filterBy: AdmissionRequestFilters;
}
```

**BedInventoryManager**
```typescript
interface BedInventoryManagerProps {
  beds: Bed[];
  wards: Ward[];
  onBedUpdate: (bedId: string, updates: Partial<Bed>) => void;
  onWardUpdate: (wardId: string, updates: Partial<Ward>) => void;
}
```

### Backend API Endpoints

#### Admission Management APIs

**Create Admission Recommendation**
```typescript
POST /api/admissions/recommendations
{
  patientId: string;
  doctorId: string;
  admissionReason: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  careType: string;
  estimatedStay: number;
  specialRequirements?: string;
  medicalNotes: string;
}

Response: {
  recommendationId: string;
  status: 'pending';
  createdAt: string;
  notificationsSent: string[];
}
```

**Get Admission Requests**
```typescript
GET /api/admissions/requests?status=pending&urgency=high&ward=icu

Response: {
  requests: AdmissionRequest[];
  totalCount: number;
  filters: AppliedFilters;
}
```

**Process Admission Request**
```typescript
PUT /api/admissions/requests/:id
{
  action: 'approve' | 'defer' | 'reject';
  adminId: string;
  notes?: string;
  deferReason?: string;
  rejectionReason?: string;
}
```

**Assign Bed to Patient**
```typescript
POST /api/admissions/bed-assignments
{
  admissionRequestId: string;
  bedId: string;
  adminId: string;
  admissionDate: string;
  expectedDischarge?: string;
}

Response: {
  assignmentId: string;
  patientId: string;
  bedId: string;
  admissionNumber: string;
  status: 'admitted';
}
```

#### Bed Management APIs

**Get Bed Availability**
```typescript
GET /api/beds/availability?ward=icu&bedType=private&includeReserved=false

Response: {
  availableBeds: Bed[];
  occupancyRates: WardOccupancy[];
  totalCapacity: number;
  availableCapacity: number;
}
```

**Update Bed Status**
```typescript
PUT /api/beds/:id/status
{
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning' | 'reserved';
  adminId: string;
  notes?: string;
  maintenanceSchedule?: MaintenanceSchedule;
}
```

**Get Ward Information**
```typescript
GET /api/wards/:id

Response: {
  ward: Ward;
  rooms: Room[];
  beds: Bed[];
  currentOccupancy: number;
  capacity: number;
  occupancyRate: number;
}
```

## Data Models

### Admission Request Table
```sql
CREATE TABLE admission_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_id INT NOT NULL,
  doctor_id VARCHAR(50) NOT NULL,
  admission_reason TEXT NOT NULL,
  urgency_level ENUM('low', 'medium', 'high', 'emergency') NOT NULL,
  care_type VARCHAR(50) NOT NULL,
  estimated_stay INT NOT NULL,
  special_requirements TEXT,
  medical_notes TEXT,
  status ENUM('pending', 'approved', 'assigned', 'completed', 'deferred', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL,
  processed_by VARCHAR(50),
  processing_notes TEXT,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  INDEX idx_status_urgency (status, urgency_level),
  INDEX idx_doctor_date (doctor_id, created_at),
  INDEX idx_patient (patient_id)
);
```

### Beds Table
```sql
CREATE TABLE beds (
  id INT PRIMARY KEY AUTO_INCREMENT,
  bed_number VARCHAR(20) NOT NULL UNIQUE,
  room_id INT NOT NULL,
  bed_type ENUM('general', 'icu', 'private', 'semi-private', 'isolation') NOT NULL,
  status ENUM('available', 'occupied', 'maintenance', 'cleaning', 'reserved') DEFAULT 'available',
  equipment_level ENUM('basic', 'standard', 'advanced') DEFAULT 'standard',
  last_cleaned TIMESTAMP NULL,
  maintenance_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  INDEX idx_status_type (status, bed_type),
  INDEX idx_room (room_id)
);
```

### Rooms Table
```sql
CREATE TABLE rooms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  room_number VARCHAR(20) NOT NULL,
  ward_id INT NOT NULL,
  room_type ENUM('single', 'double', 'ward', 'icu', 'isolation') NOT NULL,
  capacity INT NOT NULL,
  amenities JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ward_id) REFERENCES wards(id) ON DELETE CASCADE,
  UNIQUE KEY unique_room_per_ward (ward_id, room_number),
  INDEX idx_ward_type (ward_id, room_type)
);
```

### Wards Table
```sql
CREATE TABLE wards (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ward_name VARCHAR(100) NOT NULL UNIQUE,
  ward_code VARCHAR(10) NOT NULL UNIQUE,
  specialty VARCHAR(100),
  floor_number INT,
  total_capacity INT DEFAULT 0,
  head_nurse VARCHAR(100),
  contact_extension VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_specialty (specialty)
);
```

### Bed Assignments Table
```sql
CREATE TABLE bed_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  admission_request_id INT NOT NULL,
  patient_id INT NOT NULL,
  bed_id INT NOT NULL,
  admission_number VARCHAR(20) NOT NULL UNIQUE,
  assigned_by VARCHAR(50) NOT NULL,
  admission_date TIMESTAMP NOT NULL,
  expected_discharge TIMESTAMP NULL,
  actual_discharge TIMESTAMP NULL,
  status ENUM('active', 'discharged', 'transferred') DEFAULT 'active',
  transfer_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admission_request_id) REFERENCES admission_requests(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (bed_id) REFERENCES beds(id),
  INDEX idx_patient_status (patient_id, status),
  INDEX idx_bed_dates (bed_id, admission_date, actual_discharge),
  INDEX idx_admission_number (admission_number)
);
```

### Admission Notifications Table
```sql
CREATE TABLE admission_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  admission_request_id INT NOT NULL,
  recipient_id VARCHAR(50) NOT NULL,
  recipient_type ENUM('admin', 'nurse', 'doctor') NOT NULL,
  notification_type ENUM('new_request', 'urgent_request', 'bed_assigned', 'status_update') NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  FOREIGN KEY (admission_request_id) REFERENCES admission_requests(id) ON DELETE CASCADE,
  INDEX idx_recipient_unread (recipient_id, is_read),
  INDEX idx_type_date (notification_type, sent_at)
);
```

## Research and Context

### Integration Requirements
- **Patient System Integration**: Seamless integration with existing patient registration and medical records
- **Staff Authentication**: Integration with existing doctor and administrator authentication systems
- **Notification System**: Real-time notifications for admission requests and bed assignments
- **Reporting Integration**: Connection to hospital management reporting and analytics systems

### Workflow Considerations
- **Emergency Admissions**: Priority handling for emergency cases with immediate bed assignment
- **Bed Cleaning Protocols**: Integration with housekeeping schedules and cleaning requirements
- **Discharge Coordination**: Coordination with discharge planning to optimize bed turnover
- **Transfer Management**: Support for patient transfers between beds and wards

### Performance Requirements
- **Real-time Updates**: Immediate reflection of bed status changes across all interfaces
- **Concurrent Access**: Safe handling of simultaneous bed assignments and status updates
- **Scalability**: Support for hospitals with hundreds of beds and multiple wards
- **Response Time**: Sub-second response times for bed availability queries
## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

After analyzing the acceptance criteria, the following properties have been identified to ensure system correctness:

### Doctor Admission Recommendation Properties

**Property 1: Admission Recommendation Creation**
*For any* valid patient ID and doctor credentials, creating an admission recommendation should succeed and generate a unique recommendation ID with proper timestamps
**Validates: Requirements 1.1, 1.5**

**Property 2: Required Field Validation**
*For any* admission recommendation submission, all required fields (admission reason, urgency level, care type) must be present or the submission should be rejected with clear validation errors
**Validates: Requirements 1.2**

**Property 3: Patient Existence Validation**
*For any* admission recommendation request, the system should verify patient existence before creating the recommendation and reject requests for non-existent patients
**Validates: Requirements 1.4**

**Property 4: Automatic Notification Trigger**
*For any* successfully created admission recommendation, administrator notifications should be sent immediately and delivery should be confirmed
**Validates: Requirements 1.6, 2.1**

### Administrator Notification Properties

**Property 5: Real-Time Dashboard Updates**
*For any* new admission request, the administrator dashboard should display the request immediately without requiring manual refresh
**Validates: Requirements 2.2**

**Property 6: Complete Request Information Display**
*For any* admission request displayed to administrators, all required information (patient details, doctor recommendation, urgency level) should be present and accurate
**Validates: Requirements 2.3**

**Property 7: Filtering and Sorting Accuracy**
*For any* filter or sort criteria applied to admission requests, the results should contain only requests matching the criteria and be ordered correctly
**Validates: Requirements 2.4**

**Property 8: Priority Queue Management**
*For any* set of pending admission requests, the queue should maintain proper priority ordering based on urgency level and creation time
**Validates: Requirements 2.5**

### Bed Inventory Management Properties

**Property 9: Unique Bed Identification**
*For any* bed in the hospital inventory, the bed identifier should be unique and the inventory should be complete without missing beds
**Validates: Requirements 3.1**

**Property 10: Bed Status Consistency**
*For any* bed status update, the new status should be immediately reflected across all system interfaces and remain consistent
**Validates: Requirements 3.2, 3.5**

**Property 11: Hierarchical Bed Organization**
*For any* bed in the system, it should be properly organized within a room, which belongs to a ward, maintaining referential integrity
**Validates: Requirements 3.3, 5.1**

**Property 12: Double-Booking Prevention**
*For any* concurrent bed assignment attempts, only one assignment should succeed and the bed status should prevent conflicts
**Validates: Requirements 3.6, 7.6**

### Bed Assignment Properties

**Property 13: Requirement Matching**
*For any* admission request processing, only beds that match the patient's care type and special requirements should be displayed as available options
**Validates: Requirements 4.1**

**Property 14: Assignment Validation**
*For any* bed assignment attempt, the system should validate bed availability immediately before confirmation and reject assignments to unavailable beds
**Validates: Requirements 4.3**

**Property 15: Status Update Cascade**
*For any* confirmed bed assignment, the bed status should update to occupied, patient status should update to admitted, and relevant notifications should be sent
**Validates: Requirements 4.4, 4.6**

**Property 16: Complete Record Creation**
*For any* bed assignment, all admission details (bed ID, admission date, administrator ID) should be properly recorded with unique admission numbers
**Validates: Requirements 4.5**

### Ward and Room Management Properties

**Property 17: Capacity Limit Enforcement**
*For any* room, the number of occupied beds should never exceed the room's defined capacity limit
**Validates: Requirements 5.6**

**Property 18: Occupancy Rate Accuracy**
*For any* ward, the calculated occupancy rate should accurately reflect the ratio of occupied beds to total capacity
**Validates: Requirements 5.3**

**Property 19: Bed Type Support**
*For any* supported bed type (general, ICU, maternity, pediatric, isolation), the system should properly handle assignments and filtering for that type
**Validates: Requirements 5.4**

**Property 20: Filtering Accuracy**
*For any* bed filtering criteria (ward, specialty, bed type), the results should contain only beds matching all specified criteria
**Validates: Requirements 5.5**

### Admission Processing Properties

**Property 21: Emergency Priority Processing**
*For any* admission request marked as emergency, it should be processed with higher priority than non-emergency requests in the queue
**Validates: Requirements 6.6**

**Property 22: Patient Information Integration**
*For any* admission processing, complete patient medical history and current condition should be available and accurately displayed
**Validates: Requirements 6.2**

**Property 23: Approval Workflow Integrity**
*For any* admission request approval or deferral, the action should be properly recorded with administrator ID, timestamp, and reason
**Validates: Requirements 6.3**

**Property 24: Document Generation Completeness**
*For any* completed admission, generated documentation should include all required information (bed assignment, care instructions, admission details)
**Validates: Requirements 6.4**

### Real-Time Tracking Properties

**Property 25: Immediate Availability Updates**
*For any* bed status change, the availability information should be updated immediately across all system interfaces and user sessions
**Validates: Requirements 7.1, 7.2**

**Property 26: Accurate Bed Count Maintenance**
*For any* point in time, the total count of available beds should equal the sum of beds with 'available' status across all wards
**Validates: Requirements 7.4**

**Property 27: Discharge Prediction Accuracy**
*For any* bed with an estimated discharge time, the prediction should be based on current patient data and updated when discharge information changes
**Validates: Requirements 7.3**

### Workflow Management Properties

**Property 28: State Transition Validation**
*For any* admission request state change, the transition should be valid according to the defined workflow and only performed by authorized personnel
**Validates: Requirements 8.1, 8.3**

**Property 29: Progress Tracking Completeness**
*For any* admission request, the progress tracking should accurately reflect the current state and provide complete status history
**Validates: Requirements 8.2**

**Property 30: Audit Trail Integrity**
*For any* workflow action, a complete audit record should be created with user ID, timestamp, action type, and relevant details
**Validates: Requirements 8.4**

### Integration Properties

**Property 31: Patient Record Synchronization**
*For any* admission or discharge, patient status and location information should be immediately synchronized across all integrated systems
**Validates: Requirements 9.2**

**Property 32: Referential Integrity Maintenance**
*For any* admission record, referential integrity should be maintained between patients, admission requests, bed assignments, and related records
**Validates: Requirements 9.5**

**Property 33: Transfer Documentation Completeness**
*For any* patient transfer between beds or wards, complete documentation should be created including transfer reason, timestamps, and authorization
**Validates: Requirements 9.6**

### Reporting and Analytics Properties

**Property 34: Report Data Accuracy**
*For any* generated bed occupancy report, the data should accurately reflect the actual bed status and occupancy during the specified time period
**Validates: Requirements 10.1**

**Property 35: Statistical Calculation Correctness**
*For any* admission statistics (average length of stay, processing times), the calculations should be mathematically correct based on historical data
**Validates: Requirements 10.2**

**Property 36: Alert Threshold Monitoring**
*For any* occupancy rate that exceeds defined thresholds, appropriate alerts should be generated and delivered to relevant personnel
**Validates: Requirements 10.5**

## Error Handling

The bed management and admission system implements comprehensive error handling across all layers:

### Frontend Error Handling
- Form validation with real-time feedback for admission recommendations
- Network request failures with retry mechanisms for bed assignments
- Concurrent access conflicts with user-friendly resolution options
- Invalid bed assignment attempts with clear error messages

### Backend Error Handling
- Bed availability validation with race condition prevention
- Database transaction rollback for failed multi-table operations
- Notification service failures with queuing and retry mechanisms
- Authentication and authorization errors with proper access control

### Database Error Handling
- Referential integrity violations with meaningful error messages
- Concurrent bed assignment conflicts with proper locking mechanisms
- Data consistency validation across admission workflow states
- Audit trail maintenance even during error conditions

## Testing Strategy

The testing strategy employs both unit tests and property-based tests to ensure comprehensive coverage:

### Unit Testing
- Component rendering and interaction tests for admission forms
- API endpoint functionality tests for bed management operations
- Database operation tests for bed assignments and status updates
- Integration tests for notification and workflow systems
- Authentication and authorization tests for role-based access

### Property-Based Testing
- Use **fast-check** library for TypeScript/JavaScript property-based testing
- Each property test runs minimum 100 iterations
- Property tests validate universal correctness properties
- Each test references its corresponding design property

**Property Test Configuration:**
```typescript
// Example property test structure
describe('Feature: bed-management-admission, Property 12: Double-Booking Prevention', () => {
  it('should prevent concurrent bed assignments to the same bed', () => {
    fc.assert(fc.property(
      bedAssignmentGenerator,
      (assignments) => {
        // Test concurrent bed assignments
        const results = assignments.map(assignment => 
          assignBedConcurrently(assignment.bedId, assignment.patientId)
        );
        const successfulAssignments = results.filter(r => r.success);
        expect(successfulAssignments).toHaveLength(1);
      }
    ), { numRuns: 100 });
  });
});
```

### Testing Focus Areas
- **Admission Workflow Tests**: Verify complete workflow from doctor recommendation to bed assignment
- **Concurrency Tests**: Ensure safe handling of simultaneous bed assignments and status updates
- **Integration Tests**: Validate integration with patient records and notification systems
- **Performance Tests**: Ensure system handles high volumes of admission requests and bed operations
- **Security Tests**: Validate role-based access control and audit trail integrity
- **Real-time Tests**: Verify immediate updates across all connected interfaces

The dual testing approach ensures both specific functionality (unit tests) and universal correctness (property tests) are validated, providing comprehensive confidence in the bed management and admission system's reliability and correctness.