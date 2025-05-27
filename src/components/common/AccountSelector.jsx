// src/components/common/AccountSelector.jsx - Beautified version
import React, { useContext } from 'react';
import { Dropdown, Spinner, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faCheck, faChevronDown, faMapMarkerAlt, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { AccountContext } from '../../contexts/AccountContext';
import { AuthContext } from '../../contexts/AuthContext';
import './AccountSelector.css'; // We'll need to create this

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
      <div className="account-selector-loading">
        <Spinner size="sm" className="me-2" />
        <small>Loading clinics...</small>
      </div>
    );
  }

  // No accounts available
  if (!userAccounts || userAccounts.length === 0) {
    return (
      <div className="account-selector-empty">
        <FontAwesomeIcon icon={faBuilding} className="me-2" />
        <small>{t('navigation.acctSelector.noClinic')}</small>
      </div>
    );
  }

  // Single account - beautiful display
  if (userAccounts.length === 1) {
    return (
      <div className="account-selector-single">
        <div className="account-icon">
          <FontAwesomeIcon icon={faBuilding} />
        </div>
        <div className="account-info">
          <div className="account-label">{t('navigation.acctSelector.current')}</div>
          <div className="account-name">{userAccounts[0].account_name}</div>
        </div>
      </div>
    );
  }

  // Multiple accounts - beautiful dropdown
  return (
    <div className="account-selector-dropdown">
      <Dropdown align="start">
        <Dropdown.Toggle 
          variant="outline-light" 
          className="account-dropdown-toggle"
          id="account-dropdown"
        >
          <div className="selected-account">
            <div className="account-icon">
              <FontAwesomeIcon icon={faBuilding} />
            </div>
            <div className="account-info">
              <div className="account-label">{t('navigation.acctSelector.current')}</div>
              <div className="account-name">
                {selectedAccount ? selectedAccount.account_name : 'Select Clinic'}
                {!isAccountSelected && (
                  <Badge bg="warning" className="ms-2">!</Badge>
                )}
              </div>
            </div>
            <FontAwesomeIcon icon={faChevronDown} className="dropdown-arrow" />
          </div>
        </Dropdown.Toggle>

        <Dropdown.Menu className="account-dropdown-menu">
          <div className="dropdown-header">
            <FontAwesomeIcon icon={faBuilding} className="me-2" />
            {t('navigation.acctSelector.available')}
          </div>
          <div className="dropdown-divider"></div>
          
          {userAccounts.map((account) => (
            <Dropdown.Item
              key={account.account_id}
              onClick={() => switchAccount(account)}
              className={`account-dropdown-item ${selectedAccount?.account_id === account.account_id ? 'active' : ''}`}
            >
              <div className="account-option">
                <div className="account-main">
                  <div className="account-name-option">
                    {account.account_name}
                    {selectedAccount?.account_id === account.account_id && (
                      <FontAwesomeIcon icon={faCheck} className="check-icon" />
                    )}
                  </div>
                  <div className="account-details">
                    <div className="account-email">
                      <FontAwesomeIcon icon={faEnvelope} className="detail-icon" />
                      {account.account_email}
                    </div>
                  </div>
                </div>
              </div>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default AccountSelector;