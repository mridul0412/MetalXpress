import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchMe, checkSubscription } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null); // { plan: 'free'|'pro'|'business', active: bool }
  const [loading, setLoading] = useState(true);

  const refreshSubscription = useCallback(async () => {
    try {
      const res = await checkSubscription();
      setSubscription(res.data);
    } catch {
      setSubscription({ plan: 'free', active: false });
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetchMe();
      setUser(res.data);
      localStorage.setItem('mx_user', JSON.stringify(res.data));
    } catch {
      // token invalid — log out
      localStorage.removeItem('mx_token');
      localStorage.removeItem('mx_user');
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('mx_token');
    if (token) {
      Promise.all([
        fetchMe().then(res => setUser(res.data)).catch(() => {
          localStorage.removeItem('mx_token');
          localStorage.removeItem('mx_user');
        }),
        refreshSubscription(),
      ]).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [refreshSubscription]);

  const login = (token, userData) => {
    localStorage.setItem('mx_token', token);
    localStorage.setItem('mx_user', JSON.stringify(userData));
    setUser(userData);
    // Fetch subscription after login
    setTimeout(refreshSubscription, 100);
  };

  const logout = () => {
    localStorage.removeItem('mx_token');
    localStorage.removeItem('mx_user');
    setUser(null);
    setSubscription(null);
  };

  return (
    <AuthContext.Provider value={{ user, subscription, loading, login, logout, refreshSubscription, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
