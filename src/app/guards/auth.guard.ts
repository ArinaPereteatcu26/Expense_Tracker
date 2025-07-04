import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean {
    if (this.authService.isLoggedIn()) {
      // Check for role-based or permission-based access
      const requiredRole = route.data['role'] as string;
      const requiredPermission = route.data['permission'] as string;
      const claimReq = route.data['claimReq'] as Function;

      // Check custom claim requirement function
      if (claimReq) {
        const userClaims = this.authService.getClaims();
        if (!claimReq(userClaims)) {
          this.router.navigate(['/forbidden']);
          return false;
        }
      }

      // Check required role
      if (requiredRole && !this.authService.hasRole(requiredRole)) {
        this.router.navigate(['/forbidden']);
        return false;
      }

      // Check required permission
      if (
        requiredPermission &&
        !this.authService.hasPermission(requiredPermission)
      ) {
        this.router.navigate(['/forbidden']);
        return false;
      }

      return true;
    } else {
      // Store the attempted URL for redirecting after login
      this.router.navigate(['/signin'], {
        queryParams: { returnUrl: state.url },
      });
      return false;
    }
  }
}
