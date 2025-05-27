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

  // Handle account selection after accounts are loaded
  useEffect(() => {
    if (userAccounts.length > 0 && !selectedAccount) {
      const savedAccountId = localStorage.getItem('selectedAccountId');
      
      if (savedAccountId) {
        // Try to find the saved account (convert both to strings for comparison)
        const savedAccount = userAccounts.find(acc => 
          String(acc.account_id) === String(savedAccountId)
        );
        
        if (savedAccount) {
          setSelectedAccount(savedAccount);
        } else {
          // Saved account not found, auto-select first account
          const firstAccount = userAccounts[0];
          setSelectedAccount(firstAccount);
          localStorage.setItem('selectedAccountId', String(firstAccount.account_id));
        }
      } else {
        // No saved account, auto-select first account
        const firstAccount = userAccounts[0];
        setSelectedAccount(firstAccount);
        localStorage.setItem('selectedAccountId', String(firstAccount.account_id));
      }
    }
  }, [userAccounts, selectedAccount]);

  const loadUserAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get accounts the user has access to
      const accounts = await accountsService.getAccounts();
      setUserAccounts(accounts);
      
    } catch (err) {
      setError('Failed to load accounts');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const switchAccount = (account) => {
    setSelectedAccount(account);
    localStorage.setItem('selectedAccountId', String(account.account_id));
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