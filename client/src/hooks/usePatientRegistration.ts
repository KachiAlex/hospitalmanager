import { useState, useCallback } from 'react';

export interface PatientRegistrationState {
  isOpen: boolean;
  lastRegisteredPatient?: {
    id: string;
    recordNumber: string;
    name: string;
    timestamp: Date;
  };
  error?: string;
}

export const usePatientRegistration = () => {
  const [state, setState] = useState<PatientRegistrationState>({
    isOpen: false,
  });

  const openRegistration = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: true,
      error: undefined,
    }));
  }, []);

  const closeRegistration = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  const handleRegistrationComplete = useCallback((patientId: string, recordNumber: string, patientName: string) => {
    setState(prev => ({
      ...prev,
      isOpen: false,
      lastRegisteredPatient: {
        id: patientId,
        recordNumber,
        name: patientName,
        timestamp: new Date(),
      },
    }));
  }, []);

  const clearLastRegistered = useCallback(() => {
    setState(prev => ({
      ...prev,
      lastRegisteredPatient: undefined,
    }));
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      error,
    }));
  }, []);

  return {
    isOpen: state.isOpen,
    lastRegisteredPatient: state.lastRegisteredPatient,
    error: state.error,
    openRegistration,
    closeRegistration,
    handleRegistrationComplete,
    clearLastRegistered,
    setError,
  };
};
