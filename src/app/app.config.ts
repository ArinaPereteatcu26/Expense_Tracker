// app.config.ts or main.ts (for standalone components)
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { JwtModule } from '@auth0/angular-jwt';
import { importProvidersFrom } from '@angular/core';
import { routes } from './app.routes';

// JWT token getter function
export function tokenGetter() {
  return localStorage.getItem('authToken');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
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
    // ... other providers
  ],
};
