// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { JwtModule } from '@auth0/angular-jwt';
import { routes } from './app/app.routes'; // Your routes

// JWT token getter function
export function tokenGetter() {
  return localStorage.getItem('authToken');
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    // Import JWT Module with configuration
    importProvidersFrom(
      JwtModule.forRoot({
        config: {
          tokenGetter: tokenGetter,
          allowedDomains: ['localhost:5056'],
          disallowedRoutes: [
            'http://localhost:5056/api/auth/login',
            'http://localhost:5056/api/auth/register',
          ],
          headerName: 'Authorization',
          authScheme: 'Bearer ',
          skipWhenExpired: true,
        },
      }),
    ),
    // Add other providers here
  ],
}).catch((err) => console.error(err));
