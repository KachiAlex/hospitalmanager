import React from 'react';
import './AccountTypeSelector.css';

export interface AccountTypeSelectorProps {
  onSelect: (type: 'personal' | 'family') => void;
  selectedType?: 'personal' | 'family';
}

const AccountTypeSelector: React.FC<AccountTypeSelectorProps> = ({ onSelect, selectedType }) => {
  return (
    <div className="account-type-selector">
      <h2>Select Account Type</h2>
      <p className="subtitle">Choose the type of account to create</p>

      <div className="account-options">
        <div
          className={`account-option ${selectedType === 'personal' ? 'selected' : ''}`}
          onClick={() => onSelect('personal')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onSelect('personal');
            }
          }}
        >
          <div className="option-icon">👤</div>
          <h3>Personal Account</h3>
          <p>Register a single patient</p>
          <ul className="features">
            <li>Individual patient profile</li>
            <li>Personal medical records</li>
            <li>Direct appointment booking</li>
          </ul>
        </div>

        <div
          className={`account-option ${selectedType === 'family' ? 'selected' : ''}`}
          onClick={() => onSelect('family')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onSelect('family');
            }
          }}
        >
          <div className="option-icon">👨‍👩‍👧‍👦</div>
          <h3>Family Account</h3>
          <p>Register multiple family members</p>
          <ul className="features">
            <li>Primary account holder</li>
            <li>Multiple family members</li>
            <li>Shared medical history</li>
          </ul>
        </div>
      </div>

      <div className="selection-info">
        {selectedType && (
          <p className="info-text">
            {selectedType === 'personal'
              ? 'You have selected Personal Account. Click Next to continue.'
              : 'You have selected Family Account. Click Next to continue.'}
          </p>
        )}
      </div>
    </div>
  );
};

export default AccountTypeSelector;
