import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type ThemeMode = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_STORAGE_KEY = 'company-dashboard-theme';
  private themeSubject = new BehaviorSubject<ThemeMode>('system');
  public theme$ = this.themeSubject.asObservable();

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const stored = localStorage.getItem(this.THEME_STORAGE_KEY) as ThemeMode;
    const theme = stored || 'system';
    this.setTheme(theme);
  }

  private getSystemTheme(): 'light' | 'dark' {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private resolveTheme(theme: ThemeMode): 'light' | 'dark' {
    return theme === 'system' ? this.getSystemTheme() : theme;
  }

  setTheme(theme: ThemeMode): void {
    this.themeSubject.next(theme);
    const resolved = this.resolveTheme(theme);
    document.documentElement.setAttribute('data-theme', resolved);
    localStorage.setItem(this.THEME_STORAGE_KEY, theme);

    // Also update Ionic's theme
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(resolved);
  }

  toggleTheme(): void {
    const current = this.themeSubject.value;
    const resolved = this.resolveTheme(current);
    this.setTheme(resolved === 'light' ? 'dark' : 'light');
  }

  getCurrentTheme(): ThemeMode {
    return this.themeSubject.value;
  }

  getResolvedTheme(): 'light' | 'dark' {
    return this.resolveTheme(this.themeSubject.value);
  }
}
