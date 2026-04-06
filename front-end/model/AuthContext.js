import React, { createContext, useState } from 'react';
import { loginUser, registerUser } from '../services/authService';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [homes, setHomes] = useState([]);
  const [selectedHome, setSelectedHome] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  const login = async ({ identifier, password }) => {
    setLoading(true);

    try {
      const response = await loginUser({ identifier, password });

      if (response.success) {
        setUser(response.user);
        setHomes(response.homes || []);
        setIsAuthenticated(true);

        return {
          success: true,
          user: response.user,
        };
      }

      return {
        success: false,
        message: response.message || 'Error al iniciar sesión',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Ocurrió un error inesperado',
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);

    try {
      const response = await registerUser(formData);

      if (response.success) {
        return {
          success: true,
          message: response.message,
          user: response.user,
          home: response.home,
        };
      }

      return {
        success: false,
        message: response.message || 'Error al registrarse',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Ocurrió un error inesperado en el registro',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setHomes([]);
    setSelectedHome(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        homes,
        selectedHome,
        setSelectedHome,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}