import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { FooterComponent } from '../../components/footer/footer.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss'],
  imports: [ReactiveFormsModule, FooterComponent, NgIf],
})
export class CreateAccountComponent implements OnInit {
  accountForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
  ) {
    // Initialize form
    this.accountForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
    });

    // Redirect to home if already logged in
    if (this.userService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    // Additional initialization if needed
  }

  createAccount(): void {
    if (this.accountForm.valid) {
      const userName = this.accountForm.get('name')?.value;
      this.userService.createAccount(userName);
      // Router navigation is handled in the service
    }
  }
}
