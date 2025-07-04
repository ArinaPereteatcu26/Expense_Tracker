import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { tap } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  if (authService.isLoggedIn()) {
    const token = authService.getToken();
    if (token) {
      const cloneReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
      });

      return next(cloneReq).pipe(
        tap({
          error: (err: any) => {
            if (err.status === 401) {
              authService.logout();
              toastr.info('Please login again', 'Session Expired!');
            } else if (err.status === 403) {
              toastr.error('You are not authorized to perform this action!');
            }
          },
        }),
      );
    }
  }

  return next(req);
};
