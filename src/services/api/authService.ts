import { ApiClient } from '../apiClient';
import type { LoginCredentials, RegisterCredentials, AuthResponse } from '@/types/auth';
import TokenService from '../tokenService';

interface LoginResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
}

export class AuthService {
  private static readonly BASE_PATH = '/auth';

  static async login(email: string, password: string): Promise<LoginResponse> {
    const response = await ApiClient.request<LoginResponse>(`${this.BASE_PATH}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    if (response.access_token) {
      localStorage.setItem('access_token', response.access_token);
    }
    
    return response;
  }

  static async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    return ApiClient.post<AuthResponse>(`${this.BASE_PATH}/register`, credentials);
  }

  static async forgotPassword(email: string): Promise<void> {
    await ApiClient.post(`${this.BASE_PATH}/forgot-password`, { email });
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    await ApiClient.post(`${this.BASE_PATH}/reset-password/${token}`, {
      new_password: newPassword
    });
  }

  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await ApiClient.post(`${this.BASE_PATH}/change-password`, {
      current_password: currentPassword,
      new_password: newPassword
    });
  }

  static async refreshToken(): Promise<AuthResponse> {
    return ApiClient.post<AuthResponse>(`${this.BASE_PATH}/refresh`);
  }

  static async logout(): Promise<void> {
    localStorage.removeItem('access_token');
    await ApiClient.post(`${this.BASE_PATH}/logout`);
  }
} 