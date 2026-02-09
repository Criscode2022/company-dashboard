import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { filter } from 'rxjs/operators';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';
import { addIcons } from 'ionicons';
import { 
  statsChart, business, book, trendingUp, logOut, moon, sunny, 
  menuOutline, closeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, IonicModule],
  template: `
    <ion-app>
      <ion-split-pane contentId="main-content" [disabled]="!showMenu">
        <ion-menu *ngIf="showMenu" contentId="main-content" type="overlay" class="sidebar">
          <ion-header class="sidebar-header">
            <ion-toolbar
              <div class="logo"
                <span class="logo-icon">📊</span>
                <span class="logo-text">Dashboard</span>
              </div>
            </ion-toolbar>
          </ion-header>
          
          <ion-content class="sidebar-content">
            <ion-list lines="none">
              <ion-list-header>Menu</ion-list-header>
              
              <ion-item 
                routerLink="/dashboard" 
                routerLinkActive="selected"
                (click)="closeMenu()"
              >
                <ion-icon name="stats-chart" slot="start"></ion-icon>
                <ion-label>Overview</ion-label>
              </ion-item>
              
              <ion-item 
                routerLink="/clients" 
                routerLinkActive="selected"
                (click)="closeMenu()"
              >
                <ion-icon name="business" slot="start"></ion-icon>
                <ion-label>Clients & Projects</ion-label>
              </ion-item>
              
              <ion-item 
                routerLink="/memory" 
                routerLinkActive="selected"
                (click)="closeMenu()"
              >
                <ion-icon name="book" slot="start"></ion-icon>
                <ion-label>Daily Memory</ion-label>
              </ion-item>
              
              <ion-item 
                routerLink="/stats" 
                routerLinkActive="selected"
                (click)="closeMenu()"
              >
                <ion-icon name="trending-up" slot="start"></ion-icon>
                <ion-label>Statistics</ion-label>
              </ion-item>
            </ion-list>
            
            <div class="sidebar-footer">
              <ion-button fill="clear" (click)="toggleTheme()" class="theme-toggle"
                <ion-icon [name]="isDarkMode ? 'sunny' : 'moon'" slot="start"></ion-icon>
                {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
              </ion-button>
              
              <ion-button fill="clear" (click)="logout()" color="danger" class="logout-btn"
                <ion-icon name="log-out" slot="start"></ion-icon>
                Logout
              </ion-button>
            </div>
          </ion-content>
        </ion-menu>
        
        <div class="main-content" id="main-content"
          <ion-header *ngIf="showMenu" class="top-bar"
            <ion-toolbar
              <ion-buttons slot="start"
                <ion-menu-button></ion-menu-button>
              </ion-buttons>
              <ion-title>{{ pageTitle }}</ion-title>
              <ion-buttons slot="end"
                <ion-button (click)="toggleTheme()"
                  <ion-icon [name]="isDarkMode ? 'sunny' : 'moon'"></ion-icon>
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          
          <ion-router-outlet></ion-router-outlet>
        </div>
      </ion-split-pane>
    </ion-app>
  `,
  styles: [`
    :host {
      --sidebar-width: 260px;
    }

    .sidebar {
      --background: var(--bg-sidebar);
      --ion-background-color: var(--bg-sidebar);
    }

    .sidebar-header {
      background: var(--bg-sidebar);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .sidebar-header ion-toolbar {
      --background: transparent;
      --color: var(--text-sidebar);
      --min-height: 70px;
      padding: 0 16px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-icon {
      font-size: 28px;
    }

    .logo-text {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-sidebar);
    }

    .sidebar-content {
      --background: var(--bg-sidebar);
      display: flex;
      flex-direction: column;
    }

    .sidebar-content ion-list {
      background: transparent;
      padding: 16px 12px;
    }

    .sidebar-content ion-list-header {
      color: var(--text-tertiary);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 16px;
      margin-bottom: 8px;
    }

    .sidebar-content ion-item {
      --background: transparent;
      --color: var(--text-sidebar);
      --border-radius: 10px;
      --min-height: 48px;
      margin: 4px 0;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .sidebar-content ion-item:hover {
      --background: var(--bg-sidebar-hover);
    }

    .sidebar-content ion-item.selected {
      --background: var(--bg-sidebar-hover);
      --color: var(--accent);
      border-left: 3px solid var(--accent);
    }

    .sidebar-content ion-item.selected ion-icon {
      color: var(--accent);
    }

    .sidebar-content ion-icon {
      color: var(--text-tertiary);
      font-size: 20px;
    }

    .sidebar-footer {
      margin-top: auto;
      padding: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .theme-toggle {
      --color: var(--text-sidebar);
      --background: transparent;
      --background-hover: var(--bg-sidebar-hover);
      --border-radius: 10px;
      justify-content: flex-start;
      text-transform: none;
      font-weight: 500;
    }

    .logout-btn {
      --border-radius: 10px;
      justify-content: flex-start;
      text-transform: none;
      font-weight: 500;
    }

    .main-content {
      background: var(--bg-primary);
      min-height: 100vh;
    }

    .top-bar {
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border);
    }

    .top-bar ion-toolbar {
      --background: var(--bg-secondary);
      --color: var(--text-primary);
      --min-height: 64px;
    }

    .top-bar ion-title {
      font-weight: 600;
      font-size: 18px;
    }
  `]
})
export class AppComponent {
  private router = inject(Router);
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private menuController = inject(MenuController);

  showMenu = false;
  pageTitle = 'Dashboard';
  isDarkMode = false;

  constructor() {
    addIcons({ 
      statsChart, business, book, trendingUp, logOut, moon, sunny,
      menuOutline, closeOutline
    });

    // Track route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.showMenu = !['/login', '/signup'].includes(event.url);
      this.updatePageTitle(event.url);
    });

    // Track theme changes
    this.themeService.theme$.subscribe(() => {
      this.isDarkMode = this.themeService.getResolvedTheme() === 'dark';
    });
  }

  private updatePageTitle(url: string): void {
    if (url.includes('/dashboard')) this.pageTitle = 'Overview';
    else if (url.includes('/clients')) this.pageTitle = 'Clients & Projects';
    else if (url.includes('/memory')) this.pageTitle = 'Daily Memory';
    else if (url.includes('/stats')) this.pageTitle = 'Statistics';
    else this.pageTitle = 'Dashboard';
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  async closeMenu(): Promise<void> {
    await this.menuController.close();
  }

  logout(): void {
    this.authService.logout();
  }
}
