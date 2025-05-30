import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(): boolean {
    try {
      // Check if user is authenticated
      if (this.authService.isAuthenticated()) {
        console.log('✅ User authenticated, allowing access');
        return true;
      }

      // If not authenticated, redirect to login page
      console.log('❌ User not authenticated, redirecting to login');
      this.router.navigate(['/login']);
      return false;
    } catch (error) {
      console.error('❌ Error in AuthGuard:', error);
      this.router.navigate(['/login']);
      return false;
    }
  }
}

@Injectable({
  providedIn: 'root',
})
export class NoAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(): boolean {
    try {
      // Check if user is NOT authenticated
      if (!this.authService.isAuthenticated()) {
        console.log('✅ User not authenticated, allowing access to login');
        return true;
      }

      // If authenticated, redirect to home page
      console.log('✅ User authenticated, redirecting to home');
      this.router.navigate(['/home']); // Changed from '/' to '/home'
      return false;
    } catch (error) {
      console.error('❌ Error in NoAuthGuard:', error);
      // If there's an error, assume not authenticated and allow access
      return true;
    }
  }
}
