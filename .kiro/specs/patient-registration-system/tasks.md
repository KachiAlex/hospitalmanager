# Implementation Plan: Patient Registration System

## Overview

This implementation plan converts the Patient Registration System design into a series of incremental coding tasks. Each task builds upon previous work to create a comprehensive patient registration flow with support for personal and family accounts, vitals recording, and robust validation.

## Tasks

- [-] 1. Set up project structure and core interfaces
  - Create directory structure for patient registration components
  - Define TypeScript interfaces for Patient, ContactInfo, NextOfKin, VitalSigns
  - Set up validation schemas and error handling types
  - Create base API service methods for patient registration
  - _Requirements: 1.1, 9.1, 12.1_

- [ ]* 1.1 Write property test for patient data model
  - **Property 21: Unique Patient Identifier Generation**
  - **Validates: Requirements 9.1**

- [ ] 2. Implement database schema extensions
  - [ ] 2.1 Create database migration for enhanced patient table
    - Add account_type, middle_name, record_number, created_by columns
    - Create unique index on record_number
    - _Requirements: 9.1, 9.3, 7.3_

  - [ ] 2.2 Create next_of_kin table
    - Implement table with foreign key to patients
    - Add fields for name, relationship, contact info, is_primary flag
    - _Requirements: 5.1, 5.2, 5.3, 5.5_

  - [ ] 2.3 Create family_members table
    - Link family members to primary patient account
    - Store relationship information and account holder status
    - _Requirements: 3.2, 3.4, 3.6_

  - [ ] 2.4 Create patient_vitals table
    - Store vital signs with timestamps and staff attribution
    - Include all required vital measurements
    - _Requirements: 6.2, 6.3, 6.4, 6.6_

  - [ ] 2.5 Create registration_audit table
    - Log all registration activities with staff identification
    - Store action details and timestamps
    - _Requirements: 7.3, 7.5_

- [ ]* 2.6 Write property tests for database operations
  - **Property 22: Patient Data Persistence**
  - **Validates: Requirements 9.2**

- [ ] 3. Implement core validation services
  - [ ] 3.1 Create email validation service
    - Implement RFC-compliant email validation
    - Support real-time validation feedback
    - _Requirements: 2.2, 4.1, 8.3_

  - [ ] 3.2 Create phone number validation service
    - Implement regional phone number format validation
    - Support multiple phone number formats
    - _Requirements: 2.3, 4.2_

  - [ ] 3.3 Create address validation service
    - Validate complete address requirements
    - Ensure all required components are present
    - _Requirements: 2.4, 4.3_

  - [ ] 3.4 Create vitals validation service
    - Implement medical range validation for all vital signs
    - Define acceptable ranges for blood pressure, heart rate, temperature, weight, height
    - _Requirements: 6.5_

- [ ]* 3.5 Write property tests for validation services
  - **Property 2: Email Validation Consistency**
  - **Property 3: Phone Number Validation**
  - **Property 4: Complete Address Requirement**
  - **Property 12: Vitals Range Validation**
  - **Validates: Requirements 2.2, 2.3, 2.4, 4.1, 4.2, 4.3, 6.5**

- [ ] 4. Create account type selection component
  - [ ] 4.1 Implement AccountTypeSelector component
    - Create radio button interface for personal vs family selection
    - Implement selection state management
    - Add clear visual indicators for selected type
    - _Requirements: 1.1, 1.2, 1.4_

  - [ ] 4.2 Add account type form adaptation logic
    - Implement dynamic form routing based on account type
    - Ensure form fields adapt to selected account type
    - _Requirements: 1.3_

- [ ]* 4.3 Write property tests for account type selection
  - **Property 1: Account Type Form Adaptation**
  - **Validates: Requirements 1.3**

- [ ] 5. Implement personal account registration form
  - [ ] 5.1 Create PersonalRegistrationForm component
    - Build form with name, email, phone, address fields
    - Implement real-time validation feedback
    - Add next of kin information section
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 5.2 Add form submission logic
    - Implement form validation before submission
    - Enable submission only when all required fields are complete
    - _Requirements: 2.6, 8.1_

  - [ ] 5.3 Implement next of kin management
    - Support multiple next of kin entries
    - Allow designation of primary emergency contact
    - _Requirements: 5.4, 5.5_

