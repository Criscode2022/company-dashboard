import { CommonModule } from "@angular/common";
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from "@angular/core";
import { NavigationEnd, Router, RouterModule } from "@angular/router";
import { addIcons } from "ionicons";
import {
  book,
  business,
  logOut,
  menuOutline,
  statsChart,
  trendingUp,
} from "ionicons/icons";
import { filter } from "rxjs/operators";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="app-layout">
      <button
        *ngIf="showMenu"
        class="nav-toggle"
        type="button"
        (click)="toggleNav()"
        aria-label="Toggle navigation"
      >
        <ion-icon name="menu-outline"></ion-icon>
      </button>
      <div
        *ngIf="showMenu && isNavOpen"
        class="backdrop"
        (click)="closeNav()"
      ></div>
      <nav class="sidebar" *ngIf="showMenu" [class.open]="isNavOpen">
        <div class="sidebar-header">Company Dashboard</div>
        <ul class="nav-list">
          <li>
            <a
              routerLink="/dashboard"
              routerLinkActive="active"
              (click)="closeNav()"
            >
              <ion-icon name="stats-chart"></ion-icon> Overview
            </a>
          </li>
          <li>
            <a
              routerLink="/clients"
              routerLinkActive="active"
              (click)="closeNav()"
            >
              <ion-icon name="business"></ion-icon> Clients & Projects
            </a>
          </li>
          <li>
            <a
              routerLink="/memory"
              routerLinkActive="active"
              (click)="closeNav()"
            >
              <ion-icon name="book"></ion-icon> Daily Memory
            </a>
          </li>
          <li>
            <a
              routerLink="/stats"
              routerLinkActive="active"
              (click)="closeNav()"
            >
              <ion-icon name="trending-up"></ion-icon> Statistics
            </a>
          </li>
          <li>
            <a (click)="logout()" class="logout">
              <ion-icon name="log-out"></ion-icon> Logout
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
        background: var(--ion-color-primary, #3880ff);
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
        background: var(--ion-color-primary, #3880ff);
        color: white;
        position: fixed;
        top: 12px;
        left: 12px;
        z-index: 1100;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
        cursor: pointer;
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
      }
      .nav-list li a {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 20px;
        color: rgba(255, 255, 255, 0.85);
        text-decoration: none;
        cursor: pointer;
        transition: background 0.2s;
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
      .main-content {
        flex: 1;
        overflow-y: auto;
        background: #f4f5f8;
      }
      ion-icon {
        font-size: 20px;
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
  private router = inject(Router);
  showMenu = false;
  isNavOpen = false;

  constructor() {
    addIcons({ statsChart, business, book, trendingUp, logOut, menuOutline });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.showMenu = !["/login", "/signup"].includes(event.url);
        if (!this.showMenu) {
          this.isNavOpen = false;
        }
      });
  }

  toggleNav() {
    this.isNavOpen = !this.isNavOpen;
  }

  closeNav() {
    this.isNavOpen = false;
  }

  logout() {
    localStorage.removeItem("company-dashboard-session");
    this.router.navigate(["/login"]);
    this.closeNav();
  }
}
