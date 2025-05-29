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
    if (
      this.authForm.get('username')?.valid &&
      this.authForm.get('role')?.valid
    ) {
      const userName = this.authForm.get('username')?.value;
      this.userService.createAccount(userName);

      // After creating account, redirect to home
      this.router.navigate(['/home']);
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
  }

  onSubmit(): void {
    if (this.isCreateMode) {
      this.createAccount();
    } else {
      this.login();
    }
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

    const tokenRequest: TokenRequest = {
      username: this.authForm.get('username')?.value,
      role: this.authForm.get('role')?.value,
      permissions:
        this.customPermissions.length > 0 ? this.customPermissions : undefined,
    };

    this.authService.login(tokenRequest).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        this.router.navigate(['/home']);
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
