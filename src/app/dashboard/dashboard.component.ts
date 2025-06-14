import { Component } from '@angular/core';

import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  constructor(private router: Router) {}
  onLogout() {
    localStorage.removeItem('token');
    this.router.navigateByUrl('/signin');
  }
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
