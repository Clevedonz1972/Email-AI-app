interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

class TokenService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly EXPIRES_AT_KEY = 'expires_at';

  setTokens(tokenData: TokenData): void {
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expiresIn);
    
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokenData.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokenData.refreshToken);
    localStorage.setItem(this.EXPIRES_AT_KEY, expiresAt.toISOString());
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.EXPIRES_AT_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY);
    
    if (!token || !expiresAt) {
      return false;
    }
    
    return new Date() < new Date(expiresAt);
  }

  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY);
    
    if (!expiresAt) {
      return true;
    }
    
    return new Date() >= new Date(expiresAt);
  }
}

export default new TokenService(); 