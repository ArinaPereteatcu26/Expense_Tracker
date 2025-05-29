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
    // Check if user is authenticated
    if (this.authService.isAuthenticated()) {
      return true;
    }

    // If not authenticated, redirect to login page
    this.router.navigate(['/login']);
    return false;
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
    // Check if user is NOT authenticated
    if (!this.authService.isAuthenticated()) {
      return true;
    }

    // If authenticated, redirect to home page
    this.router.navigate(['/']);
    return false;
  }
}
