import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, TokenRequest } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  userId = 1;
  role = 'USER';
  customPermissions: string[] = [];
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  togglePermission(permission: string, event: any) {
    if (event.target.checked) {
      if (!this.customPermissions.includes(permission)) {
        this.customPermissions.push(permission);
      }
    } else {
      this.customPermissions = this.customPermissions.filter(
        (p) => p !== permission,
      );
    }
  }

  login() {
    this.loading = true;
    this.error = '';

    const tokenRequest: TokenRequest = {
      userId: this.userId,
      role: this.role,
      permissions:
        this.customPermissions.length > 0 ? this.customPermissions : undefined,
    };

    this.authService.login(tokenRequest).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.error = error.error?.error || 'Login failed';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
