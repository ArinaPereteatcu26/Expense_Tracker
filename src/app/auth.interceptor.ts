// auth.interceptor.ts - Fixed version with better error handling
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const jwtHelper = inject(JwtHelperService);

  try {
    const authToken = localStorage.getItem('authToken');

    // Skip for auth requests or if no token exists
    if (req.url.includes('/auth/') || !authToken) {
      return next(req);
    }

    // Check token expiration
    if (jwtHelper.isTokenExpired(authToken)) {
      console.log('🔒 Token expired, cleaning up and redirecting to login');
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      router.navigate(['/login']);
      return next(req);
    }

    // Clone request and add auth header
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest', // Security header
      },
    });

    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('HTTP Error in interceptor:', error);

        if (error.status === 401) {
          console.log(
            '🔒 401 Unauthorized, cleaning up and redirecting to login',
          );
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          router.navigate(['/login']);
        } else if (error.status === 403) {
          console.log('🔒 403 Forbidden, insufficient permissions');
          // Handle forbidden access - could redirect to a different page
        } else if (error.status === 0) {
          console.log('🔒 Network error or CORS issue');
          // Handle network errors
        }

        return throwError(() => error);
      }),
    );
  } catch (error) {
    console.error('Error in auth interceptor:', error);
    return next(req);
  }
};
