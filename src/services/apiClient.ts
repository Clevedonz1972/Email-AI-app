import TokenService from './tokenService';

interface ApiOptions extends RequestInit {
  requiresAuth?: boolean;
}

class ApiClient {
  static readonly BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  static async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { requiresAuth = true, ...fetchOptions } = options;

    if (requiresAuth) {
      const token = localStorage.getItem('access_token');
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
    return this.request<T>(endpoint, { method: 'GET' });
  }

  static async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async delete(endpoint: string): Promise<void> {
    await this.request(endpoint, { method: 'DELETE' });
  }

  // Add other methods (PUT, DELETE, etc.) as needed
}

export { ApiClient };
export type { ApiOptions }; 