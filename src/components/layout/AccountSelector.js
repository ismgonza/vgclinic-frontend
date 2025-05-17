// src/components/layout/AccountSelector.js
import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { useAccount } from '../../context/AccountContext';

const AccountSelector = () => {
  const { userAccounts, currentAccount, switchAccount, loading } = useAccount();

  if (loading || !currentAccount) {
    return null;
  }

  return (
    <Dropdown className="me-3">
      <Dropdown.Toggle variant="info" id="dropdown-account">
        {currentAccount.name}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {userAccounts.map(account => (
          <Dropdown.Item 
            key={account.id} 
            onClick={() => switchAccount(account.id)}
            active={account.id === currentAccount.id}
          >
            {account.name}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default AccountSelector;