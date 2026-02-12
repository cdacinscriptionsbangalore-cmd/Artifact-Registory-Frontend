import { useState, useEffect } from 'react';
import { isAuthenticated, removeAuthToken } from '@/utils/auth';

export const useAuth = () => {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = isAuthenticated();
      setAuthenticated(authStatus);
      setLoading(false);
    };

    checkAuth();

    // Listen for storage events (when cookies change in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for when we manually change auth status
    window.addEventListener('authChange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleStorageChange);
    };
  }, []);

  const logout = () => {
    removeAuthToken();
    setAuthenticated(false);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('authChange'));
  };

  const login = (token: string) => {
    setAuthToken(token);
    setAuthenticated(true);
    window.dispatchEvent(new Event('authChange'));
  };

  return {
    authenticated,
    loading,
    logout,
    login
  };
};