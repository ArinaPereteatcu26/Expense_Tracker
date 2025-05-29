import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface TokenRequest {
  username: string;
  role: string;
  permissions?: string[];
}

export interface TokenResponse {
  token: string;
  expiresIn: string;
  role: string;
  permissions: string[];
}

export interface User {
  username: string;
  role: string;
  permissions: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:5056/api';
  private currentUserSubject = new BehaviorSubject<User | null>(
    this.getCurrentUserFromToken(),
  );
  public currentUser = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(tokenRequest: TokenRequest): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>(`${this.baseUrl}/Token`, tokenRequest)
      .pipe(
        map((response) => {
          if (response?.token) {
            this.saveTokenAndUser(response, tokenRequest.username);
          }
          return response;
        }),
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Math.floor(Date.now() / 1000);
    } catch {
      return false;
    }
  }

  hasPermission(permission: string): boolean {
    return this.currentUserValue?.permissions.includes(permission) || false;
  }

  hasRole(role: string): boolean {
    return this.currentUserValue?.role === role;
  }

  private saveTokenAndUser(response: TokenResponse, username: string): void {
    localStorage.setItem('token', response.token);
    const user: User = {
      username,
      role: response.role,
      permissions: response.permissions,
    };
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private getCurrentUserFromToken(): User | null {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');

    if (token && userJson && this.isAuthenticated()) {
      try {
        return JSON.parse(userJson);
      } catch {
        return null;
      }
    }
    return null;
  }
}
