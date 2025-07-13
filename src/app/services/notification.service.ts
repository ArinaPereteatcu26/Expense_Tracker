/*
// services/theme.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  public isDarkMode$ = this.isDarkModeSubject.asObservable();

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    const isDark =
      savedTheme === 'dark' ||
      (!savedTheme &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    this.isDarkModeSubject.next(isDark);
  }

  toggleTheme(): void {
    const currentTheme = this.isDarkModeSubject.value;
    const newTheme = !currentTheme;

    this.isDarkModeSubject.next(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  }

  setTheme(isDark: boolean): void {
    this.isDarkModeSubject.next(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  getCurrentTheme(): 'light' | 'dark' {
    return this.isDarkModeSubject.value ? 'dark' : 'light';
  }
}

// services/notification.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  message: string;
  time: Date;
  read: boolean;
  type?: 'info' | 'warning' | 'error' | 'success';
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor() {
    this.loadInitialNotifications();
  }

  private loadInitialNotifications(): void {
    // Mock initial notifications
    const mockNotifications: Notification[] = [
      {
        id: '1',
        message: 'Your monthly budget report is ready',
        time: new Date(Date.now() - 30 * 60000), // 30 minutes ago
        read: false,
        type: 'info',
      },
      {
        id: '2',
        message: 'Payment reminder: Credit card due tomorrow',
        time: new Date(Date.now() - 60 * 60000), // 1 hour ago
        read: false,
        type: 'warning',
      },
      {
        id: '3',
        message: 'New transaction: $50.00 at Amazon',
        time: new Date(Date.now() - 120 * 60000), // 2 hours ago
        read: false,
        type: 'info',
      },
    ];

    this.notificationsSubject.next(mockNotifications);
  }

  loadNotifications(): void {
    // In a real app, this would fetch from an API
    this.loadInitialNotifications();
  }

  addNotification(notification: Omit<Notification, 'id'>): void {
    const currentNotifications = this.notificationsSubject.value;
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
    };

    this.notificationsSubject.next([newNotification, ...currentNotifications]);
  }

  markAsRead(notificationId: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map((notification) =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification,
    );

    this.notificationsSubject.next(updatedNotifications);
  }

  markAllAsRead(): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map((notification) => ({
      ...notification,
      read: true,
    }));

    this.notificationsSubject.next(updatedNotifications);
  }

  removeNotification(notificationId: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const filteredNotifications = currentNotifications.filter(
      (notification) => notification.id !== notificationId,
    );

    this.notificationsSubject.next(filteredNotifications);
  }

  getUnreadCount(): Observable<number> {
    return new Observable((observer) => {
      this.notifications$.subscribe((notifications) => {
        const unreadCount = notifications.filter((n) => !n.read).length;
        observer.next(unreadCount);
      });
    });
  }
}
*/
