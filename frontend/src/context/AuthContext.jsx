import React, { createContext, useState, useEffect } from 'react';
import { loginUser, registerUser, fetchCurrentUser } from '../services/authService';
import { ROLE_DASHBOARDS } from '../utils/constants';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('studyhub_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('studyhub_token');
      if (storedToken) {
        try {
          const res = await fetchCurrentUser();
          setUser(res.data.user);
          setToken(storedToken);
        } catch (error) {
          console.error('Session expired or invalid token:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const res = await loginUser(credentials);
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('studyhub_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const res = await registerUser(userData);
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('studyhub_token', newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('studyhub_token');
    setToken(null);
    setUser(null);
  };

  const getDashboardRoute = (roleName) => {
    const normalizedRole = (roleName || user?.role_name || '').toUpperCase();
    return ROLE_DASHBOARDS[normalizedRole] || '/student/dashboard';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        getDashboardRoute,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
