import { apiRequest } from './queryClient';

export interface User {
  id: string;
  email: string;
  name?: string;
  lastLogin?: string;
}

export interface AuthTokens {
  token: string;
  user: User;
  cognitoTokens: {
    accessToken: string;
    idToken: string;
    refreshToken: string;
  };
}

class AuthService {
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  setAuth(tokens: AuthTokens): void {
    localStorage.setItem(this.tokenKey, tokens.token);
    localStorage.setItem(this.userKey, JSON.stringify(tokens.user));
  }

  clearAuth(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  async signUp(email: string, password: string, name: string) {
    const response = await apiRequest('POST', '/api/auth/signup', {
      email,
      password,
      name,
    });
    return response.json();
  }

  async confirmSignUp(email: string, confirmationCode: string) {
    const response = await apiRequest('POST', '/api/auth/confirm-signup', {
      email,
      confirmationCode,
    });
    return response.json();
  }

  async signIn(email: string, password: string): Promise<AuthTokens> {
    const response = await apiRequest('POST', '/api/auth/signin', {
      email,
      password,
    });
    const data = await response.json();
    this.setAuth(data);
    return data;
  }

  async signOut() {
    const token = this.getToken();
    if (token) {
      try {
        await apiRequest('POST', '/api/auth/signout', {}, {
          'Authorization': `Bearer ${token}`,
        });
      } catch (error) {
        console.error('Sign out error:', error);
      }
    }
    this.clearAuth();
  }

  async forgotPassword(email: string) {
    const response = await apiRequest('POST', '/api/auth/forgot-password', {
      email,
    });
    return response.json();
  }

  async resetPassword(email: string, confirmationCode: string, newPassword: string) {
    const response = await apiRequest('POST', '/api/auth/reset-password', {
      email,
      confirmationCode,
      newPassword,
    });
    return response.json();
  }

  async getCurrentUser(): Promise<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await apiRequest('GET', '/api/auth/me', undefined, {
      'Authorization': `Bearer ${token}`,
    });
    const data = await response.json();
    return data.user;
  }

  // Add Authorization header to requests
  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}

export const authService = new AuthService();