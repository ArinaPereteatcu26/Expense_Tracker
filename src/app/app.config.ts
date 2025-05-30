// app.config.ts - Fixed version with proper interceptor setup
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { JwtModule } from '@auth0/angular-jwt';
import { importProvidersFrom } from '@angular/core';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';

// JWT token getter function
export function tokenGetter() {
  try {
    return localStorage.getItem('authToken');
  } catch (error) {
    console.warn('Error getting token from localStorage:', error);
    return null;
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Use the functional interceptor approach
    provideHttpClient(
      withInterceptors([authInterceptor]),
      withInterceptorsFromDi(),
    ),
    // Add JWT module configuration for your ASP.NET backend
    importProvidersFrom(
      JwtModule.forRoot({
        config: {
          tokenGetter: tokenGetter,
          allowedDomains: ['localhost:5056'], // Your ASP.NET backend port
          disallowedRoutes: [
            'http://localhost:5056/api/auth/login',
            'http://localhost:5056/api/auth/register',
          ], // Routes that shouldn't include the token
          headerName: 'Authorization',
          authScheme: 'Bearer ',
          skipWhenExpired: true,
        },
      }),
    ),
  ],
};
