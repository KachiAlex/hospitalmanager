import React, { useState, useCallback } from 'react';
import { validatePatientData } from './utils/validation';
import './FamilyRegistrationForm.css';

export interface FamilyMember {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  relationship: string;
}

export interface FamilyRegistrationFormProps {
  onSubmit: (data: Record<string, any>) => void;
  isSubmitting: boolean;
  initialData?: Record<string, any>;
}

const FamilyRegistrationForm: React.FC<FamilyRegistrationFormProps> = ({
  onSubmit,
  isSubmitting,
  initialData = {},
}) => {
  const [primaryMember, setPrimaryMember] = useState({
    firstName: initialData.firstName || '',
    middleName: initialData.middleName || '',
    lastName: initialData.lastName || '',
    gender: initialData.gender || '',
    dateOfBirth: initialData.dateOfBirth || '',
    phone: initialData.phone || '',
    email: initialData.email || '',
    address: initialData.address || '',
  });

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(
    initialData.familyMembers || []
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [memberErrors, setMemberErrors] = useState<Record<number, Record<string, string>>>({});

  const handlePrimaryChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPrimaryMember(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation
    if (touched[name]) {
      const fieldErrors = validatePatientData({ ...primaryMember, [name]: value });
      setErrors(fieldErrors);
    }
  }, [primaryMember, touched]);

  const handlePrimaryBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const fieldErrors = validatePatientData(primaryMember);
    setErrors(fieldErrors);
  }, [primaryMember]);

  const handleAddFamilyMember = useCallback(() => {
    const newMember: FamilyMember = {
      firstName: '',
      middleName: '',
      lastName: '',
      gender: '',
      dateOfBirth: '',
      relationship: '',
    };
    setFamilyMembers(prev => [...prev, newMember]);
  }, []);

  const handleRemoveFamilyMember = useCallback((index: number) => {
    setFamilyMembers(prev => prev.filter((_, i) => i !== index));
    setMemberErrors(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  }, []);

  const handleFamilyMemberChange = useCallback((index: number, field: string, value: string) => {
    setFamilyMembers(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });

    // Real-time validation for family member
    const memberData = { ...familyMembers[index], [field]: value };
    const memberFieldErrors = validateFamilyMember(memberData);
    setMemberErrors(prev => ({
      ...prev,
      [index]: memberFieldErrors,
    }));
  }, [familyMembers]);

  const validateFamilyMember = (member: Partial<FamilyMember>): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!member.firstName || member.firstName.trim() === '') {
      errors.firstName = 'First name is required';
    }

    if (!member.lastName || member.lastName.trim() === '') {
      errors.lastName = 'Last name is required';
    }

    if (!member.gender || member.gender.trim() === '') {
      errors.gender = 'Gender is required';
    }

    if (!member.dateOfBirth || member.dateOfBirth.trim() === '') {
      errors.dateOfBirth = 'Date of birth is required';
    } else {
      const dob = new Date(member.dateOfBirth);
      const today = new Date();
      if (dob > today) {
        errors.dateOfBirth = 'Date of birth cannot be in the future';
      }
    }

    if (!member.relationship || member.relationship.trim() === '') {
      errors.relationship = 'Relationship is required';
    }

    return errors;
  };

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate primary member
    const primaryErrors = validatePatientData(primaryMember);
    if (Object.keys(primaryErrors).length > 0) {
      setErrors(primaryErrors);
      setTouched(Object.keys(primaryMember).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      return;
    }

    // Validate family members
    const allMemberErrors: Record<number, Record<string, string>> = {};
    let hasErrors = false;

    familyMembers.forEach((member, index) => {
      const memberFieldErrors = validateFamilyMember(member);
      if (Object.keys(memberFieldErrors).length > 0) {
        allMemberErrors[index] = memberFieldErrors;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setMemberErrors(allMemberErrors);
      return;
    }

    // Ensure at least one family member is added
    if (familyMembers.length === 0) {
      setErrors({ familyMembers: 'Please add at least one family member' });
      return;
    }

    onSubmit({
      ...primaryMember,
      familyMembers,
    });
  }, [primaryMember, familyMembers, onSubmit]);

  const isPrimaryValid = Object.keys(errors).length === 0 && 
    primaryMember.firstName && 
    primaryMember.lastName && 
    primaryMember.gender && 
    primaryMember.dateOfBirth;

  const areFamilyMembersValid = familyMembers.length > 0 && 
    familyMembers.every(member => Object.keys(validateFamilyMember(member)).length === 0);

  const isFormValid = isPrimaryValid && areFamilyMembersValid;

  return (
    <form className="family-registration-form" onSubmit={handleSubmit}>
      <h2>Family Account Registration</h2>

      <div className="primary-member-section">
        <h3>Primary Account Holder</h3>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name *</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={primaryMember.firstName}
              onChange={handlePrimaryChange}
              onBlur={handlePrimaryBlur}
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
              value={primaryMember.middleName}
              onChange={handlePrimaryChange}
              onBlur={handlePrimaryBlur}
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name *</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={primaryMember.lastName}
              onChange={handlePrimaryChange}
              onBlur={handlePrimaryBlur}
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
              value={primaryMember.gender}
              onChange={handlePrimaryChange}
              onBlur={handlePrimaryBlur}
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
              value={primaryMember.dateOfBirth}
              onChange={handlePrimaryChange}
              onBlur={handlePrimaryBlur}
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
              value={primaryMember.phone}
              onChange={handlePrimaryChange}
              onBlur={handlePrimaryBlur}
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
              value={primaryMember.email}
              onChange={handlePrimaryChange}
              onBlur={handlePrimaryBlur}
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
            value={primaryMember.address}
            onChange={handlePrimaryChange}
            onBlur={handlePrimaryBlur}
            className={errors.address ? 'error' : ''}
          />
          {errors.address && <span className="error-text">{errors.address}</span>}
        </div>
      </div>

      <div className="family-members-section">
        <div className="section-header">
          <h3>Family Members</h3>
          <button
            type="button"
            className="btn-add-member"
            onClick={handleAddFamilyMember}
          >
            + Add Family Member
          </button>
        </div>

        {errors.familyMembers && (
          <div className="error-message">{errors.familyMembers}</div>
        )}

        {familyMembers.length === 0 ? (
          <div className="no-members-message">
            No family members added yet. Click "Add Family Member" to add someone.
          </div>
        ) : (
          <div className="family-members-list">
            {familyMembers.map((member, index) => (
              <div key={index} className="family-member-card">
                <div className="member-header">
                  <h4>Family Member {index + 1}</h4>
                  <button
                    type="button"
                    className="btn-remove-member"
                    onClick={() => handleRemoveFamilyMember(index)}
                  >
                    Remove
                  </button>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor={`member-${index}-firstName`}>First Name *</label>
                    <input
                      type="text"
                      id={`member-${index}-firstName`}
                      value={member.firstName}
                      onChange={(e) => handleFamilyMemberChange(index, 'firstName', e.target.value)}
                      className={memberErrors[index]?.firstName ? 'error' : ''}
                      required
                    />
                    {memberErrors[index]?.firstName && (
                      <span className="error-text">{memberErrors[index].firstName}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor={`member-${index}-middleName`}>Middle Name</label>
                    <input
                      type="text"
                      id={`member-${index}-middleName`}
                      value={member.middleName}
                      onChange={(e) => handleFamilyMemberChange(index, 'middleName', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor={`member-${index}-lastName`}>Last Name *</label>
                    <input
                      type="text"
                      id={`member-${index}-lastName`}
                      value={member.lastName}
                      onChange={(e) => handleFamilyMemberChange(index, 'lastName', e.target.value)}
                      className={memberErrors[index]?.lastName ? 'error' : ''}
                      required
                    />
                    {memberErrors[index]?.lastName && (
                      <span className="error-text">{memberErrors[index].lastName}</span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor={`member-${index}-gender`}>Gender *</label>
                    <select
                      id={`member-${index}-gender`}
                      value={member.gender}
                      onChange={(e) => handleFamilyMemberChange(index, 'gender', e.target.value)}
                      className={memberErrors[index]?.gender ? 'error' : ''}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {memberErrors[index]?.gender && (
                      <span className="error-text">{memberErrors[index].gender}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor={`member-${index}-dateOfBirth`}>Date of Birth *</label>
                    <input
                      type="date"
                      id={`member-${index}-dateOfBirth`}
                      value={member.dateOfBirth}
                      onChange={(e) => handleFamilyMemberChange(index, 'dateOfBirth', e.target.value)}
                      className={memberErrors[index]?.dateOfBirth ? 'error' : ''}
                      required
                    />
                    {memberErrors[index]?.dateOfBirth && (
                      <span className="error-text">{memberErrors[index].dateOfBirth}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor={`member-${index}-relationship`}>Relationship *</label>
                    <select
                      id={`member-${index}-relationship`}
                      value={member.relationship}
                      onChange={(e) => handleFamilyMemberChange(index, 'relationship', e.target.value)}
                      className={memberErrors[index]?.relationship ? 'error' : ''}
                      required
                    >
                      <option value="">Select Relationship</option>
                      <option value="spouse">Spouse</option>
                      <option value="child">Child</option>
                      <option value="parent">Parent</option>
                      <option value="sibling">Sibling</option>
                      <option value="grandparent">Grandparent</option>
                      <option value="other">Other</option>
                    </select>
                    {memberErrors[index]?.relationship && (
                      <span className="error-text">{memberErrors[index].relationship}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn-submit"
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? 'Creating Family Account...' : 'Continue to Vitals'}
        </button>
      </div>
    </form>
  );
};

export default FamilyRegistrationForm;
