# Implementation Plan: Patient Registration System - Critical Gaps Resolution

## Overview

This implementation plan addresses the critical functional gaps in the patient registration system by building missing React components, backend API endpoints, database schema extensions, and integration points. The tasks are organized to build incrementally, ensuring each component can be tested as it's developed.

## Tasks

- [x] 1. Database Schema Extensions
  - Extend existing patients table with new columns (account_type, middle_name, record_number, created_by)
  - Create next_of_kin table with foreign key relationships
  - Create family_members table for family account relationships
  - Create patient_vitals table for storing vital signs
  - Create registration_audit table for activity logging
  - Add appropriate indexes and constraints for data integrity
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 1.1 Write property tests for database schema integrity
  - **Property 10: Database Schema Integrity**
  - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

- [ ] 2. Enhanced Backend API Endpoints
  - [x] 2.1 Enhance POST /api/patients endpoint for account types and family members
    - Support personal and family account creation
    - Handle next of kin data persistence
    - Implement atomic transactions for multi-table operations
    - _Requirements: 2.1, 9.1_

  - [x] 2.2 Write property tests for enhanced patient creation
    - **Property 3: Enhanced Patient Creation Data Integrity**
    - **Validates: Requirements 2.1**

  - [x] 2.3 Implement GET /api/patients/check-duplicate endpoint
    - Check for duplicates based on name, DOB, and phone
    - Return existing patient summaries when duplicates found
    - _Requirements: 2.2_

  - [x] 2.4 Write property tests for duplicate detection
    - **Property 4: Duplicate Detection Accuracy**
    - **Validates: Requirements 2.2**

  - [x] 2.5 Create POST /api/patients/:id/vitals endpoint
    - Validate vital signs against medical ranges
    - Store vitals with proper timestamps and relationships
    - _Requirements: 2.3_

  - [x] 2.6 Write property tests for vitals recording
    - **Property 5: Vitals Recording Validation**
    - **Validates: Requirements 2.3**

  - [x] 2.7 Implement GET /api/patients/generate-record-number endpoint
    - Generate unique patient record numbers
    - Handle concurrent requests safely
    - _Requirements: 2.5_

  - [x] 2.8 Write property tests for unique record number generation
    - **Property 7: Unique Record Number Generation**
    - **Validates: Requirements 2.5**

- [ ] 3. Email Service Implementation
  - [ ] 3.1 Create email service module for welcome emails
    - Implement email template system
    - Handle email delivery with proper error handling
    - _Requirements: 6.1, 6.4_

  - [x] 3.2 Implement POST /api/patients/:id/resend-welcome-email endpoint
    - Allow staff to resend welcome emails
    - Log email sending attempts
    - _Requirements: 2.4, 6.5_

  - [x] 3.3 Write property tests for email functionality
    - **Property 6: Email Service Reliability**
    - **Property 14: Email Content Completeness**
    - **Property 15: Email Error Handling**
    - **Validates: Requirements 2.4, 6.1, 6.2, 6.3, 6.4, 6.5**

- [ ] 4. Audit and Security Implementation
  - [x] 4.1 Create POST /registration-audit endpoint
    - Log all registration activities with staff identification
    - Store comprehensive audit information
    - _Requirements: 2.6, 8.3_

  - [x] 4.2 Implement staff authorization validation
    - Verify staff authentication for registration access
    - Authorize administrators and receptionists only
    - Handle unauthorized access attempts
    - _Requirements: 2.7, 8.1, 8.2, 8.4_

  - [x] 4.3 Write property tests for audit and security
    - **Property 8: Audit Logging Completeness**
    - **Property 9: Staff Authorization Validation**
    - **Property 19: Authentication and Authorization Enforcement**
    - **Property 20: Comprehensive Audit Trail**
    - **Validates: Requirements 2.6, 2.7, 8.1, 8.2, 8.3, 8.4, 8.5**

- [ ] 5. Checkpoint - Backend API Complete
  - Ensure all API endpoints are functional and tested
  - Verify database operations work correctly
  - Ask the user if questions arise

