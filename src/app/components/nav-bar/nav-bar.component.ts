import { Component, inject } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { DarkModeService } from '../../services/dark-mode.service';
import { DeleteConfirmationDialogComponent } from '../../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

interface Notification {
  id: string;
  message: string;
  time: Date;
  read: boolean;
}
@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [DeleteConfirmationDialogComponent, CommonModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss',
})
export class NavBarComponent {
  authService = inject(AuthService);
  userService = inject(UserService);
  router = inject(Router);

  showUserMenu = false;
  showMobileMenu = false;
  isDarkMode = false;
  constructor(public darkModeService: DarkModeService) {}
  isAuthenticated(): boolean {
    try {
      return this.authService.isLoggedIn();
    } catch (error) {
      console.warn('Error checking authentication status:', error);
      return false;
    }
  }

  getUserName(): string {
    try {
      const user = this.authService.getClaims();
      return user?.username || user?.name || 'User';
    } catch (error) {
      console.warn('Error getting user name:', error);
      return 'User';
    }
  }

  getUserRole(): string {
    try {
      return this.authService.getUserRole() || 'N/A';
    } catch (error) {
      console.warn('Error getting user role:', error);
      return 'N/A';
    }
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  toggleDarkMode(): void {
    this.darkModeService.updateDarkMode();
    this.isDarkMode = !this.isDarkMode;
  }

  deleteAccount(): void {
    this.showUserMenu = false;
    this.userService.deleteUserAccount();
  }

  logout(): void {
    try {
      this.showUserMenu = false;
      this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error during logout:', error);
      // Force navigation even if there's an error
      this.router.navigate(['/login']);
    }
  }

  // Close dropdowns when clicking outside
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.showUserMenu = false;
    }
  }
}
