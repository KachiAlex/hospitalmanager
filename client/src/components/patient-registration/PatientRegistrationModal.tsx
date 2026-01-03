import React, { useState, useCallback } from 'react';
import PatientRegistrationContainer from './PatientRegistrationContainer';
import './PatientRegistrationModal.css';

export interface PatientRegistrationModalProps {
  isOpen: boolean;
  staffId: string;
  staffRole: string;
  onClose: () => void;
  onRegistrationComplete: (patientId: string, recordNumber: string) => void;
}

const PatientRegistrationModal: React.FC<PatientRegistrationModalProps> = ({
  isOpen,
  staffId,
  staffRole,
  onClose,
  onRegistrationComplete,
}) => {
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegistrationComplete = useCallback((patientId: string, recordNumber: string) => {
    setIsRegistering(false);
    onRegistrationComplete(patientId, recordNumber);
    // Close modal after a short delay to show confirmation
    setTimeout(() => {
      onClose();
    }, 1500);
  }, [onRegistrationComplete, onClose]);

  const handleCancel = useCallback(() => {
    setIsRegistering(false);
    onClose();
  }, [onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="patient-registration-modal-overlay">
      <div className="patient-registration-modal">
        <PatientRegistrationContainer
          staffId={staffId}
          onRegistrationComplete={handleRegistrationComplete}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default PatientRegistrationModal;
