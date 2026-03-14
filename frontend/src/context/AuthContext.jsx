import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchMe } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('mx_token');
    if (token) {
      fetchMe()
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('mx_token');
          localStorage.removeItem('mx_user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('mx_token', token);
    localStorage.setItem('mx_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('mx_token');
    localStorage.removeItem('mx_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
