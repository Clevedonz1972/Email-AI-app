import { logger } from '@/utils/logger';

interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export class ApiClient {
  private static readonly BASE_URL = process.env.REACT_APP_API_URL || '/api';
  private static readonly TIMEOUT = 15000; // 15 seconds

  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        message: 'An unexpected error occurred'
      }));

      throw new Error(error.message);
    }

    return response.json();
  }

  private static async fetchWithTimeout(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), this.TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (err: unknown) {
      clearTimeout(id);
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw err;
    }
  }

  static async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await this.fetchWithTimeout(`${this.BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      logger.error('GET request failed', { endpoint, error });
      throw error;
    }
  }

  static async post<T>(endpoint: string, data?: unknown): Promise<T> {
    try {
      const response = await this.fetchWithTimeout(`${this.BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      logger.error('POST request failed', { endpoint, error });
      throw error;
    }
  }
} 