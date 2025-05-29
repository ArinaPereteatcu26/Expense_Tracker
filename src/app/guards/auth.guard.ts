import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
  ) {}

  canActivate(): boolean {
    console.log('AuthGuard: Checking authentication...');

    // Check if user is authenticated via AuthService (JWT token) OR UserService (local user)
    const isJwtAuthenticated = this.authService.isAuthenticated();
    const isLocalUserLoggedIn = this.userService.isLoggedIn();

    if (isJwtAuthenticated || isLocalUserLoggedIn) {
      console.log('AuthGuard: User is authenticated, allowing access');
      return true;
    }

    // If not authenticated, redirect to login page
    console.log('AuthGuard: User not authenticated, redirecting to login');
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
    private userService: UserService,
    private router: Router,
  ) {}

  canActivate(): boolean {
    console.log('NoAuthGuard: Checking authentication...');

    // Check if user is NOT authenticated via either method
    const isJwtAuthenticated = this.authService.isAuthenticated();
    const isLocalUserLoggedIn = this.userService.isLoggedIn();

    if (!isJwtAuthenticated && !isLocalUserLoggedIn) {
      console.log(
        'NoAuthGuard: User not authenticated, allowing access to login',
      );
      return true;
    }

    // If authenticated via either method, redirect to home page
    console.log('NoAuthGuard: User is authenticated, redirecting to home');
    this.router.navigate(['/home']);
    return false;
  }
}
