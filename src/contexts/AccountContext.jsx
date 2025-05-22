// src/contexts/AccountContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import accountsService from '../services/accounts.service';

export const AccountContext = createContext();

export const AccountProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [userAccounts, setUserAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user's accounts when user changes
  useEffect(() => {
    if (currentUser && !currentUser.is_staff) {
      loadUserAccounts();
    } else if (currentUser && currentUser.is_staff) {
      // For staff users, we'll handle this differently later
      setUserAccounts([]);
      setSelectedAccount(null);
      setLoading(false);
    } else {
      // No user, clear everything
      setUserAccounts([]);
      setSelectedAccount(null);
      setLoading(false);
    }
  }, [currentUser]);

  // Load accounts from localStorage on mount
  useEffect(() => {
    const savedAccountId = localStorage.getItem('selectedAccountId');
    if (savedAccountId && userAccounts.length > 0) {
      const savedAccount = userAccounts.find(acc => acc.account_id === savedAccountId);
      if (savedAccount) {
        setSelectedAccount(savedAccount);
      }
    }
  }, [userAccounts]);

  const loadUserAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get accounts the user has access to
      const accounts = await accountsService.getAccounts();
      setUserAccounts(accounts);
      
      // Auto-select first account if none selected
      if (accounts.length > 0 && !selectedAccount) {
        const firstAccount = accounts[0];
        setSelectedAccount(firstAccount);
        localStorage.setItem('selectedAccountId', firstAccount.account_id);
      }
      
    } catch (err) {
      console.error('Error loading user accounts:', err);
      setError('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const switchAccount = (account) => {
    setSelectedAccount(account);
    localStorage.setItem('selectedAccountId', account.account_id);
  };

  const clearAccount = () => {
    setSelectedAccount(null);
    localStorage.removeItem('selectedAccountId');
  };

  const value = {
    userAccounts,
    selectedAccount,
    loading,
    error,
    switchAccount,
    clearAccount,
    isAccountSelected: !!selectedAccount
  };

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  );
};