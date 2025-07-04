import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
  ) {}

  fullName: string = '';
  ngOnInit(): void {
    this.userService.getUserProfile().subscribe({
      next: (res: any) => (this.fullName = res.fullName),
      error: (err: any) => console.log('error while retrieving user profile'),
    });
  }
  onLogout() {
    localStorage.removeItem('token');
    this.router.navigateByUrl('/signin');
  }
}
