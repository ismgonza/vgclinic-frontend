// src/context/AccountContext.js (updated)
import React, { createContext, useState, useEffect, useContext } from 'react';
import { api, authService } from '../services/api';

const AccountContext = createContext();

export const useAccount = () => useContext(AccountContext);

export const AccountProvider = ({ children }) => {
  const [userAccounts, setUserAccounts] = useState([]);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserAccounts = async () => {
      // Only fetch accounts if the user is authenticated
      if (!authService.isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch accounts the current user has access to
        const response = await api.get('accounts/accounts/');
        setUserAccounts(response.data);
        
        // If there are accounts, set the first one as current
        if (response.data.length > 0) {
          setCurrentAccount(response.data[0]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch user accounts:', err);
        setError('Failed to load account information.');
        
        // Clear accounts if there was an error
        setUserAccounts([]);
        setCurrentAccount(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAccounts();
    
    // Set up an event listener for login/logout events
    const handleAuthChange = () => {
      fetchUserAccounts();
    };
    
    // Listen for auth-related events
    window.addEventListener('auth-change', handleAuthChange);
    
    // Clean up the event listener
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  const switchAccount = (accountId) => {
    const account = userAccounts.find(a => a.id === accountId);
    if (account) {
      setCurrentAccount(account);
    }
  };

  const value = {
    userAccounts,
    currentAccount,
    switchAccount,
    loading,
    error
  };

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  );
};