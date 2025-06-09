import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { DarkModeService } from './services/dark-mode.service';
import { CommonModule } from '@angular/common';
import { DeleteConfirmationDialogComponent } from './delete-confirmation-dialog/delete-confirmation-dialog.component';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, DeleteConfirmationDialogComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'expense-tracker';

  darkModeService: DarkModeService = inject(DarkModeService);
  userService: UserService = inject(UserService);

  // Use this to control the display of the delete confirmation dialog
  get showDeleteDialog(): boolean {
    return this.userService.getShowDeleteConfirmation();
  }

  onConfirmDelete(): void {
    this.userService.confirmDeleteAccount();
  }

  onCancelDelete(): void {
    this.userService.closeDeleteConfirmation();
  }
}
