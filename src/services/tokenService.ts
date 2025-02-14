import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number;
  sub: string;
  type: string;
}

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

class TokenService {
  private static readonly ACCESS_TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly EXPIRES_AT_KEY = 'expires_at';
  
  static setTokens(tokenData: TokenData): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokenData.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokenData.refreshToken);
    localStorage.setItem(
      this.EXPIRES_AT_KEY, 
      (Date.now() + tokenData.expiresIn * 1000).toString()
    );
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.EXPIRES_AT_KEY);
  }

  static isTokenValid(token: string): boolean {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  static async refreshTokenIfNeeded(): Promise<void> {
    const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY);
    if (!expiresAt) return;

    const shouldRefresh = Date.now() > parseInt(expiresAt) - 5 * 60 * 1000; // 5 minutes before expiry
    if (shouldRefresh) {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        this.clearTokens();
        return;
      }

      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });

        if (!response.ok) throw new Error('Failed to refresh token');

        const newTokenData: TokenData = await response.json();
        this.setTokens(newTokenData);
      } catch (error) {
        this.clearTokens();
        throw error;
      }
    }
  }
}

export default TokenService; 