// combined-auth.component.ts
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, TokenRequest } from '../services/auth.service';
import { NgIf, CommonModule } from '@angular/common';
import { FooterComponent } from '../components/footer/footer.component';
import { FormWrapperComponent } from '../components/form-wrapper/form-wrapper.component';
import { UserService } from '../services/user.service';

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
  isCreateMode = true; // Toggle between create account and login
  loading = false;
  error = '';
  customPermissions: string[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
  ) {
    // Initialize form with all possible fields
    this.authForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]], // For create account
      userId: [1, [Validators.required, Validators.min(1)]], // For login
      role: ['USER', Validators.required], // For login
    });

    // Redirect to home if already logged in
    if (this.userService.isLoggedIn()) {
      this.router.navigate(['/']);
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
    const userIdControl = this.authForm.get('userId');
    const roleControl = this.authForm.get('role');

    if (this.isCreateMode) {
      // Create account mode - require name, disable others
      nameControl?.setValidators([
        Validators.required,
        Validators.minLength(2),
      ]);
      userIdControl?.clearValidators();
      roleControl?.clearValidators();
    } else {
      // Login mode - require userId and role, disable name
      nameControl?.clearValidators();
      userIdControl?.setValidators([Validators.required, Validators.min(1)]);
      roleControl?.setValidators([Validators.required]);
    }

    // Update form validity
    nameControl?.updateValueAndValidity();
    userIdControl?.updateValueAndValidity();
    roleControl?.updateValueAndValidity();
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
  }

  onSubmit(): void {
    if (this.isCreateMode) {
      this.createAccount();
    } else {
      this.login();
    }
  }

  private createAccount(): void {
    if (this.authForm.get('name')?.valid) {
      const userName = this.authForm.get('name')?.value;
      this.userService.createAccount(userName);
      // Router navigation is handled in the service
    }
  }

  private login(): void {
    if (
      !this.authForm.get('userId')?.valid ||
      !this.authForm.get('role')?.valid
    ) {
      return;
    }

    this.loading = true;
    this.error = '';

    const tokenRequest: TokenRequest = {
      userId: this.authForm.get('userId')?.value,
      role: this.authForm.get('role')?.value,
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

  get isFormValid(): boolean {
    if (this.isCreateMode) {
      return this.authForm.get('name')?.valid || false;
    } else {
      return (
        (this.authForm.get('userId')?.valid &&
          this.authForm.get('role')?.valid) ||
        false
      );
    }
  }
}