- [x] 6. Core React Components Implementation
  - [x] 6.1 Create PatientRegistrationContainer component
    - Implement main orchestrator for registration workflow
    - Manage registration state and step progression
    - Handle data flow between sub-components
    - _Requirements: 1.1, 1.6_

  - [x] 6.2 Write property tests for PatientRegistrationContainer
    - **Property 1: Component Rendering Consistency**
    - **Property 2: Registration Workflow State Management**
    - **Validates: Requirements 1.1, 1.6**

  - [x] 6.3 Create AccountTypeSelector component
    - Implement UI for choosing personal vs family accounts
    - Handle selection events and state management
    - _Requirements: 1.2_

  - [x] 6.4 Write property tests for AccountTypeSelector
    - **Property 1: Component Rendering Consistency**
    - **Validates: Requirements 1.2**

  - [x] 6.5 Build PersonalRegistrationForm component
    - Implement form for individual patient registration
    - Add real-time validation with clear error messages
    - Handle form submission and data validation
    - _Requirements: 1.3, 7.1, 7.2, 7.3, 7.4_

  - [x] 6.6 Write property tests for PersonalRegistrationForm
    - **Property 1: Component Rendering Consistency**
    - **Property 16: Real-Time Form Validation**
    - **Property 17: Form Submission Prevention**
    - **Validates: Requirements 1.3, 7.1, 7.2, 7.3, 7.4**

  - [x] 6.7 Develop FamilyRegistrationForm component
    - Implement form for family account creation
    - Support multiple family members with relationship validation
    - Handle complex form state and validation
    - _Requirements: 1.4, 7.1, 7.2, 7.3, 7.4_

  - [x] 6.8 Write property tests for FamilyRegistrationForm
    - **Property 1: Component Rendering Consistency**
    - **Property 16: Real-Time Form Validation**
    - **Property 17: Form Submission Prevention**
    - **Validates: Requirements 1.4, 7.1, 7.2, 7.3, 7.4**

- [x] 7. Vitals Recording Component
  - [x] 7.1 Implement VitalsRecordingComponent
    - Create UI for capturing patient vital signs
    - Validate vitals against medical ranges
    - Handle optional vitals recording in workflow
    - _Requirements: 1.5, 7.5_

  - [x] 7.2 Write property tests for VitalsRecordingComponent
    - **Property 1: Component Rendering Consistency**
    - **Property 18: Medical Range Validation**
    - **Validates: Requirements 1.5, 7.5**

- [ ] 8. Dashboard Integration
  - [x] 8.1 Integrate registration into AdminDashboard
    - Add patient registration access to admin dashboard
    - Implement proper role-based access control
    - Ensure consistent styling with existing dashboard
    - _Requirements: 4.1, 4.3, 4.4, 4.5_

  - [x] 8.2 Add registration access to StaffDashboard
    - Integrate registration functionality for staff users
    - Maintain consistent navigation and user experience
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

  - [x] 8.3 Write property tests for dashboard integration
    - **Property 11: Dashboard Integration Consistency**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

- [ ] 9. Real-Time Updates Implementation
  - [x] 9.1 Implement real-time patient list updates
    - Update patient lists immediately after registration
    - Make new patients searchable without refresh
    - Handle concurrent access safely
    - _Requirements: 5.1, 5.2, 5.5_

  - [x] 9.2 Add notification system for new registrations
    - Notify relevant hospital departments of new patients
    - Ensure data consistency across all interfaces
    - _Requirements: 5.3, 5.4_

  - [x] 9.3 Write property tests for real-time updates
    - **Property 12: Real-Time Data Synchronization**
    - **Property 13: Concurrent Access Safety**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

- [ ] 10. Data Persistence and Transaction Safety
  - [x] 10.1 Implement atomic transaction handling
    - Ensure multi-table operations complete atomically
    - Handle database errors with proper rollback
    - Validate data integrity before and after operations
    - _Requirements: 9.1, 9.3, 9.4, 9.5_

  - [x] 10.2 Add unique identifier generation system
    - Generate unique patient IDs and record numbers
    - Prevent duplicate identifier creation
    - _Requirements: 9.2_

  - [x] 10.3 Write property tests for data persistence
    - **Property 21: Atomic Transaction Processing**
    - **Property 22: Unique Identifier Generation**
    - **Property 23: Data Integrity Validation**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**

- [ ] 11. End-to-End Workflow Integration
  - [x] 11.1 Complete registration workflow implementation
    - Connect all components into seamless workflow
    - Support both personal and family registration paths
    - Include vitals recording in registration process
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 11.2 Implement registration confirmation and navigation
    - Display confirmation with patient record details
    - Return staff to appropriate dashboard after completion
    - Handle all error conditions gracefully
    - _Requirements: 10.4, 10.5, 10.6_

  - [x] 11.3 Write property tests for complete workflow
    - **Property 24: End-to-End Registration Workflow**
    - **Property 25: Registration Confirmation and Navigation**
    - **Property 26: Error Handling Robustness**
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6**

- [ ] 12. Final Integration Testing
  - [ ] 12.1 Perform comprehensive integration testing
    - Test complete registration workflows end-to-end
    - Verify all components work together correctly
    - Validate error handling across all scenarios
    - _Requirements: All requirements_

  - [ ] 12.2 Write integration property tests
    - Test cross-component interactions and data flow
    - Validate system behavior under various conditions
    - _Requirements: All requirements_

- [ ] 13. Final Checkpoint - System Complete
  - Ensure all tests pass and functionality works correctly
  - Verify registration system is fully operational
  - Ask the user if questions arise

## Notes

- All tasks are required for comprehensive system implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Database tasks should be completed first to support API development
- API endpoints should be functional before building frontend components
- Integration tasks ensure all components work together seamlessly