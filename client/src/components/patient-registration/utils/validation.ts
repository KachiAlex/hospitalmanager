// Patient Registration System - Validation Utilities
// Comprehensive validation rules and error handling for patient registration

import { ValidationRules, ValidationErrors, PersonalInfo, ContactInfo, NextOfKin, VitalSigns } from '../types';

// Validation Rules Configuration
export const VALIDATION_RULES: ValidationRules = {
  // RFC 5322 compliant email regex (simplified)
  email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  
  // Nigerian phone number format (supports +234, 0, and direct formats)
  phoneNumber: /^(\+234|0)?[789][01]\d{8}$/,
  
  // Nigerian postal code format (6 digits)
  postalCode: /^\d{6}$/,
  
  // Medical vital signs ranges (reasonable medical limits)
  vitalRanges: {
    bloodPressure: {
      systolic: { min: 70, max: 250 },
      diastolic: { min: 40, max: 150 }
    },
    heartRate: { min: 30, max: 220 },
    temperature: { min: 32.0, max: 45.0 }, // Celsius
    weight: { min: 0.5, max: 500 }, // Kilograms
    height: { min: 30, max: 250 } // Centimeters
  }
};

// Validation Error Messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid Nigerian phone number',
  INVALID_POSTAL_CODE: 'Please enter a valid 6-digit postal code',
  INVALID_VITAL_RANGE: (field: string, min: number, max: number) => 
    `${field} must be between ${min} and ${max}`,
  DUPLICATE_PATIENT: 'A patient with similar information already exists',
  NETWORK_ERROR: 'Network error occurred. Please try again.',
  SERVER_ERROR: 'Server error occurred. Please contact support.',
  FORM_INCOMPLETE: 'Please complete all required fields before submitting'
};

// Validation Functions
export class ValidationService {
  
  /**
   * Validates email address format
   */
  static validateEmail(email: string): string[] {
    const errors: string[] = [];
    
    if (!email || email.trim() === '') {
      errors.push(ERROR_MESSAGES.REQUIRED_FIELD);
      return errors;
    }
    
    if (!VALIDATION_RULES.email.test(email.trim())) {
      errors.push(ERROR_MESSAGES.INVALID_EMAIL);
    }
    
    return errors;
  }
  
  /**
   * Validates phone number format
   */
  static validatePhoneNumber(phoneNumber: string): string[] {
    const errors: string[] = [];
    
    if (!phoneNumber || phoneNumber.trim() === '') {
      errors.push(ERROR_MESSAGES.REQUIRED_FIELD);
      return errors;
    }
    
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    if (!VALIDATION_RULES.phoneNumber.test(cleanPhone)) {
      errors.push(ERROR_MESSAGES.INVALID_PHONE);
    }
    
    return errors;
  }
  
  /**
   * Validates complete address information
   */
  static validateAddress(address: Partial<ContactInfo['address']>): ValidationErrors {
    const errors: ValidationErrors = {};
    
    if (!address.street || address.street.trim() === '') {
      errors.street = [ERROR_MESSAGES.REQUIRED_FIELD];
    }
    
    if (!address.city || address.city.trim() === '') {
      errors.city = [ERROR_MESSAGES.REQUIRED_FIELD];
    }
    
    if (!address.state || address.state.trim() === '') {
      errors.state = [ERROR_MESSAGES.REQUIRED_FIELD];
    }
    
    if (!address.postalCode || address.postalCode.trim() === '') {
      errors.postalCode = [ERROR_MESSAGES.REQUIRED_FIELD];
    } else if (!VALIDATION_RULES.postalCode.test(address.postalCode.trim())) {
      errors.postalCode = [ERROR_MESSAGES.INVALID_POSTAL_CODE];
    }
    
    if (!address.country || address.country.trim() === '') {
      errors.country = [ERROR_MESSAGES.REQUIRED_FIELD];
    }
    
    return errors;
  }
  
  /**
   * Validates personal information
   */
  static validatePersonalInfo(personalInfo: Partial<PersonalInfo>): ValidationErrors {
    const errors: ValidationErrors = {};
    
    if (!personalInfo.firstName || personalInfo.firstName.trim() === '') {
      errors.firstName = [ERROR_MESSAGES.REQUIRED_FIELD];
    }
    
    if (!personalInfo.lastName || personalInfo.lastName.trim() === '') {
      errors.lastName = [ERROR_MESSAGES.REQUIRED_FIELD];
    }
    
    return errors;
  }
  
  /**
   * Validates next of kin information
   */
  static validateNextOfKin(nextOfKin: Partial<NextOfKin>): ValidationErrors {
    const errors: ValidationErrors = {};
    
    if (!nextOfKin.fullName || nextOfKin.fullName.trim() === '') {
      errors.fullName = [ERROR_MESSAGES.REQUIRED_FIELD];
    }
    
    if (!nextOfKin.relationship || nextOfKin.relationship.trim() === '') {
      errors.relationship = [ERROR_MESSAGES.REQUIRED_FIELD];
    }
    
    const phoneErrors = this.validatePhoneNumber(nextOfKin.phoneNumber || '');
    if (phoneErrors.length > 0) {
      errors.phoneNumber = phoneErrors;
    }
    
    if (nextOfKin.email && nextOfKin.email.trim() !== '') {
      const emailErrors = this.validateEmail(nextOfKin.email);
      if (emailErrors.length > 0) {
        errors.email = emailErrors;
      }
    }
    
    return errors;
  }
  
