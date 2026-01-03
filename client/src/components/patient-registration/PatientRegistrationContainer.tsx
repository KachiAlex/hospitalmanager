import React, { useState, useCallback } from 'react';
import AccountTypeSelector from './AccountTypeSelector';
import PersonalRegistrationForm from './PersonalRegistrationForm';
import FamilyRegistrationForm from './FamilyRegistrationForm';
import VitalsRecordingComponent from './VitalsRecordingComponent';
import { patientRegistrationApi } from './services/patientRegistrationApi';
import './PatientRegistrationContainer.css';

export type RegistrationStep = 'account-type' | 'personal-form' | 'family-form' | 'vitals' | 'confirmation';
export type AccountType = 'personal' | 'family';

export interface PatientRegistrationContainerProps {
  staffId: string;
  onRegistrationComplete: (patientId: string, recordNumber: string) => void;
  onCancel: () => void;
}

interface RegistrationState {
  currentStep: RegistrationStep;
  accountType?: AccountType;
  patientData: Record<string, any>;
  familyMembers: Array<Record<string, any>>;
  vitals?: Record<string, any>;
  isSubmitting: boolean;
  errors: Record<string, string>;
  createdPatientId?: string;
  createdRecordNumber?: string;
}

const PatientRegistrationContainer: React.FC<PatientRegistrationContainerProps> = ({
  staffId,
  onRegistrationComplete,
  onCancel,
}) => {
  const [state, setState] = useState<RegistrationState>({
    currentStep: 'account-type',
    patientData: {},
    familyMembers: [],
    isSubmitting: false,
    errors: {},
  });

  const handleAccountTypeSelect = useCallback((type: AccountType) => {
    setState(prev => ({
      ...prev,
      accountType: type,
      currentStep: type === 'personal' ? 'personal-form' : 'family-form',
    }));
  }, []);

  const handlePersonalFormSubmit = useCallback(async (data: Record<string, any>) => {
    setState(prev => ({ ...prev, isSubmitting: true, errors: {} }));
    try {
      const response = await patientRegistrationApi.createPatient({
        accountType: 'personal',
        personalInfo: data,
        createdBy: staffId,
      });

      setState(prev => ({
        ...prev,
        patientData: data,
        createdPatientId: response.patient.id,
        createdRecordNumber: response.patient.recordNumber,
        currentStep: 'vitals',
        isSubmitting: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        errors: { submit: error.message || 'Failed to create patient' },
        isSubmitting: false,
      }));
    }
  }, [staffId]);

  const handleFamilyFormSubmit = useCallback(async (data: Record<string, any>) => {
    setState(prev => ({ ...prev, isSubmitting: true, errors: {} }));
    try {
      const response = await patientRegistrationApi.createPatient({
        accountType: 'family',
        personalInfo: data.primaryPatient,
        nextOfKin: data.nextOfKin,
        familyMembers: data.familyMembers,
        createdBy: staffId,
      });

      setState(prev => ({
        ...prev,
        patientData: data.primaryPatient,
        familyMembers: data.familyMembers || [],
        createdPatientId: response.patient.id,
        createdRecordNumber: response.patient.recordNumber,
        currentStep: 'vitals',
        isSubmitting: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        errors: { submit: error.message || 'Failed to create family account' },
        isSubmitting: false,
      }));
    }
  }, [staffId]);

  const handleVitalsSubmit = useCallback(async (vitals: Record<string, any>) => {
    if (!state.createdPatientId) return;

    setState(prev => ({ ...prev, isSubmitting: true, errors: {} }));
    try {
      await patientRegistrationApi.recordVitals(state.createdPatientId, {
        ...vitals,
        recordedBy: staffId,
      });

      setState(prev => ({
        ...prev,
        vitals,
        currentStep: 'confirmation',
        isSubmitting: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        errors: { vitals: error.message || 'Failed to record vitals' },
        isSubmitting: false,
      }));
    }
  }, [state.createdPatientId, staffId]);

  const handleVitalsSkip = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: 'confirmation',
    }));
  }, []);

  const handleConfirmationComplete = useCallback(() => {
    if (state.createdPatientId && state.createdRecordNumber) {
      onRegistrationComplete(state.createdPatientId, state.createdRecordNumber);
    }
  }, [state.createdPatientId, state.createdRecordNumber, onRegistrationComplete]);

  const renderStep = () => {
    switch (state.currentStep) {
      case 'account-type':
        return (
          <AccountTypeSelector
            onSelect={handleAccountTypeSelect}
            selectedType={state.accountType}
          />
        );

      case 'personal-form':
        return (
          <PersonalRegistrationForm
            onSubmit={handlePersonalFormSubmit}
            isSubmitting={state.isSubmitting}
            initialData={state.patientData}
          />
        );

      case 'family-form':
        return (
          <FamilyRegistrationForm
            onSubmit={handleFamilyFormSubmit}
            isSubmitting={state.isSubmitting}
            initialData={{
              primaryPatient: state.patientData,
              familyMembers: state.familyMembers,
            }}
          />
        );

      case 'vitals':
        return (
          <VitalsRecordingComponent
            patientId={state.createdPatientId || ''}
            onSubmit={handleVitalsSubmit}
            onSkip={handleVitalsSkip}
            isSubmitting={state.isSubmitting}
          />
        );

      case 'confirmation':
        return (
          <div className="confirmation-screen">
            <div className="confirmation-content">
              <h2>Registration Complete</h2>
              <p>Patient successfully registered</p>
              <div className="patient-details">
                <p><strong>Record Number:</strong> {state.createdRecordNumber}</p>
                <p><strong>Account Type:</strong> {state.accountType}</p>
              </div>
              <button onClick={handleConfirmationComplete} className="btn-primary">
                Return to Dashboard
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="patient-registration-container">
      <div className="registration-header">
        <h1>Patient Registration</h1>
        <button onClick={onCancel} className="btn-cancel">Cancel</button>
      </div>

      {state.errors.submit && (
        <div className="error-message">
          {state.errors.submit}
        </div>
      )}

      <div className="registration-content">
        {renderStep()}
      </div>

      <div className="registration-progress">
        <span className={`step ${state.currentStep === 'account-type' ? 'active' : ''}`}>
          Account Type
        </span>
        <span className={`step ${['personal-form', 'family-form'].includes(state.currentStep) ? 'active' : ''}`}>
          Patient Info
        </span>
        <span className={`step ${state.currentStep === 'vitals' ? 'active' : ''}`}>
          Vitals
        </span>
        <span className={`step ${state.currentStep === 'confirmation' ? 'active' : ''}`}>
          Confirmation
        </span>
      </div>
    </div>
  );
};

export default PatientRegistrationContainer;
