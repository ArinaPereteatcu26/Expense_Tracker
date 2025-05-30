import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { of, BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: string;
  name: string;
  createdAt: number;
  token?: string; // Added token to user interface
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly USER_KEY = 'budget_user';
  private readonly TOKEN_KEY = 'authToken'; // Separate key for token
  private readonly BUDGETS_KEY = 'budget_data';
  private readonly EXPENSES_KEY = 'expense_data';

  private userSubject = new BehaviorSubject<User | null>(null);
  private showDeleteConfirmationSubject = new BehaviorSubject<boolean>(false);

  constructor(private router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem(this.USER_KEY);
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        // Verify token exists
        const token = localStorage.getItem(this.TOKEN_KEY);
        if (token) {
          user.token = token;
        }
        this.userSubject.next(user);
      } catch (e) {
        console.error('Error parsing user data', e);
        this.clearUserData();
      }
    }
  }

  getUser(): User | null {
    return this.userSubject.value;
  }

  getUserObservable(): Observable<User | null> {
    return this.userSubject.asObservable();
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY); // Remove user object requirement
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  createAccount(name: string): Observable<User> {
    if (!name.trim()) throw new Error('Name is required');

    this.clearUserData(); // Using the more specific method

    const newUser: User = {
      id: this.generateId(),
      name: name.trim(),
      createdAt: Date.now(),
    };

    // Generate a simple token (replace with real auth in production)
    const token = this.generateAuthToken(newUser.id);

    // Store user and token separately
    localStorage.setItem(this.USER_KEY, JSON.stringify(newUser));
    localStorage.setItem(this.TOKEN_KEY, token);

    // Include token in the user object
    newUser.token = token;
    this.userSubject.next(newUser);

    return of(newUser);
  }

  login(name: string): Observable<User> {
    // In a real app, this would call an API endpoint
    const user = this.getUser();
    if (user && user.name === name.trim()) {
      const token = localStorage.getItem(this.TOKEN_KEY);
      if (token) {
        user.token = token;
        this.userSubject.next(user);
        return of(user);
      }
    }
    throw new Error('Login failed');
  }

  logout(): void {
    this.clearUserData();
    this.router.navigate(['/login']);
  }

  private clearUserData(): void {
    // Clear user and token
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_KEY);

    // Reset user subject
    this.userSubject.next(null);
  }

  // Modified to preserve budgets/expenses when just logging out
  private clearAllUserData(): void {
    this.clearUserData();
    localStorage.removeItem(this.BUDGETS_KEY);
    localStorage.removeItem(this.EXPENSES_KEY);

    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('transaction') || key.includes('temp_'))) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }

  // Only called when deleting account
  confirmDeleteAccount(): void {
    const userId = this.userSubject.value?.id;
    this.clearAllApplicationData(); // Now includes all user data

    if (userId) {
      // Additional cleanup for user-specific data if needed
    }

    this.userSubject.next(null);
    this.showDeleteConfirmationSubject.next(false);
    this.router.navigate(['/login']);
  }

  private generateAuthToken(userId: string): string {
    // Simple mock token - replace with real JWT in production
    return btoa(
      JSON.stringify({
        userId,
        created: Date.now(),
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      }),
    );
  }

  // Rest of your existing methods remain unchanged...
  deleteUserAccount(): void {
    this.showDeleteConfirmationSubject.next(true);
  }

  getShowDeleteConfirmation(): boolean {
    return this.showDeleteConfirmationSubject.value;
  }

  closeDeleteConfirmation(): void {
    this.showDeleteConfirmationSubject.next(false);
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
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