- [ ]* 5.4 Write property tests for personal registration
  - **Property 5: Next of Kin Data Completeness**
  - **Property 6: Form Submission Enablement**
  - **Property 11: Multiple Next of Kin Support**
  - **Validates: Requirements 2.5, 2.6, 5.1, 5.2, 5.3, 5.4, 5.5**

- [ ] 6. Implement family account registration form
  - [ ] 6.1 Create FamilyRegistrationForm component
    - Build primary contact information form
    - Implement family member addition interface
    - Add relationship management between family members
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ] 6.2 Add family member management
    - Support adding multiple family members dynamically
    - Capture relationships between family members
    - Designate primary account holder
    - _Requirements: 3.2, 3.3, 3.4_

  - [ ] 6.3 Implement family account submission
    - Create individual patient profiles for each family member
    - Link family members to primary account
    - _Requirements: 3.6_

- [ ]* 6.4 Write property tests for family registration
  - **Property 7: Family Member Profile Creation**
  - **Property 8: Multiple Family Members Support**
  - **Property 9: Primary Account Holder Designation**
  - **Validates: Requirements 3.2, 3.3, 3.4, 3.6**

- [ ] 7. Create vitals recording component
  - [ ] 7.1 Implement VitalsRecordingComponent
    - Create input fields for blood pressure (systolic/diastolic)
    - Add heart rate, temperature, weight, height inputs
    - Implement unit selection for measurements
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ] 7.2 Add vitals validation and timestamping
    - Validate vital signs against medical ranges
    - Automatically timestamp all measurements
    - Record staff member who took measurements
    - _Requirements: 6.5, 6.6_

- [ ]* 7.3 Write property tests for vitals recording
  - **Property 13: Vitals Timestamp Recording**
  - **Validates: Requirements 6.6**

- [ ] 8. Implement main registration container
  - [ ] 8.1 Create PatientRegistrationContainer component
    - Orchestrate the complete registration flow
    - Manage step-by-step navigation
    - Handle form data persistence across steps
    - _Requirements: 11.5, 11.6_

  - [ ] 8.2 Add progress tracking and auto-save
    - Display progress indicators for multi-step registration
    - Implement auto-save functionality to prevent data loss
    - _Requirements: 11.5, 11.6_

  - [ ] 8.3 Integrate all registration components
    - Wire account type selection to appropriate forms
    - Connect vitals recording to registration flow
    - Implement final submission and confirmation
    - _Requirements: 9.5_

- [ ]* 8.4 Write property tests for registration container
  - **Property 32: Progress Indicator Display**
  - **Property 33: Auto-save Progress Protection**
  - **Validates: Requirements 11.5, 11.6**

- [ ] 9. Implement backend API endpoints
  - [ ] 9.1 Create patient registration API endpoint
    - Implement POST /api/patients endpoint
    - Handle both personal and family account creation
    - Generate unique patient identifiers and record numbers
    - _Requirements: 9.1, 9.2, 9.3_

  - [ ] 9.2 Add duplicate detection endpoint
    - Implement GET /api/patients/check-duplicate
    - Check for existing patients using name and contact info
    - Return potential matches for staff review
    - _Requirements: 8.2_

  - [ ] 9.3 Create vitals recording API endpoint
    - Implement POST /api/patients/:id/vitals
    - Store vital signs with proper attribution
    - _Requirements: 6.6, 7.3_

- [ ]* 9.4 Write property tests for API endpoints
  - **Property 18: Duplicate Patient Detection**
  - **Property 23: Patient Record Number Generation**
  - **Validates: Requirements 8.2, 9.3**

- [ ] 10. Implement security and authorization
  - [ ] 10.1 Add staff authentication verification
    - Verify staff user authentication before registration access
    - Authorize administrators and receptionists for patient registration
    - _Requirements: 7.1, 7.2_

  - [ ] 10.2 Implement registration activity logging
    - Log all patient registration activities with staff identification
    - Create comprehensive audit trail
    - Handle unauthorized access attempts
    - _Requirements: 7.3, 7.4, 7.5_

