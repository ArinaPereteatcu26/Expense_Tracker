import { effect, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DarkModeService {
  darkModeSignal = signal<string>(
    window.localStorage.getItem('darkModeSignal') || 'light',
  );

  updateDarkMode() {
    this.darkModeSignal.update((value) =>
      value === 'dark' ? 'light' : 'dark',
    );
  }

  constructor() {
    effect(() => {
      window.localStorage.setItem('darkModeSignal', this.darkModeSignal());
      document.body.classList.toggle('dark', this.darkModeSignal() === 'dark');
    });
  }
}