  /**
   * Validates vital signs within medical ranges
   */
  static validateVitalSigns(vitals: Partial<VitalSigns>): ValidationErrors {
    const errors: ValidationErrors = {};
    const ranges = VALIDATION_RULES.vitalRanges;
    
    // Blood Pressure Validation
    if (vitals.bloodPressure) {
      const { systolic, diastolic } = vitals.bloodPressure;
      
      if (systolic < ranges.bloodPressure.systolic.min || systolic > ranges.bloodPressure.systolic.max) {
        errors['bloodPressure.systolic'] = [
          ERROR_MESSAGES.INVALID_VITAL_RANGE(
            'Systolic blood pressure',
            ranges.bloodPressure.systolic.min,
            ranges.bloodPressure.systolic.max
          )
        ];
      }
      
      if (diastolic < ranges.bloodPressure.diastolic.min || diastolic > ranges.bloodPressure.diastolic.max) {
        errors['bloodPressure.diastolic'] = [
          ERROR_MESSAGES.INVALID_VITAL_RANGE(
            'Diastolic blood pressure',
            ranges.bloodPressure.diastolic.min,
            ranges.bloodPressure.diastolic.max
          )
        ];
      }
    }
    
    // Heart Rate Validation
    if (vitals.heartRate !== undefined) {
      if (vitals.heartRate < ranges.heartRate.min || vitals.heartRate > ranges.heartRate.max) {
        errors.heartRate = [
          ERROR_MESSAGES.INVALID_VITAL_RANGE(
            'Heart rate',
            ranges.heartRate.min,
            ranges.heartRate.max
          )
        ];
      }
    }
    
    // Temperature Validation
    if (vitals.temperature !== undefined) {
      if (vitals.temperature < ranges.temperature.min || vitals.temperature > ranges.temperature.max) {
        errors.temperature = [
          ERROR_MESSAGES.INVALID_VITAL_RANGE(
            'Temperature',
            ranges.temperature.min,
            ranges.temperature.max
          )
        ];
      }
    }
    
    // Weight Validation
    if (vitals.weight !== undefined) {
      if (vitals.weight < ranges.weight.min || vitals.weight > ranges.weight.max) {
        errors.weight = [
          ERROR_MESSAGES.INVALID_VITAL_RANGE(
            'Weight',
            ranges.weight.min,
            ranges.weight.max
          )
        ];
      }
    }
    
    // Height Validation
    if (vitals.height !== undefined) {
      if (vitals.height < ranges.height.min || vitals.height > ranges.height.max) {
        errors.height = [
          ERROR_MESSAGES.INVALID_VITAL_RANGE(
            'Height',
            ranges.height.min,
            ranges.height.max
          )
        ];
      }
    }
    
    return errors;
  }
  
  /**
   * Validates complete contact information
   */
  static validateContactInfo(contactInfo: Partial<ContactInfo>): ValidationErrors {
    const errors: ValidationErrors = {};
    
    // Email validation
    const emailErrors = this.validateEmail(contactInfo.email || '');
    if (emailErrors.length > 0) {
      errors.email = emailErrors;
    }
    
    // Phone validation
    const phoneErrors = this.validatePhoneNumber(contactInfo.phoneNumber || '');
    if (phoneErrors.length > 0) {
      errors.phoneNumber = phoneErrors;
    }
    
    // Address validation
    if (contactInfo.address) {
      const addressErrors = this.validateAddress(contactInfo.address);
      Object.keys(addressErrors).forEach(key => {
        errors[`address.${key}`] = addressErrors[key];
      });
    }
    
    return errors;
  }
  
  /**
   * Checks if validation errors object has any errors
   */
  static hasErrors(errors: ValidationErrors): boolean {
    return Object.keys(errors).some(key => errors[key].length > 0);
  }
  
  /**
   * Merges multiple validation error objects
   */
  static mergeErrors(...errorObjects: ValidationErrors[]): ValidationErrors {
    const merged: ValidationErrors = {};
    
    errorObjects.forEach(errors => {
      Object.keys(errors).forEach(key => {
        if (merged[key]) {
          merged[key] = [...merged[key], ...errors[key]];
        } else {
          merged[key] = [...errors[key]];
        }
      });
    });
    
    return merged;
  }
  
  /**
   * Clears errors for specific fields
   */
  static clearFieldErrors(errors: ValidationErrors, fieldNames: string[]): ValidationErrors {
    const cleared = { ...errors };
    fieldNames.forEach(fieldName => {
      delete cleared[fieldName];
    });
    return cleared;
  }
}

// Utility function to format phone number for display
export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  // Format as +234 XXX XXX XXXX
  if (cleaned.startsWith('+234')) {
    const number = cleaned.substring(4);
    return `+234 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
  }
  
  // Format as 0XXX XXX XXXX
  if (cleaned.startsWith('0')) {
    return `${cleaned.substring(0, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7)}`;
  }
  
  return phoneNumber;
};

// Utility function to clean phone number for storage
export const cleanPhoneNumber = (phoneNumber: string): string => {
  return phoneNumber.replace(/[\s\-\(\)]/g, '');
};