- [ ]* 10.3 Write property tests for security features
  - **Property 14: Staff Authentication Verification**
  - **Property 15: Registration Activity Logging**
  - **Property 16: Unauthorized Access Handling**
  - **Validates: Requirements 7.1, 7.3, 7.4**

- [ ] 11. Implement notification services
  - [ ] 11.1 Create email notification service
    - Send welcome emails to newly registered patients
    - Include patient record number and account information
    - Provide instructions for accessing medical reports
    - _Requirements: 10.1, 10.2, 10.3_

  - [ ] 11.2 Add email delivery error handling
    - Log email delivery failures
    - Notify staff of delivery issues
    - Implement email resend functionality
    - _Requirements: 10.4, 10.5_

  - [ ] 11.3 Create department notification system
    - Notify relevant hospital departments of new registrations
    - Send real-time updates to connected interfaces
    - _Requirements: 12.3, 12.5_

- [ ]* 11.4 Write property tests for notification services
  - **Property 26: Welcome Email Delivery**
  - **Property 27: Welcome Email Content Completeness**
  - **Property 28: Email Delivery Failure Handling**
  - **Property 29: Welcome Email Resend Capability**
  - **Property 34: Real-time Interface Updates**
  - **Property 35: Department Notification Delivery**
  - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 12.3, 12.5**

- [ ] 12. Implement comprehensive validation and error handling
  - [ ] 12.1 Add real-time validation feedback
    - Provide immediate validation feedback during form completion
    - Highlight specific fields with validation errors
    - Display clear, helpful error messages
    - _Requirements: 8.3, 8.4_

  - [ ] 12.2 Implement form submission validation
    - Validate all required fields before submission
    - Prevent submission of incomplete or invalid data
    - _Requirements: 8.1, 8.5_

- [ ]* 12.3 Write property tests for validation and error handling
  - **Property 10: Contact Information Validation Error Display**
  - **Property 17: Required Field Validation**
  - **Property 19: Real-time Validation Feedback**
  - **Property 20: Validation Error Highlighting**
  - **Validates: Requirements 4.4, 8.1, 8.3, 8.4, 8.5**

- [ ] 13. Integrate with existing hospital system
  - [ ] 13.1 Add registration access to dashboards
    - Integrate registration interface into admin dashboard
    - Add registration access to staff dashboard
    - Ensure proper role-based access control
    - _Requirements: 12.2_

  - [ ] 13.2 Implement real-time patient list updates
    - Update patient lists immediately after registration
    - Ensure new patients are searchable immediately
    - _Requirements: 9.4, 12.3_

- [ ]* 13.3 Write property tests for system integration
  - **Property 24: Immediate Search Availability**
  - **Validates: Requirements 9.4**

- [ ] 14. Implement accessibility and user experience features
  - [ ] 14.1 Add accessibility support
    - Implement keyboard navigation for all form elements
    - Add ARIA labels and screen reader support
    - Ensure proper focus management
    - _Requirements: 11.4_

  - [ ] 14.2 Enhance form user experience
    - Add clear field labels and helpful placeholder text
    - Implement intuitive form layout and organization
    - _Requirements: 11.3_

- [ ]* 14.3 Write property tests for accessibility and UX
  - **Property 30: Form Field Labels and Placeholders**
  - **Property 31: Keyboard Navigation and Accessibility**
  - **Validates: Requirements 11.3, 11.4**

- [ ] 15. Final integration and testing
  - [ ] 15.1 Complete end-to-end integration
    - Wire all components together in the main application
    - Test complete registration flows for both account types
    - Verify all validation and error handling works correctly
    - _Requirements: All requirements_

  - [ ] 15.2 Implement registration confirmation
    - Display comprehensive registration confirmation
    - Show patient record number and next steps
    - _Requirements: 9.5_

- [ ]* 15.3 Write integration property tests
  - **Property 25: Registration Confirmation Display**
  - **Validates: Requirements 9.5**

- [ ] 16. Final checkpoint - Ensure all tests pass
  - Ensure all property-based tests pass with minimum 100 iterations
  - Verify all unit tests pass
  - Test complete registration workflows manually
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional property-based testing tasks that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples and edge cases
- The implementation follows incremental development with early validation at each step