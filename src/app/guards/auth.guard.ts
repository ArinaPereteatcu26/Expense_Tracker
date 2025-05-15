import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private router: Router,
  ) {}

  canActivate(): boolean {
    // Check if user is logged in
    if (this.userService.isLoggedIn()) {
      return true;
    }

    // If not logged in, redirect to create account page
    this.router.navigate(['/create-account']);
    return false;
  }
}

@Injectable({
  providedIn: 'root',
})
export class NoAuthGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private router: Router,
  ) {}

  canActivate(): boolean {
    // Check if user is NOT logged in
    if (!this.userService.isLoggedIn()) {
      return true;
    }

    // If logged in, redirect to home page
    this.router.navigate(['/']);
    return false;
  }
}
