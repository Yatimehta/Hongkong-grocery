import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ name: 'Admin', email: 'admin@waqas.com.hk', id: '1' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Auth check bypassed for now
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('adminToken', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
