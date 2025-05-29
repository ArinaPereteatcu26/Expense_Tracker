import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface TokenRequest {
  role: string;
  permissions?: string[];
  userId: number;
}

export interface TokenResponse {
  token: string;
  expiresIn: string;
  role: string;
  permissions: string[];
}

export interface User {
  userId: number;
  role: string;
  permissions: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:5055/api';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(
      this.getCurrentUserFromToken(),
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(tokenRequest: TokenRequest): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>(`${this.baseUrl}/Token`, tokenRequest)
      .pipe(
        map((response) => {
          if (response && response.token) {
            localStorage.setItem('token', response.token);
            const user: User = {
              userId: tokenRequest.userId,
              role: response.role,
              permissions: response.permissions,
            };
            localStorage.setItem('user', JSON.stringify(user));
            this.currentUserSubject.next(user);
          }
          return response;
        }),
      );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  hasPermission(permission: string): boolean {
    const user = this.currentUserValue;
    return user?.permissions.includes(permission) || false;
  }

  hasRole(role: string): boolean {
    const user = this.currentUserValue;
    return user?.role === role;
  }

  private getCurrentUserFromToken(): User | null {
    const userJson = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (userJson && token && this.isAuthenticated()) {
      return JSON.parse(userJson);
    }
    return null;
  }
}
