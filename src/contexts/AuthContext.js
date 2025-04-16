import React, { createContext, useState, useContext, useEffect } from 'react';
import { login, register } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const loginUser = async (credentials) => {
    try {
      const response = await login(credentials);
      if (response.success) {
        const userData = {
          firstName: response.firstName,
          lastName: response.lastName,
          email: response.email,
          token: response.token
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true };
      } else {
        return { success: false, message: response.message || 'Giriş başarısız.' };
      }
    } catch (error) {
      return { success: false, message: error.message || 'Giriş sırasında bir hata oluştu.' };
    }
  };

  const registerUser = async (userData) => {
    try {
      const response = await register(userData);
      if (response.success) {
        const newUser = {
          firstName: response.firstName,
          lastName: response.lastName,
          email: response.email,
          token: response.token
        };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        return { success: true };
      } else {
        return { success: false, message: response.message || 'Kayıt başarısız.' };
      }
    } catch (error) {
      return { success: false, message: error.message || 'Kayıt sırasında bir hata oluştu.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    loginUser,
    registerUser,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
