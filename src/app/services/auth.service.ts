// auth.service.ts - Fixed version
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
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
    this.isAuthenticatedSubject.next(false);
  }

  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUserFromToken(): any {
    const token = this.getToken();
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      return this.jwtHelper.decodeToken(token);
    }
    return null;
  }

  getUserRole(): string | null {
    const user = this.getUserFromToken();
    return user?.role || null;
  }

  getUserPermissions(): string[] {
    const user = this.getUserFromToken();
    return user?.permission ? [].concat(user.permission) : [];
  }

  hasPermission(permission: string): boolean {
    const permissions = this.getUserPermissions();
    return permissions.includes(permission);
  }

  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.isAuthenticatedSubject.next(true);
  }

  private hasValidToken(): boolean {
    const token = this.getToken();
    // Add null check for jwtHelper to prevent errors during initialization
    if (!token || !this.jwtHelper) {
      return false;
    }

    try {
      return !this.jwtHelper.isTokenExpired(token);
    } catch (error) {
      console.error('Error checking token validity:', error);
      return false;
    }
  }

  // Observable for authentication status
  get isAuthenticated$(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  // Token expiration check
  getTokenExpirationDate(): Date | null {
    const token = this.getToken();
    return token && this.jwtHelper
      ? this.jwtHelper.getTokenExpirationDate(token)
      : null;
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token || !this.jwtHelper) {
      return true;
    }

    try {
      return this.jwtHelper.isTokenExpired(token);
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }
}
