import { Component, inject } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { DarkModeService } from '../../services/dark-mode.service';
@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss',
})
export class NavBarComponent {
  darkModeService: DarkModeService = inject(DarkModeService);

  toggleDarkMode() {
    this.darkModeService.updateDarkMode();
  }
  constructor(
    public userService: UserService,
    public router: Router,
  ) {}
}
