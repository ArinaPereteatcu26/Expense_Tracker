import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

const TOKEN_KEY = 'authToken';

// DTOs
export interface RegisterRequest {
  username: string;
  password: string;
  role?: string;
  permissions?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user?: any;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(
    this.hasValidToken(),
  );

  constructor(
    private readonly http: HttpClient,
    private readonly jwtHelper: JwtHelperService,
    private readonly router: Router,
  ) {}

  // Authentication methods
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/signup`, data)
      .pipe(tap((res) => this.handleAuthResponse(res)));
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/signin`, data)
      .pipe(tap((res) => this.handleAuthResponse(res)));
  }

  logout(): void {
    this.clearToken();
    this.isAuthenticatedSubject.next(false);
    this.router.navigateByUrl('/signin');
  }

  // Token management
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return this.hasValidToken();
  }

  get isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  // JWT token utilities
  getClaims(): any | null {
    const token = this.getToken();
    return token && !this.jwtHelper.isTokenExpired(token)
      ? this.jwtHelper.decodeToken(token)
      : null;
  }

  getUserRole(): string | null {
    return this.getClaims()?.role ?? null;
  }

  getUserPermissions(): string[] {
    const permissions = this.getClaims()?.permissions;
    return Array.isArray(permissions)
      ? permissions
      : permissions
        ? [permissions]
        : [];
  }

  hasRole(role: string): boolean {
    return this.getUserRole() === role;
  }

  hasPermission(permission: string): boolean {
    return this.getUserPermissions().includes(permission);
  }

  getTokenExpirationDate(): Date | null {
    const token = this.getToken();
    return token ? this.jwtHelper.getTokenExpirationDate(token) : null;
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    return !token || this.jwtHelper.isTokenExpired(token);
  }

  checkTokenExpiration(): boolean {
    const expirationDate = this.getTokenExpirationDate();
    if (expirationDate) {
      const timeUntilExpiry = expirationDate.getTime() - Date.now();
      // Warn if token expires in less than 5 minutes
      if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
        console.warn('Token expiring soon');
        return true;
      }
    }
    return false;
  }

  // Private methods
  private setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this.isAuthenticatedSubject.next(true);
  }

  private clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  private hasValidToken(): boolean {
    const token = this.getToken();
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }

  private handleAuthResponse(res: AuthResponse): void {
    if (res?.token) {
      this.setToken(res.token);
    }
  }
}
