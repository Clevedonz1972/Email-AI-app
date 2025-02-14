import React, { createContext, useContext, useState, useCallback } from 'react';
import TokenService from '@/services/tokenService';
import { ApiClient } from '@/services/apiClient';
import { logger } from '@/utils/logger';
import { User, LoginCredentials, RegisterCredentials, AuthResponse } from '../types/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
}

interface User {
  id: string;
  email: string;
  name?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const response = await ApiClient.post<{ token: string; user: User }>('/auth/login', credentials);
      TokenService.setTokens({
        accessToken: response.token,
        refreshToken: response.token, // In a real app, you'd get a separate refresh token
        expiresIn: 3600 // 1 hour
      });
      setUser(response.user);
      setIsAuthenticated(true);
      logger.info('User logged in successfully', { email: credentials.email });
    } catch (error) {
      logger.error('Login failed', { email: credentials.email });
      throw error;
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    try {
      const response = await ApiClient.post<{ token: string; user: User }>('/auth/register', credentials);
      TokenService.setTokens({
        accessToken: response.token,
        refreshToken: response.token,
        expiresIn: 3600
      });
      setUser(response.user);
      setIsAuthenticated(true);
      logger.info('User registered successfully', { email: credentials.email });
    } catch (error) {
      logger.error('Registration failed', { email: credentials.email });
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    TokenService.clearTokens();
    setUser(null);
    setIsAuthenticated(false);
    logger.info('User logged out');
  }, []);

  const value = {
    isAuthenticated,
    user,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 