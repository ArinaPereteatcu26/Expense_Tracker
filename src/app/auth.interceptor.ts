import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const jwtHelper = inject(JwtHelperService);

  const authToken = localStorage.getItem('authToken');

  // Skip for auth requests or if no token exists
  if (req.url.includes('/auth/') || !authToken) {
    return next(req);
  }

  // Check token expiration
  if (jwtHelper.isTokenExpired(authToken)) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
    return next(req);
  }

  // Clone request and add auth header
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${authToken}`,
      'X-Requested-With': 'XMLHttpRequest', // Security header
    },
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
      }
      return throwError(() => error);
    }),
  );
};
