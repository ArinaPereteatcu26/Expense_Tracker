import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NgIf, CommonModule } from '@angular/common';
import { FooterComponent } from '../components/footer/footer.component';
import { FormWrapperComponent } from '../components/form-wrapper/form-wrapper.component';
import { UserService } from '../services/user.service';
import { Observable, throwError } from 'rxjs';

interface TokenRequest {
  username: string;
  role: string;
  permissions?: string[];
}

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  imports: [
    ReactiveFormsModule,
    FooterComponent,
    FormWrapperComponent,
    NgIf,
    CommonModule,
  ],
})
export class AuthComponent implements OnInit {
  authForm: FormGroup;
  isCreateMode = true;
  loading = false;
  error = '';
  customPermissions: string[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
  ) {
    this.authForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]], // For account creation
      username: ['', [Validators.required, Validators.minLength(2)]], // For login
      role: ['USER', Validators.required],
    });

    // Check if user is already logged in when component initializes
    if (this.authService.isAuthenticated()) {
      console.log('User already authenticated, redirecting to home');
      this.router.navigate(['/home']);
    }
  }

  ngOnInit(): void {
    this.updateFormValidators();
  }

  toggleMode(): void {
    this.isCreateMode = !this.isCreateMode;
    this.error = '';
    this.customPermissions = [];
    this.updateFormValidators();
  }

  private updateFormValidators(): void {
    const nameControl = this.authForm.get('name');
    const usernameControl = this.authForm.get('username');
    const roleControl = this.authForm.get('role');

    if (this.isCreateMode) {
      // For registration, use username instead of name
      usernameControl?.setValidators([
        Validators.required,
        Validators.minLength(2),
      ]);
      roleControl?.setValidators([Validators.required]); // Role is needed for registration
      nameControl?.clearValidators();
    } else {
      // For login
      usernameControl?.setValidators([
        Validators.required,
        Validators.minLength(2),
      ]);
      roleControl?.setValidators([Validators.required]);
      nameControl?.clearValidators();
    }

    nameControl?.updateValueAndValidity();
    usernameControl?.updateValueAndValidity();
    roleControl?.updateValueAndValidity();
  }

  get isFormValid(): boolean {
    if (this.isCreateMode) {
      // Check username and role for registration
      return (
        (this.authForm.get('username')?.valid &&
          this.authForm.get('role')?.valid) ||
        false
      );
    } else {
      return (
        (this.authForm.get('username')?.valid &&
          this.authForm.get('role')?.valid) ||
        false
      );
    }
  }

  private createAccount(): void {
    if (!this.isFormValid) return;

    this.loading = true;
    this.error = '';

    const username = this.authForm.get('username')?.value;
    const role = this.authForm.get('role')?.value;

    // Set default permissions based on role
    let finalPermissions = [...this.customPermissions];

    if (role === 'ADMIN') {
      // Admin gets all permissions by default
      finalPermissions = ['READ', 'WRITE', 'DELETE'];
    } else if (role === 'USER' && finalPermissions.length === 0) {
      // Regular user gets read permission by default if no custom permissions selected
      finalPermissions = ['READ'];
    } else if (role === 'VISITOR' && finalPermissions.length === 0) {
      // Visitor gets only read permission
      finalPermissions = ['READ'];
    }

    const request = {
      username: username,
      role: role,
      permissions: finalPermissions.length > 0 ? finalPermissions : undefined,
    };

    // Log registration attempt
    console.log('🔄 Attempting to register user:', {
      username: request.username,
      role: request.role,
      permissions: request.permissions || [],
    });

    this.authService.register(request).subscribe({
      next: (response) => {
        console.log('✅ Registration successful!');

        if (response.token) {
          localStorage.setItem('authToken', response.token);

          // Wait a moment for token to be stored, then get user info
          setTimeout(() => {
            this.logUserInfo();
          }, 100);
        }

        this.router.navigate(['/home']);
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Registration failed:', err);
        this.error = err.error?.message || 'Registration failed';
        this.loading = false;
      },
    });
  }

  private login(): void {
    if (
      !this.authForm.get('username')?.valid ||
      !this.authForm.get('role')?.valid
    ) {
      return;
    }

    this.loading = true;
    this.error = '';

    const username = this.authForm.get('username')?.value;
    const role = this.authForm.get('role')?.value;

    const tokenRequest: TokenRequest = {
      username: username,
      role: role,
      permissions:
        this.customPermissions.length > 0 ? this.customPermissions : undefined,
    };

    // Log login attempt
    console.log('🔄 Attempting to login user:', {
      username: tokenRequest.username,
      role: tokenRequest.role,
      permissions: tokenRequest.permissions || [],
    });

    this.authService.login(tokenRequest).subscribe({
      next: (response) => {
        console.log('✅ Login successful!');

        if (response.token) {
          localStorage.setItem('authToken', response.token);

          // Wait a moment for token to be stored, then get user info
          setTimeout(() => {
            this.logUserInfo();
          }, 100);
        }

        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('❌ Login failed:', error);
        this.error = error.error?.error || 'Login failed';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  private logUserInfo(): void {
    try {
      const user = this.authService.getUserFromToken();
      const role = this.authService.getUserRole();
      const permissions = this.authService.getUserPermissions();

      console.log('👤 User Information:');
      console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      );
      console.log(`📝 Username: ${user?.username || user?.sub || 'N/A'}`);
      console.log(`👔 Role: ${role || 'N/A'}`);
      console.log(
        `🔐 Permissions: ${permissions.length > 0 ? permissions.join(', ') : 'None'}`,
      );
      console.log('🎯 Full Token Data:', user);
      console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      );

      // Also log permission checks
      if (permissions.length > 0) {
        console.log('🔍 Permission Checks:');
        ['READ', 'WRITE', 'DELETE'].forEach((permission) => {
          const hasPermission = this.authService.hasPermission(permission);
          console.log(
            `  ${hasPermission ? '✅' : '❌'} ${permission}: ${hasPermission}`,
          );
        });
      }

      // Log role checks
      console.log('👑 Role Checks:');
      ['USER', 'ADMIN', 'VISITOR'].forEach((roleCheck) => {
        const hasRole = this.authService.hasRole(roleCheck);
        console.log(`  ${hasRole ? '✅' : '❌'} ${roleCheck}: ${hasRole}`);
      });
    } catch (error) {
      console.error('❌ Error getting user info from token:', error);
    }
  }

  togglePermission(permission: string, event: any): void {
    if (event.target.checked) {
      if (!this.customPermissions.includes(permission)) {
        this.customPermissions.push(permission);
      }
    } else {
      this.customPermissions = this.customPermissions.filter(
        (p) => p !== permission,
      );
    }

    // Log current permission selection
    console.log('🔄 Permission selection updated:', this.customPermissions);
  }

  onSubmit(): void {
    if (this.isCreateMode) {
      this.createAccount();
    } else {
      this.login();
    }
  }

  private generateSimpleToken(userId: string, role: string): string {
    // This should match what UserService generates
    return btoa(
      JSON.stringify({
        userId,
        role,
        created: Date.now(),
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      }),
    );
  }
}
