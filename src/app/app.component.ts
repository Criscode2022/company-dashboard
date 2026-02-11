import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { NavigationEnd, Router, RouterModule } from "@angular/router";
import { filter } from "rxjs/operators";
import { AuthService } from "./services/auth.service";
import { ThemeService } from "./services/theme.service";

// Inline SVG icons
const ICONS: Record<string, string> = {
  menu: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`,
  stats: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>`,
  list: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`,
  grid: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
  tag: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path><path d="M7 7h.01"></path></svg>`,
  activity: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>`,
  business: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
  book: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`,
  trending: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`,
  logout: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`,
  moon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
  sun: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
};

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="app-layout">
      <button
        *ngIf="showMenu"
        class="nav-toggle"
        type="button"
        (click)="toggleNav()"
        aria-label="Toggle navigation"
        [innerHTML]="icons.menu"
      ></button>
      <div
        *ngIf="showMenu && isNavOpen"
        class="backdrop"
        (click)="closeNav()"
      ></div>
      <nav class="sidebar" *ngIf="showMenu" [class.open]="isNavOpen">
        <div class="sidebar-header">Company Dashboard</div>
        <ul class="nav-list">
          <!-- Main -->
          <li class="nav-section">Main</li>
          <li>
            <a
              routerLink="/dashboard"
              routerLinkActive="active"
              (click)="closeNav()"
            >
              <span class="icon" [innerHTML]="icons.stats"></span> Overview
            </a>
          </li>

          <!-- Task Management -->
          <li class="nav-section">Tasks</li>
          <li>
            <a
              routerLink="/tasks"
              routerLinkActive="active"
              (click)="closeNav()"
            >
              <span class="icon" [innerHTML]="icons.list"></span> Task List
            </a>
          </li>
          <li>
            <a
              routerLink="/kanban"
              routerLinkActive="active"
              (click)="closeNav()"
            >
              <span class="icon" [innerHTML]="icons.grid"></span> Kanban Board
            </a>
          </li>
          <li>
            <a
              routerLink="/calendar"
              routerLinkActive="active"
              (click)="closeNav()"
            >
              <span class="icon" [innerHTML]="icons.calendar"></span> Calendar
            </a>
          </li>

          <li>
            <a
              routerLink="/tags"
              routerLinkActive="active"
              (click)="closeNav()"
            >
              <span class="icon" [innerHTML]="icons.tag"></span> Tags
            </a>
          </li>

          <li>
            <a
              routerLink="/activity"
              routerLinkActive="active"
              (click)="closeNav()"
            >
              <span class="icon" [innerHTML]="icons.activity"></span> Activity
            </a>
          </li>

          <!-- Company -->
          <li class="nav-section">Company</li>
          <li>
            <a
              routerLink="/clients"
              routerLinkActive="active"
              (click)="closeNav()"
            >
              <span class="icon" [innerHTML]="icons.business"></span> Clients & Projects
            </a>
          </li>
          <li>
            <a
              routerLink="/memory"
              routerLinkActive="active"
              (click)="closeNav()"
            >
              <span class="icon" [innerHTML]="icons.book"></span> Daily Memory
            </a>
          </li>
          <li>
            <a
              routerLink="/stats"
              routerLinkActive="active"
              (click)="closeNav()"
            >
              <span class="icon" [innerHTML]="icons.trending"></span> Statistics
            </a>
          </li>

          <li class="nav-spacer"></li>
          <li>
            <a (click)="toggleTheme()" class="theme-toggle">
              <span class="icon" [innerHTML]="isDarkMode ? icons.sun : icons.moon"></span>
              {{ isDarkMode ? "Light Mode" : "Dark Mode" }}
            </a>
          </li>
          <li>
            <a (click)="logout()" class="logout">
              <span class="icon" [innerHTML]="icons.logout"></span> Logout
            </a>
          </li>
        </ul>
      </nav>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [
    `
      .app-layout {
        display: flex;
        height: 100vh;
        width: 100vw;
      }
      .sidebar {
        width: 260px;
        min-width: 260px;
        background: #3880ff;
        color: white;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
      }
      .nav-toggle {
        display: none;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border: none;
        border-radius: 10px;
        background: #3880ff;
        color: white;
        position: fixed;
        top: 12px;
        left: 12px;
        z-index: 1100;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
        cursor: pointer;
      }
      .nav-toggle ::ng-deep svg {
        width: 24px;
        height: 24px;
      }
      .backdrop {
        display: none;
      }
      .sidebar-header {
        padding: 20px 16px;
        font-size: 1.2rem;
        font-weight: 600;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      }
      .nav-list {
        list-style: none;
        margin: 0;
        padding: 8px 0;
        display: flex;
        flex-direction: column;
        flex: 1;
      }
      .nav-section {
        padding: 16px 20px 8px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: rgba(255, 255, 255, 0.5);
      }
      .nav-spacer {
        flex: 1;
      }
      .nav-list li a {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 20px;
        color: rgba(255, 255, 255, 0.85);
        text-decoration: none;
        cursor: pointer;
        transition: background 0.2s;
        font-size: 14px;
      }
      .nav-list li a:hover {
        background: rgba(255, 255, 255, 0.15);
      }
      .nav-list li a.active {
        background: rgba(255, 255, 255, 0.25);
        color: white;
        font-weight: 600;
      }
      .nav-list li a.logout {
        color: #ff6b6b;
      }
      .nav-list li a.theme-toggle {
        color: rgba(255, 255, 255, 0.85);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        margin-top: 8px;
      }
      .icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
      }
      .icon ::ng-deep svg {
        width: 18px;
        height: 18px;
      }
      .main-content {
        flex: 1;
        overflow-y: auto;
        background: var(--bg-primary, #f4f5f8);
        transition: background 0.3s ease;
      }
      @media (max-width: 900px) {
        .app-layout {
          flex-direction: column;
        }
        .nav-toggle {
          display: inline-flex;
        }
        .sidebar {
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          transform: translateX(-100%);
          transition: transform 0.25s ease;
          z-index: 1000;
        }
        .sidebar.open {
          transform: translateX(0);
          padding-left: 56px;
        }
        .backdrop {
          display: block;
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.45);
          z-index: 900;
        }
        .main-content {
          padding-top: 64px;
        }
      }
    `,
  ],
})
export class AppComponent {
  icons = ICONS;
  private router = inject(Router);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  showMenu = false;
  isNavOpen = false;
  isDarkMode = false;
  private isAuthenticated = false;
  private currentUrl = this.router.url || "/";

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentUrl = event.urlAfterRedirects || event.url;
        this.updateMenuVisibility();
      });

    this.authService.getAuthState().subscribe((isAuthenticated) => {
      this.isAuthenticated = isAuthenticated;
      this.updateMenuVisibility();
    });

    this.updateMenuVisibility();

    this.themeService.theme$.subscribe(() => {
      this.isDarkMode = this.themeService.getResolvedTheme() === "dark";
    });
  }

  toggleNav() {
    this.isNavOpen = !this.isNavOpen;
  }

  closeNav() {
    this.isNavOpen = false;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  logout() {
    this.authService.logout();
    this.closeNav();
  }

  private updateMenuVisibility() {
    const path = this.currentUrl.split("?")[0].split("#")[0];
    this.showMenu =
      this.isAuthenticated && !["/login", "/signup"].includes(path);
    if (!this.showMenu) {
      this.isNavOpen = false;
    }
  }
}
