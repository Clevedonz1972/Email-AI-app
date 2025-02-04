import TokenService from './tokenService';

interface ApiOptions extends RequestInit {
  requiresAuth?: boolean;
}

class ApiClient {
  private static readonly BASE_URL = process.env.REACT_APP_API_URL;

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

  static async get<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  static async post<T>(endpoint: string, data: any, options: ApiOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Add other methods (PUT, DELETE, etc.) as needed
}

export default ApiClient; 