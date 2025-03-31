import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import TokenService from './tokenService';

interface ApiOptions extends RequestInit {
  requiresAuth?: boolean;
}

interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  withCredentials?: boolean;
}

class ApiClient {
  // Use empty string for BASE_URL to enable relative URLs that work with the proxy
  public static readonly BASE_URL = '';
  
  // Utility method to get authentication token from local storage
  private static getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }
  
  // Add authorization header if token exists
  private static getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };
    
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }
  
  // Handle API errors uniformly
  private static handleError(error: AxiosError): never {
    console.error('API request failed:', error);
    
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      if (status === 401) {
        // Handle authentication errors
        console.warn('Authentication error, redirecting to login');
        // Clear local storage and redirect to login
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
      
      throw new Error(`API error: ${status} ${error.response.statusText}`);
    } else if (error.request) {
      // Request made but no response received
      throw new Error('No response received from server');
    } else {
      // Error in setting up the request
      throw new Error(`Request setup error: ${error.message}`);
    }
  }

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

    // Use relative URL path when in Docker
    const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }
      
      console.error(`API Error (${response.status}): ${errorMessage}`);
      throw new Error(errorMessage);
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