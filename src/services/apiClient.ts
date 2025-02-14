import TokenService from './tokenService';

interface ApiOptions extends RequestInit {
  requiresAuth?: boolean;
}

class ApiClient {
  private static readonly BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  static async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { requiresAuth = true, ...fetchOptions } = options;

    if (requiresAuth) {
      await TokenService.refreshTokenIfNeeded();
      const token = TokenService.getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      fetchOptions.headers = {
        ...fetchOptions.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    const response = await fetch(`${this.BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'An error occurred');
    }

    return response.json();
  }

  static async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  }

  static async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${this.BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  }

  static async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${this.BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  }

  static async delete(endpoint: string): Promise<void> {
    const response = await fetch(`${this.BASE_URL}${endpoint}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Network response was not ok');
  }

  // Add other methods (PUT, DELETE, etc.) as needed
}

export { ApiClient }; 