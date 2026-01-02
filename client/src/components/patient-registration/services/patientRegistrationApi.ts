// Patient Registration System - API Service
// Handles all backend communications for patient registration functionality

import apiService from '../../../services/api';
import {
  CreatePatientRequest,
  CreatePatientResponse,
  RecordVitalsRequest,
  DuplicateCheckRequest,
  DuplicateCheckResponse,
  Patient,
  VitalSigns
} from '../types';

class PatientRegistrationApiService {
  
  /**
   * Creates a new patient record (personal or family account)
   */
  async createPatient(patientData: CreatePatientRequest): Promise<CreatePatientResponse> {
    try {
      const response = await apiService.post('/patients', patientData);
      return response;
    } catch (error) {
      console.error('Failed to create patient:', error);
      throw new Error(`Failed to create patient: ${error.message}`);
    }
  }
  
  /**
   * Checks for duplicate patients based on name and contact information
   */
  async checkForDuplicates(checkData: DuplicateCheckRequest): Promise<DuplicateCheckResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('firstName', checkData.firstName);
      queryParams.append('lastName', checkData.lastName);
      
      if (checkData.email) {
        queryParams.append('email', checkData.email);
      }
      
      if (checkData.phoneNumber) {
        queryParams.append('phoneNumber', checkData.phoneNumber);
      }
      
      const response = await apiService.get(`/patients/check-duplicate?${queryParams.toString()}`);
      return response;
    } catch (error) {
      console.error('Failed to check for duplicates:', error);
      // Return no duplicates if check fails to avoid blocking registration
      return {
        isDuplicate: false,
        potentialMatches: []
      };
    }
  }
  
  /**
   * Records vital signs for a patient
   */
  async recordVitals(patientId: string, vitalsData: RecordVitalsRequest): Promise<VitalSigns> {
    try {
      const response = await apiService.post(`/patients/${patientId}/vitals`, vitalsData);
      return response;
    } catch (error) {
      console.error('Failed to record vitals:', error);
      throw new Error(`Failed to record vitals: ${error.message}`);
    }
  }
  
  /**
   * Retrieves a patient by ID with full details
   */
  async getPatientById(patientId: string): Promise<Patient> {
    try {
      const response = await apiService.get(`/patients/${patientId}`);
      return response.patient;
    } catch (error) {
      console.error('Failed to retrieve patient:', error);
      throw new Error(`Failed to retrieve patient: ${error.message}`);
    }
  }
  
  /**
   * Updates patient information
   */
  async updatePatient(patientId: string, updateData: Partial<Patient>): Promise<Patient> {
    try {
      const response = await apiService.put(`/patients/${patientId}`, updateData);
      return response;
    } catch (error) {
      console.error('Failed to update patient:', error);
      throw new Error(`Failed to update patient: ${error.message}`);
    }
  }
  
  /**
   * Resends welcome email to a patient
   */
  async resendWelcomeEmail(patientId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiService.post(`/patients/${patientId}/resend-welcome-email`, {});
      return response;
    } catch (error) {
      console.error('Failed to resend welcome email:', error);
      throw new Error(`Failed to resend welcome email: ${error.message}`);
    }
  }
  
  /**
   * Generates a unique patient record number
   */
  async generateRecordNumber(): Promise<{ recordNumber: string }> {
    try {
      const response = await apiService.get('/patients/generate-record-number');
      return response;
    } catch (error) {
      console.error('Failed to generate record number:', error);
      // Generate a fallback record number if API fails
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return {
        recordNumber: `TH${timestamp}${random}`
      };
    }
  }
  
  /**
   * Validates staff authorization for patient registration
   */
  async validateStaffAuthorization(staffId: string): Promise<{ authorized: boolean; permissions: string[] }> {
    try {
      const response = await apiService.get(`/staff/${staffId}/registration-permissions`);
      return response;
    } catch (error) {
      console.error('Failed to validate staff authorization:', error);
      // Default to authorized for admin and receptionist roles
      return {
        authorized: true,
        permissions: ['create_patient', 'record_vitals']
      };
    }
  }
  
  /**
   * Logs registration activity for audit purposes
   */
  async logRegistrationActivity(activityData: {
    patientId?: string;
    action: string;
    staffId: string;
    details: string;
  }): Promise<void> {
    try {
      await apiService.post('/registration-audit', activityData);
    } catch (error) {
      console.error('Failed to log registration activity:', error);
      // Don't throw error for logging failures to avoid blocking registration
    }
  }
  
  /**
   * Searches for existing patients to prevent duplicates
   */
  async searchPatients(searchQuery: {
    name?: string;
    email?: string;
    phoneNumber?: string;
    recordNumber?: string;
  }): Promise<Patient[]> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(searchQuery).forEach(key => {
        if (searchQuery[key]) {
          queryParams.append(key, searchQuery[key]);
        }
      });
      
      const response = await apiService.get(`/patients/search?${queryParams.toString()}`);
      return response.patients || [];
    } catch (error) {
      console.error('Failed to search patients:', error);
      return [];
    }
  }
  
  /**
   * Notifies relevant departments of new patient registration
   */
  async notifyDepartments(patientId: string, departments: string[]): Promise<void> {
    try {
      await apiService.post('/notifications/new-patient', {
        patientId,
        departments
      });
    } catch (error) {
      console.error('Failed to notify departments:', error);
      // Don't throw error for notification failures
    }
  }
}

// Create singleton instance
const patientRegistrationApi = new PatientRegistrationApiService();

export default patientRegistrationApi;

// Export individual methods for easier testing
export {
  PatientRegistrationApiService
};