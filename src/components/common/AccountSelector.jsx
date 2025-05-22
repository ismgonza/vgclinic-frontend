// src/components/common/AccountSelector.jsx
import React, { useContext } from 'react';
import { Dropdown, Spinner, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { AccountContext } from '../../contexts/AccountContext';
import { AuthContext } from '../../contexts/AuthContext';

const AccountSelector = () => {
  const { t } = useTranslation();
  const { currentUser } = useContext(AuthContext);
  const { 
    userAccounts, 
    selectedAccount, 
    loading, 
    switchAccount,
    isAccountSelected 
  } = useContext(AccountContext);

  // Don't show for staff users (they'll have their own impersonation feature later)
  if (!currentUser || currentUser.is_staff) {
    return null;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="d-flex align-items-center text-muted">
        <Spinner size="sm" className="me-2" />
        <small>Loading accounts...</small>
      </div>
    );
  }

  // No accounts available
  if (!userAccounts || userAccounts.length === 0) {
    return (
      <div className="d-flex align-items-center text-muted">
        <FontAwesomeIcon icon={faBuilding} className="me-2" />
        <small>No clinics available</small>
      </div>
    );
  }

  // Single account - just show it
  if (userAccounts.length === 1) {
    return (
      <div className="d-flex align-items-center">
        <FontAwesomeIcon icon={faBuilding} className="me-2 text-primary" />
        <div>
          <small className="text-muted d-block">Current Clinic:</small>
          <span className="fw-bold">{userAccounts[0].account_name}</span>
        </div>
      </div>
    );
  }

  // Multiple accounts - show dropdown
  return (
    <div className="d-flex align-items-center">
      <FontAwesomeIcon icon={faBuilding} className="me-2 text-primary" />
      <div>
        <small className="text-muted d-block">Current Clinic:</small>
        <Dropdown>
          <Dropdown.Toggle 
            variant="link" 
            className="p-0 text-decoration-none text-dark fw-bold"
            style={{ border: 'none', boxShadow: 'none' }}
          >
            {selectedAccount ? selectedAccount.account_name : 'Select Clinic'}
            {!isAccountSelected && (
              <Badge bg="warning" className="ms-2">!</Badge>
            )}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Header>Available Clinics</Dropdown.Header>
            {userAccounts.map((account) => (
              <Dropdown.Item
                key={account.account_id}
                onClick={() => switchAccount(account)}
                className="d-flex justify-content-between align-items-center"
              >
                <div>
                  <div className="fw-bold">{account.account_name}</div>
                  <small className="text-muted">{account.account_email}</small>
                </div>
                {selectedAccount?.account_id === account.account_id && (
                  <FontAwesomeIcon icon={faCheck} className="text-success" />
                )}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
};

export default AccountSelector;