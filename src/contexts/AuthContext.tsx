import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import TokenService from '@/services/tokenService';
import { ApiClient } from '@/services/apiClient';
import { logger } from '@/utils/logger';
import { User, LoginCredentials, RegisterCredentials, AuthResponse } from '../types/auth';
import { AuthService } from '@/services/api/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('access_token'));

  // Check token on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsAuthenticated(true);
      // You could also fetch user data here
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const response = await AuthService.login(credentials.email, credentials.password);
      
      if (!response || !response.access_token) {
        throw new Error('Invalid login response');
      }
      
      TokenService.setTokens({
        accessToken: response.access_token,
        refreshToken: response.refresh_token || response.access_token,
        expiresIn: 3600
      });
      
      // Set user with minimal info from credentials
      const user: User = {
        id: '1', // This will be replaced when you fetch the actual user profile
        email: credentials.email
      };
      
      setUser(user);
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

  const forgotPassword = async (email: string) => {
    try {
      await AuthService.forgotPassword(email);
    } catch (error) {
      logger.error('Failed to send reset email', { email });
      throw error;
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      await AuthService.resetPassword(token, newPassword);
    } catch (error) {
      logger.error('Failed to reset password');
      throw error;
    }
  };

  const value = {
    isAuthenticated,
    user,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword
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