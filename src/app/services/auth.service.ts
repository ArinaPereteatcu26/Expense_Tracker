import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';

// Use consistent token key
const TOKEN_KEY = 'authToken';

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
  private apiUrl = 'http://localhost:5056';
  private isAuthenticatedSubject!: BehaviorSubject<boolean>;

  constructor(
    private http: HttpClient,
    private jwtHelper: JwtHelperService,
    private router: Router,
  ) {
    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(
      this.hasValidToken(),
    );
  }

  createUser(userData: any): Observable<any> {
    console.log(
      'Sending registration request to:',
      this.apiUrl + '/api/signup',
    );
    console.log('User data:', userData);

    return this.http.post(this.apiUrl + '/api/signup', userData).pipe(
      tap((response) => {
        console.log('Registration response received:', response);
      }),
      catchError((error) => {
        console.error('Registration request failed:', error);
        throw error;
      }),
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/api/signup`, request)
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

  isLoggedIn(): boolean {
    return localStorage.getItem(TOKEN_KEY) != null;
  }

  logout(): void {
    this.deleteToken();
    this.isAuthenticatedSubject.next(false);
    this.router.navigateByUrl('/api/signup');
  }

  private deleteToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  private saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
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
      return localStorage.getItem(TOKEN_KEY);
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
      this.saveToken(token);
      this.isAuthenticatedSubject.next(true);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  }

  private hasValidToken(): boolean {
    try {
      const token = this.getToken();

      if (!token) {
        return false;
      }

      if (!this.jwtHelper) {
        console.warn('JwtHelper not available during token validation');
        return true;
      }

      const isExpired = this.jwtHelper.isTokenExpired(token);

      if (isExpired) {
        this.logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      this.logout();
      return false;
    }
  }

  get isAuthenticated$(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

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
