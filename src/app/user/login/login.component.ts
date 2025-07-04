import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService, LoginRequest } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styles: ``,
})
export class LoginComponent implements OnInit {
  isSubmitted: boolean = false;

  form!: FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
  }>;

  constructor(
    private formBuilder: FormBuilder,
    private service: AuthService,
    private router: Router,
    private toastr: ToastrService,
  ) {
    this.form = this.formBuilder.group({
      email: this.formBuilder.control('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      password: this.formBuilder.control('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
    });
  }
  ngOnInit(): void {
    if (this.service.isLoggedIn()) this.router.navigateByUrl('/dashboard');
  }

  hasDisplayableError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return (
      !!control?.invalid &&
      (this.isSubmitted || control.touched || control.dirty)
    );
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.form.valid) {
      this.service.login(this.form.value as LoginRequest).subscribe({
        next: (res: any) => {
          this.router.navigateByUrl('/dashboard');
        },
        error: (err) => {
          if (err.status == 400)
            this.toastr.error('Incorrect email or password.', 'Login failed');
          else console.log('error during login:\n', err);
        },
      });
    }
  }
}
