import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: string;
  name: string;
  createdAt: number;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly USER_KEY = 'budget_user';
  private readonly BUDGETS_KEY = 'budget_data';
  private readonly EXPENSES_KEY = 'expense_data';

  private userSubject = new BehaviorSubject<User | null>(null);
  private showDeleteConfirmationSubject = new BehaviorSubject<boolean>(false);

  constructor(private router: Router) {
    this.loadUserFromStorage();
  }

  // Load user from local storage
  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem(this.USER_KEY);
    if (storedUser) {
      try {
        this.userSubject.next(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing user data', e);
        localStorage.removeItem(this.USER_KEY);
      }
    }
  }

  // Get current user
  getUser(): User | null {
    return this.userSubject.value;
  }

  // Get user observable for subscribing to user changes
  getUserObservable(): Observable<User | null> {
    return this.userSubject.asObservable();
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.userSubject.value;
  }

  // Create a new user account
  createAccount(name: string): void {
    if (!name.trim()) return;

    // First ensure all previous data is cleared
    this.clearAllUserData();

    const newUser: User = {
      id: this.generateId(),
      name: name.trim(),
      createdAt: Date.now(),
    };

    localStorage.setItem(this.USER_KEY, JSON.stringify(newUser));
    this.userSubject.next(newUser);
    this.router.navigate(['/']);
  }

  // Clear all user-related data
  private clearAllUserData(): void {
    // Remove standard keys
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.BUDGETS_KEY);
    localStorage.removeItem(this.EXPENSES_KEY);

    // Clear any keys that might contain budget or expense data
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.includes('budget') ||
          key.includes('expense') ||
          key.includes('transaction') ||
          key.includes('user'))
      ) {
        keysToRemove.push(key);
      }
    }

    // Remove all collected keys
    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    // Reset user subject
    this.userSubject.next(null);
  }

  // Show delete confirmation dialog
  deleteUserAccount(): void {
    this.showDeleteConfirmationSubject.next(true);
  }

  // Get the value of show delete confirmation
  getShowDeleteConfirmation(): boolean {
    return this.showDeleteConfirmationSubject.value;
  }

  // Close delete confirmation dialog
  closeDeleteConfirmation(): void {
    this.showDeleteConfirmationSubject.next(false);
  }

  // Confirm delete account
  confirmDeleteAccount(): void {
    // Get current user ID before deletion
    const userId = this.userSubject.value?.id;

    // Clear specific user data
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.BUDGETS_KEY);
    localStorage.removeItem(this.EXPENSES_KEY);

    // Clear any data associated with this user ID
    if (userId) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.includes(userId) ||
            key.includes('budget') ||
            key.includes('expense') ||
            key.includes('transaction'))
        ) {
          localStorage.removeItem(key);
        }
      }
    }

    // Clear all other application data
    this.clearAllApplicationData();

    // Reset user subject
    this.userSubject.next(null);

    // Close the dialog
    this.showDeleteConfirmationSubject.next(false);

    // Redirect to create account page
    this.router.navigate(['/login']);
  }

  // Clear all application data (add more keys as needed)
  private clearAllApplicationData(): void {
    // Clear any other application-specific data
    const keysToPreserve = ['theme_preference']; // Keep theme preference

    // Get all localStorage keys
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !keysToPreserve.includes(key)) {
        // Collect all keys that should be removed
        keysToRemove.push(key);
      }
    }

    // Remove all collected keys
    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    console.log('All application data cleared successfully');

    // Clear session storage too in case it's being used
    sessionStorage.clear();
  }

  // Generate a unique ID for user
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
