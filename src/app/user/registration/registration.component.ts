import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { FirstKeyPipe } from '../../shared/pipes/first-key.pipe';

@Component({
  selector: 'app-registration',
  imports: [ReactiveFormsModule, NgIf, NgSwitch, NgSwitchCase, FirstKeyPipe],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss',
})
export class RegistrationComponent {
  form: any;
  constructor(public formBuilder: FormBuilder) {}
  isSubmitted: boolean = false;
  passwordMatchValidator: ValidatorFn = (control: AbstractControl): null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value != confirmPassword.value)
      confirmPassword?.setErrors({ passwordMismatch: true });
    else confirmPassword?.setErrors({ passwordMismatch: false });
    return null;
  };

  ngOnInit(): void {
    this.form = this.formBuilder.group(
      {
        fullName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.pattern(/^[a-zA-Z0-9]+$/),
          ],
        ],
        confirmPassword: [''],
      },
      {
        validators: this.passwordMatchValidator,
      },
    );
  }
  onSubmit() {
    this.isSubmitted = true;
    if (this.form.valid) {
      console.log(this.form.value);
    }
  }

  hasDisplayableError(controlName: string): Boolean {
    const control = this.form.get(controlName);
    return (
      Boolean(control?.invalid) &&
      (this.isSubmitted || Boolean(control?.touched))
    );
  }
}
