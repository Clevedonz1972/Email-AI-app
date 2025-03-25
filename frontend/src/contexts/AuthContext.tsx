import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/user';
import TokenService from '../services/TokenService';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string, token?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        setLoading(true);
        const token = TokenService.getAccessToken();
        
        if (token) {
          // In a real app, you would validate the token with the server
          // For now, we'll just set a mock user
          setUser({
            id: 1,
            email: 'user@example.com',
            name: 'Test User'
          });
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, you would make an API call here
      // For now, we'll simulate a successful login
      const mockUser = {
        id: 1,
        email,
        name: 'Test User'
      };
      
      // Save token
      TokenService.setTokens({
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600
      });
      
      // Set user
      setUser(mockUser);
    } catch (err: any) {
      setError(err.message || 'Failed to login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, you would make an API call here
      // For now, we'll simulate a successful registration
      const mockUser = {
        id: 1,
        email,
        name
      };
      
      // Save token
      TokenService.setTokens({
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600
      });
      
      // Set user
      setUser(mockUser);
    } catch (err: any) {
      setError(err.message || 'Failed to register');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    TokenService.clearTokens();
    setUser(null);
  };

  const resetPassword = async (email: string, token?: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, you would make an API call here
      // For now, we'll just simulate success
      console.log('Password reset for:', email, 'with token:', token);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 