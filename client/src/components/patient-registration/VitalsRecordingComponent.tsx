import React, { useState, useCallback } from 'react';
import { ValidationService, VALIDATION_RULES, ERROR_MESSAGES } from './utils/validation';
import './VitalsRecordingComponent.css';

export interface VitalSigns {
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  notes?: string;
}

export interface VitalsRecordingComponentProps {
  onSubmit: (data: VitalSigns) => void;
  onSkip?: () => void;
  isSubmitting: boolean;
  isOptional?: boolean;
}

const VitalsRecordingComponent: React.FC<VitalsRecordingComponentProps> = ({
  onSubmit,
  onSkip,
  isSubmitting,
  isOptional = true,
}) => {
  const [vitals, setVitals] = useState<VitalSigns>({
    bloodPressure: { systolic: 0, diastolic: 0 },
    heartRate: 0,
    temperature: 0,
    weight: 0,
    height: 0,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const ranges = VALIDATION_RULES.vitalRanges;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('bloodPressure.')) {
      const field = name.split('.')[1];
      setVitals(prev => ({
        ...prev,
        bloodPressure: {
          ...prev.bloodPressure!,
          [field]: value ? parseInt(value, 10) : 0,
        },
      }));
    } else {
      setVitals(prev => ({
        ...prev,
        [name]: name === 'notes' ? value : (value ? parseFloat(value) : 0),
      }));
    }

    // Real-time validation
    if (touched[name]) {
      validateField(name, value);
    }
  }, [touched]);

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    if (name.startsWith('bloodPressure.')) {
      const field = name.split('.')[1];
      const numValue = value ? parseInt(value, 10) : 0;
      
      if (field === 'systolic') {
        if (numValue < ranges.bloodPressure.systolic.min || numValue > ranges.bloodPressure.systolic.max) {
          newErrors[name] = ERROR_MESSAGES.INVALID_VITAL_RANGE(
            'Systolic BP',
            ranges.bloodPressure.systolic.min,
            ranges.bloodPressure.systolic.max
          );
        } else {
          delete newErrors[name];
        }
      } else if (field === 'diastolic') {
        if (numValue < ranges.bloodPressure.diastolic.min || numValue > ranges.bloodPressure.diastolic.max) {
          newErrors[name] = ERROR_MESSAGES.INVALID_VITAL_RANGE(
            'Diastolic BP',
            ranges.bloodPressure.diastolic.min,
            ranges.bloodPressure.diastolic.max
          );
        } else {
          delete newErrors[name];
        }
      }
    } else if (name === 'heartRate') {
      const numValue = value ? parseInt(value, 10) : 0;
      if (numValue > 0 && (numValue < ranges.heartRate.min || numValue > ranges.heartRate.max)) {
        newErrors[name] = ERROR_MESSAGES.INVALID_VITAL_RANGE(
          'Heart rate',
          ranges.heartRate.min,
          ranges.heartRate.max
        );
      } else {
        delete newErrors[name];
      }
    } else if (name === 'temperature') {
      const numValue = value ? parseFloat(value) : 0;
      if (numValue > 0 && (numValue < ranges.temperature.min || numValue > ranges.temperature.max)) {
        newErrors[name] = ERROR_MESSAGES.INVALID_VITAL_RANGE(
          'Temperature',
          ranges.temperature.min,
          ranges.temperature.max
        );
      } else {
        delete newErrors[name];
      }
    } else if (name === 'weight') {
      const numValue = value ? parseFloat(value) : 0;
      if (numValue > 0 && (numValue < ranges.weight.min || numValue > ranges.weight.max)) {
        newErrors[name] = ERROR_MESSAGES.INVALID_VITAL_RANGE(
          'Weight',
          ranges.weight.min,
          ranges.weight.max
        );
      } else {
        delete newErrors[name];
      }
    } else if (name === 'height') {
      const numValue = value ? parseFloat(value) : 0;
      if (numValue > 0 && (numValue < ranges.height.min || numValue > ranges.height.max)) {
        newErrors[name] = ERROR_MESSAGES.INVALID_VITAL_RANGE(
          'Height',
          ranges.height.min,
          ranges.height.max
        );
      } else {
        delete newErrors[name];
      }
    }

    setErrors(newErrors);
  };

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = Object.keys(vitals).reduce((acc, key) => {
      acc[key] = true;
      if (key === 'bloodPressure') {
        acc['bloodPressure.systolic'] = true;
        acc['bloodPressure.diastolic'] = true;
      }
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    // Validate all vitals
    const validationErrors: Record<string, string> = {};
    
    if (vitals.bloodPressure) {
      const { systolic, diastolic } = vitals.bloodPressure;
      if (systolic > 0 && (systolic < ranges.bloodPressure.systolic.min || systolic > ranges.bloodPressure.systolic.max)) {
        validationErrors['bloodPressure.systolic'] = ERROR_MESSAGES.INVALID_VITAL_RANGE(
          'Systolic BP',
          ranges.bloodPressure.systolic.min,
          ranges.bloodPressure.systolic.max
        );
      }
      if (diastolic > 0 && (diastolic < ranges.bloodPressure.diastolic.min || diastolic > ranges.bloodPressure.diastolic.max)) {
        validationErrors['bloodPressure.diastolic'] = ERROR_MESSAGES.INVALID_VITAL_RANGE(
          'Diastolic BP',
          ranges.bloodPressure.diastolic.min,
          ranges.bloodPressure.diastolic.max
        );
      }
    }

    if (vitals.heartRate && vitals.heartRate > 0 && (vitals.heartRate < ranges.heartRate.min || vitals.heartRate > ranges.heartRate.max)) {
      validationErrors.heartRate = ERROR_MESSAGES.INVALID_VITAL_RANGE(
        'Heart rate',
        ranges.heartRate.min,
        ranges.heartRate.max
      );
    }

    if (vitals.temperature && vitals.temperature > 0 && (vitals.temperature < ranges.temperature.min || vitals.temperature > ranges.temperature.max)) {
      validationErrors.temperature = ERROR_MESSAGES.INVALID_VITAL_RANGE(
        'Temperature',
        ranges.temperature.min,
        ranges.temperature.max
      );
    }

    if (vitals.weight && vitals.weight > 0 && (vitals.weight < ranges.weight.min || vitals.weight > ranges.weight.max)) {
      validationErrors.weight = ERROR_MESSAGES.INVALID_VITAL_RANGE(
        'Weight',
        ranges.weight.min,
        ranges.weight.max
      );
    }

    if (vitals.height && vitals.height > 0 && (vitals.height < ranges.height.min || vitals.height > ranges.height.max)) {
      validationErrors.height = ERROR_MESSAGES.INVALID_VITAL_RANGE(
        'Height',
        ranges.height.min,
        ranges.height.max
      );
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(vitals);
  }, [vitals, onSubmit, ranges]);

  const hasAnyVitals = vitals.bloodPressure?.systolic || vitals.heartRate || vitals.temperature || vitals.weight || vitals.height;
  const isFormValid = Object.keys(errors).length === 0;

  return (
    <form className="vitals-recording-component" onSubmit={handleSubmit}>
      <h2>Patient Vital Signs</h2>
      {isOptional && (
        <p className="optional-note">This step is optional. You can skip it if vitals are not available.</p>
      )}

      <div className="vitals-grid">
        <div className="vital-group">
          <h3>Blood Pressure</h3>
          <div className="bp-inputs">
            <div className="form-group">
              <label htmlFor="systolic">Systolic (mmHg)</label>
              <input
                type="number"
                id="systolic"
                name="bloodPressure.systolic"
                value={vitals.bloodPressure?.systolic || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                min={ranges.bloodPressure.systolic.min}
                max={ranges.bloodPressure.systolic.max}
                placeholder="e.g., 120"
                className={errors['bloodPressure.systolic'] ? 'error' : ''}
              />
              {errors['bloodPressure.systolic'] && (
                <span className="error-text">{errors['bloodPressure.systolic']}</span>
              )}
            </div>
            <span className="separator">/</span>
            <div className="form-group">
              <label htmlFor="diastolic">Diastolic (mmHg)</label>
              <input
                type="number"
                id="diastolic"
                name="bloodPressure.diastolic"
                value={vitals.bloodPressure?.diastolic || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                min={ranges.bloodPressure.diastolic.min}
                max={ranges.bloodPressure.diastolic.max}
                placeholder="e.g., 80"
                className={errors['bloodPressure.diastolic'] ? 'error' : ''}
              />
              {errors['bloodPressure.diastolic'] && (
                <span className="error-text">{errors['bloodPressure.diastolic']}</span>
              )}
            </div>
          </div>
        </div>

        <div className="vital-group">
          <label htmlFor="heartRate">Heart Rate (bpm)</label>
          <input
            type="number"
            id="heartRate"
            name="heartRate"
            value={vitals.heartRate || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            min={ranges.heartRate.min}
            max={ranges.heartRate.max}
            placeholder="e.g., 72"
            className={errors.heartRate ? 'error' : ''}
          />
          {errors.heartRate && (
            <span className="error-text">{errors.heartRate}</span>
          )}
        </div>

        <div className="vital-group">
          <label htmlFor="temperature">Temperature (°C)</label>
          <input
            type="number"
            id="temperature"
            name="temperature"
            value={vitals.temperature || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            min={ranges.temperature.min}
            max={ranges.temperature.max}
            step="0.1"
            placeholder="e.g., 37.0"
            className={errors.temperature ? 'error' : ''}
          />
          {errors.temperature && (
            <span className="error-text">{errors.temperature}</span>
          )}
        </div>

        <div className="vital-group">
          <label htmlFor="weight">Weight (kg)</label>
          <input
            type="number"
            id="weight"
            name="weight"
            value={vitals.weight || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            min={ranges.weight.min}
            max={ranges.weight.max}
            step="0.1"
            placeholder="e.g., 70.5"
            className={errors.weight ? 'error' : ''}
          />
          {errors.weight && (
            <span className="error-text">{errors.weight}</span>
          )}
        </div>

        <div className="vital-group">
          <label htmlFor="height">Height (cm)</label>
          <input
            type="number"
            id="height"
            name="height"
            value={vitals.height || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            min={ranges.height.min}
            max={ranges.height.max}
            placeholder="e.g., 175"
            className={errors.height ? 'error' : ''}
          />
          {errors.height && (
            <span className="error-text">{errors.height}</span>
          )}
        </div>

        <div className="vital-group full-width">
          <label htmlFor="notes">Additional Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={vitals.notes || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Any additional observations or notes..."
            rows={3}
          />
        </div>
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn-submit"
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? 'Recording Vitals...' : 'Complete Registration'}
        </button>
        {isOptional && onSkip && (
          <button
            type="button"
            className="btn-skip"
            onClick={onSkip}
            disabled={isSubmitting}
          >
            Skip Vitals
          </button>
        )}
      </div>
    </form>
  );
};

export default VitalsRecordingComponent;
