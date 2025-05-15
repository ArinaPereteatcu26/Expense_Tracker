import { Component, inject } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { DarkModeService } from '../../services/dark-mode.service';
import { DeleteConfirmationDialogComponent } from '../../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [DeleteConfirmationDialogComponent, CommonModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss',
})
export class NavBarComponent {
  darkModeService: DarkModeService = inject(DarkModeService);

  constructor(
    public userService: UserService,
    public router: Router,
  ) {}

  toggleDarkMode() {
    this.darkModeService.updateDarkMode();
  }
}
