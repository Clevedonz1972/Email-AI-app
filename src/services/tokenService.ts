import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number;
  sub: string;
  type: string;
}

class TokenService {
  private static readonly ACCESS_TOKEN_KEY = 'email_ai_access_token';
  
  static setAccessToken(token: string): void {
    // Store in memory only
    sessionStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  static getAccessToken(): string | null {
    return sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static removeTokens(): void {
    sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
  }

  static isTokenValid(token: string): boolean {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  static async refreshTokenIfNeeded(): Promise<boolean> {
    const token = this.getAccessToken();
    if (!token || !this.isTokenValid(token)) {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include', // Important for cookies
        });
        
        if (response.ok) {
          const data = await response.json();
          this.setAccessToken(data.access_token);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    }
    return true;
  }
}

export default TokenService; 