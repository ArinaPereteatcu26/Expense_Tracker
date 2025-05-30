// auth.service.ts - Fixed version with better error handling
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';

interface RegisterRequest {
  username: string;
  role?: string;
  permissions?: string[];
}

interface LoginRequest {
  username: string;
  role: string;
  permissions?: string[];
}

interface AuthResponse {
  token: string;
  user?: any;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5056'; // Your ASP.NET backend URL
  private tokenKey = 'authToken';
  private isAuthenticatedSubject!: BehaviorSubject<boolean>;

  constructor(
    private http: HttpClient,
    private jwtHelper: JwtHelperService,
  ) {
    // Initialize the BehaviorSubject AFTER dependencies are injected
    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(
      this.hasValidToken(),
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/api/auth/register`, request)
      .pipe(
        tap((response) => {
          if (response.token) {
            this.setToken(response.token);
          }
        }),
        catchError((error) => {
          console.error('Registration failed:', error);
          throw error;
        }),
      );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/api/auth/login`, request)
      .pipe(
        tap((response) => {
          if (response.token) {
            this.setToken(response.token);
          }
        }),
        catchError((error) => {
          console.error('Login failed:', error);
          throw error;
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    // Also remove any other user-related data
    localStorage.removeItem('currentUser');
    this.isAuthenticatedSubject.next(false);
  }

  isAuthenticated(): boolean {
    try {
      return this.hasValidToken();
    } catch (error) {
      console.warn('Error checking authentication status:', error);
      return false;
    }
  }

  getToken(): string | null {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch (error) {
      console.warn('Error getting token from localStorage:', error);
      return null;
    }
  }

  getUserFromToken(): any {
    try {
      const token = this.getToken();
      if (token && this.jwtHelper && !this.jwtHelper.isTokenExpired(token)) {
        return this.jwtHelper.decodeToken(token);
      }
      return null;
    } catch (error) {
      console.warn('Error decoding token:', error);
      return null;
    }
  }

  getUserRole(): string | null {
    try {
      const user = this.getUserFromToken();
      return user?.role || null;
    } catch (error) {
      console.warn('Error getting user role:', error);
      return null;
    }
  }

  getUserPermissions(): string[] {
    try {
      const user = this.getUserFromToken();
      if (!user?.permission) return [];

      // Handle both single permission and array of permissions
      return Array.isArray(user.permission)
        ? user.permission
        : [user.permission];
    } catch (error) {
      console.warn('Error getting user permissions:', error);
      return [];
    }
  }

  hasPermission(permission: string): boolean {
    try {
      const permissions = this.getUserPermissions();
      return permissions.includes(permission);
    } catch (error) {
      console.warn('Error checking permission:', error);
      return false;
    }
  }

  hasRole(role: string): boolean {
    try {
      const userRole = this.getUserRole();
      return userRole === role;
    } catch (error) {
      console.warn('Error checking role:', error);
      return false;
    }
  }

  private setToken(token: string): void {
    try {
      localStorage.setItem(this.tokenKey, token);
      this.isAuthenticatedSubject.next(true);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  }

  private hasValidToken(): boolean {
    try {
      const token = this.getToken();

      // If no token exists, return false
      if (!token) {
        return false;
      }

      // If jwtHelper is not available (during initialization), assume token is valid
      if (!this.jwtHelper) {
        console.warn('JwtHelper not available during token validation');
        return true;
      }

      // Check if token is expired
      const isExpired = this.jwtHelper.isTokenExpired(token);

      // If token is expired, clean up
      if (isExpired) {
        this.logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      // If there's an error, assume token is invalid and clean up
      this.logout();
      return false;
    }
  }

  // Observable for authentication status
  get isAuthenticated$(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  // Token expiration check
  getTokenExpirationDate(): Date | null {
    try {
      const token = this.getToken();
      return token && this.jwtHelper
        ? this.jwtHelper.getTokenExpirationDate(token)
        : null;
    } catch (error) {
      console.warn('Error getting token expiration date:', error);
      return null;
    }
  }

  isTokenExpired(): boolean {
    try {
      const token = this.getToken();
      if (!token || !this.jwtHelper) {
        return true;
      }

      return this.jwtHelper.isTokenExpired(token);
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }
}
