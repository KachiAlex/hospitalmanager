import React, { useState, useCallback } from 'react';
import { validatePatientData } from './utils/validation';
import './PersonalRegistrationForm.css';

export interface PersonalRegistrationFormProps {
  onSubmit: (data: Record<string, any>) => void;
  isSubmitting: boolean;
  initialData?: Record<string, any>;
}

const PersonalRegistrationForm: React.FC<PersonalRegistrationFormProps> = ({
  onSubmit,
  isSubmitting,
  initialData = {},
}) => {
  const [formData, setFormData] = useState({
    firstName: initialData.firstName || '',
    middleName: initialData.middleName || '',
    lastName: initialData.lastName || '',
    gender: initialData.gender || '',
    dateOfBirth: initialData.dateOfBirth || '',
    phone: initialData.phone || '',
    email: initialData.email || '',
    address: initialData.address || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation
    if (touched[name]) {
      const fieldErrors = validatePatientData({ ...formData, [name]: value });
      setErrors(fieldErrors);
    }
  }, [formData, touched]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const fieldErrors = validatePatientData(formData);
    setErrors(fieldErrors);
  }, [formData]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validatePatientData(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      return;
    }

    onSubmit(formData);
  }, [formData, onSubmit]);

  const isFormValid = Object.keys(errors).length === 0 && 
    formData.firstName && 
    formData.lastName && 
    formData.gender && 
    formData.dateOfBirth;

  return (
    <form className="personal-registration-form" onSubmit={handleSubmit}>
      <h2>Personal Patient Information</h2>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstName">First Name *</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.firstName ? 'error' : ''}
            required
          />
          {errors.firstName && <span className="error-text">{errors.firstName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="middleName">Middle Name</label>
          <input
            type="text"
            id="middleName"
            name="middleName"
            value={formData.middleName}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last Name *</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.lastName ? 'error' : ''}
            required
          />
          {errors.lastName && <span className="error-text">{errors.lastName}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="gender">Gender *</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.gender ? 'error' : ''}
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && <span className="error-text">{errors.gender}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="dateOfBirth">Date of Birth *</label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.dateOfBirth ? 'error' : ''}
            required
          />
          {errors.dateOfBirth && <span className="error-text">{errors.dateOfBirth}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.phone ? 'error' : ''}
          />
          {errors.phone && <span className="error-text">{errors.phone}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>
      </div>

      <div className="form-group full-width">
        <label htmlFor="address">Address</label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.address ? 'error' : ''}
        />
        {errors.address && <span className="error-text">{errors.address}</span>}
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn-submit"
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? 'Creating Patient...' : 'Continue to Vitals'}
        </button>
      </div>
    </form>
  );
};

export default PersonalRegistrationForm;
