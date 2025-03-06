import { ApiClient } from './apiClient';
import type { LoginCredentials, RegisterCredentials, AuthResponse } from '@/types/auth';

export class AuthService {
  private static readonly BASE_PATH = '/auth';

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return ApiClient.post<AuthResponse>(`${this.BASE_PATH}/login`, credentials);
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
    await ApiClient.post(`${this.BASE_PATH}/logout`);
  }
} 