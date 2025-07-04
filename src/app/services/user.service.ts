import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { tap } from 'rxjs/operators';

export interface User {
  id: string;
  name: string;
  username?: string;
  email?: string;
  createdAt: number;
  role?: string;
  permissions?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly USER_KEY = 'user_profile';
  private readonly BUDGETS_KEY = 'budget_data';
  private readonly EXPENSES_KEY = 'expense_data';

  private userSubject = new BehaviorSubject<User | null>(null);
  private showDeleteConfirmationSubject = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    // Load user profile when service initializes
    this.initializeUserProfile();
  }

  // Initialize user profile from token or storage
  private initializeUserProfile(): void {
    if (this.authService.isLoggedIn()) {
      const tokenUser = this.authService.getClaims();
      if (tokenUser) {
        // Create user object from token data
        const user: User = {
          id: tokenUser.sub || tokenUser.userId || tokenUser.id,
          name: tokenUser.name || tokenUser.username,
          username: tokenUser.username,
          email: tokenUser.email,
          createdAt: tokenUser.iat ? tokenUser.iat * 1000 : Date.now(),
          role: tokenUser.role,
          permissions: tokenUser.permissions || [],
        };
        this.userSubject.next(user);
      } else {
        // Fallback: try to load from localStorage
        this.loadUserFromStorage();
      }
    }
  }

  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem(this.USER_KEY);
    if (storedUser && this.authService.isLoggedIn()) {
      try {
        const user = JSON.parse(storedUser);
        this.userSubject.next(user);
      } catch (e) {
        console.error('Error parsing user data', e);
        this.clearUserData();
      }
    }
  }

  // API calls for user profile
  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/userprofile`);
  }

  updateUserProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/userprofile`, userData);
  }

  deleteUserAccount(): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/userprofile`);
  }

  // User state management
  getUserObservable(): Observable<User | null> {
    return this.userSubject.asObservable();
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  updateCurrentUser(user: User): void {
    this.userSubject.next(user);
    // Optionally store in localStorage for offline access
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Account deletion confirmation flow
  showDeleteAccountConfirmation(): void {
    this.showDeleteConfirmationSubject.next(true);
  }

  getShowDeleteConfirmation(): Observable<boolean> {
    return this.showDeleteConfirmationSubject.asObservable();
  }

  hideDeleteConfirmation(): void {
    this.showDeleteConfirmationSubject.next(false);
  }

  // Confirm account deletion
  confirmDeleteAccount(): void {
    this.deleteUserAccount().subscribe({
      next: () => {
        this.clearAllApplicationData();
        this.authService.logout(); // Let AuthService handle logout
      },
      error: (error) => {
        console.error('Error deleting account:', error);
        // Handle error appropriately
      },
    });
  }

  // Data management methods
  private clearUserData(): void {
    localStorage.removeItem(this.USER_KEY);
    this.userSubject.next(null);
  }

  private clearAllApplicationData(): void {
    const keysToPreserve = ['theme_preference'];
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !keysToPreserve.includes(key)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
    sessionStorage.clear();
    this.userSubject.next(null);
  }

  // Utility method to refresh user profile from server
  refreshUserProfile(): Observable<User> {
    return this.getUserProfile().pipe(
      tap((user) => this.updateCurrentUser(user)),
    );
  }

  // Check if current user has specific role/permission
  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }

  hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }
}
