import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { FirstKeyPipe } from '../../shared/pipes/first-key.pipe';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FirstKeyPipe],
  templateUrl: './registration.component.html',
  styles: ``,
})
export class RegistrationComponent {
  form: FormGroup;
  isSubmitted: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private service: AuthService,
    private toastr: ToastrService,
  ) {
    this.form = this.formBuilder.group(
      {
        fullName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.pattern(/(?=.*[^a-zA-Z0-9 ])/), // Your cleaner regex
          ],
        ],
        confirmPassword: ['', Validators.required], // Added required validator
      },
      { validators: this.passwordMatchValidator },
    );
  }

  passwordMatchValidator: ValidatorFn = (control: AbstractControl): null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword) {
      if (password.value !== confirmPassword.value) {
        confirmPassword?.setErrors({ passwordMismatch: true });
      } else {
        // Only remove passwordMismatch error, preserve others
        const errors = confirmPassword.errors;
        if (errors) {
          delete errors['passwordMismatch'];
          confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
        }
      }
    }
    return null;
  };

  onSubmit() {
    this.isSubmitted = true;
    if (this.form.valid) {
      this.service.createUser(this.form.value).subscribe({
        next: (res: any) => {
          if (res.succeeded) {
            this.form.reset();
            this.isSubmitted = false;
            this.toastr.success('New user created!', 'Registration Successful');
          }
        },
        error: (err) => {
          console.log('Full error object:', err); // Debug log
          this.handleRegistrationError(err);
        },
      });
    }
  }

  private handleRegistrationError(err: any) {
    // Handle ASP.NET Core Identity errors
    if (err.error?.errors && Array.isArray(err.error.errors)) {
      err.error.errors.forEach((error: any) => {
        switch (error.code) {
          case 'DuplicateUserName':
            this.toastr.error(
              'Username is already taken.',
              'Registration Failed',
            );
            break;
          case 'DuplicateEmail':
            this.toastr.error('Email is already taken.', 'Registration Failed');
            break;
          default:
            this.toastr.error(
              'Registration failed. Please try again.',
              'Registration Failed',
            );
            console.log('Unhandled error:', error);
            break;
        }
      });
    }
    // Handle simple message errors
    else if (err.error?.message) {
      if (
        err.error.message.toLowerCase().includes('email') &&
        err.error.message.toLowerCase().includes('taken')
      ) {
        this.toastr.error('Email is already taken.', 'Registration Failed');
      } else {
        this.toastr.error(err.error.message, 'Registration Failed');
      }
    }
    // Handle HTTP status codes
    else if (err.status === 409) {
      this.toastr.error(
        'Email or username is already taken.',
        'Registration Failed',
      );
    }
    // Fallback
    else {
      this.toastr.error(
        'Registration failed. Please try again.',
        'Registration Failed',
      );
      console.log('Unhandled error structure:', err);
    }
  }

  hasDisplayableError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return (
      Boolean(control?.invalid) &&
      (this.isSubmitted || Boolean(control?.touched) || Boolean(control?.dirty))
    );
  }
}
