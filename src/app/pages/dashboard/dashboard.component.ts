import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { Client, CompanyStats, Project } from "../../models";
import { DatabaseService } from "../../services/database.service";
import { ActivityService, Activity } from "../../services/activity.service";

// Inline SVG icons
const ICONS: Record<string, string> = {
  business: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
  folder: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
  checkCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
  cash: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>`,
  notifications: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>`,
  rocket: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>`,
  gitBranch: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>`,
  moon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
  star: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
  add: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
  create: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
};

function getIconForAction(action: string): string {
  const actionLower = action.toLowerCase();
  if (actionLower.includes('client')) return 'business';
  if (actionLower.includes('project')) return 'folder';
  if (actionLower.includes('deploy')) return 'rocket';
  if (actionLower.includes('complete')) return 'checkCircle';
  if (actionLower.includes('merge')) return 'gitBranch';
  if (actionLower.includes('feature')) return 'star';
  if (actionLower.includes('revenue') || actionLower.includes('cash')) return 'cash';
  if (actionLower.includes('dark') || actionLower.includes('theme')) return 'moon';
  return 'notifications';
}

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <button class="menu-btn" (click)="toggleMenu()">
        <span [innerHTML]="icons.add"></span>
      </button>
      <h1>Company Overview</h1>
    </header>

    <main class="main-content">
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card primary">
          <div class="stat-icon" [innerHTML]="icons.business"></div>
          <div class="stat-value">{{ clients.length }}</div>
          <div class="stat-label">Total Clients</div>
        </div>

        <div class="stat-card success">
          <div class="stat-icon" [innerHTML]="icons.folder"></div>
          <div class="stat-value">{{ projects.length }}</div>
          <div class="stat-label">Active Projects</div>
        </div>

        <div class="stat-card warning">
          <div class="stat-icon" [innerHTML]="icons.checkCircle"></div>
          <div class="stat-value">{{ productionCount }}</div>
          <div class="stat-label">In Production</div>
        </div>

        <div class="stat-card tertiary">
          <div class="stat-icon" [innerHTML]="icons.cash"></div>
          <div class="stat-value">{{ totalRevenue | number: "1.0-0" }}</div>
          <div class="stat-label">Total Revenue</div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="card">
        <div class="card-header">
          <h2>Recent Activity</h2>
        </div>
        <div class="activity-list">
          <div *ngFor="let activity of recentActivity" class="activity-item">
            <div 
              class="activity-icon" 
              [class]="activity.color || 'medium'"
              [innerHTML]="icons[getIconForAction(activity.action)] || icons.notifications"
            ></div>
            <div class="activity-content">
              <div class="activity-title">{{ activity.action }}</div>
              <div *ngIf="activity.details" class="activity-details">{{ activity.details }}</div>
              <div class="activity-time">{{ formatTime(activity.created_at) }}</div>
            </div>
          </div>
          
          <div *ngIf="recentActivity.length === 0" class="empty-state">
            <p>No recent activity</p>
          </div>
        </div>
      </div>

      <!-- Active Projects -->
      <div class="card">
        <div class="card-header">
          <h2>Active Projects</h2>
          <a routerLink="/clients" class="link">View All →</a>
        </div>
        <div class="project-list">
          <a
            *ngFor="let project of projects.slice(0, 5)"
            class="project-item"
            [routerLink]="['/projects', project.id]"
          >
            <div class="project-info">
              <div class="project-name">{{ project.name }}</div>
              <div class="project-meta">
                {{ project.client_name }} · {{ project.status | titlecase }}
              </div>
            </div>
            <span class="badge" [class]="getStatusColor(project.status)">
              {{ project.status | titlecase }}
            </span>
          </a>
        </div>
      </div>
    </main>
  `,
  styles: [
    `
      .header {
        background: #3880ff;
        color: white;
        padding: 16px 24px;
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .header h1 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
      }
      .menu-btn {
        display: none;
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        padding: 8px;
        border-radius: 8px;
        cursor: pointer;
      }
      .main-content {
        padding: 24px;
        max-width: 1200px;
        margin: 0 auto;
      }
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 24px;
        margin-bottom: 24px;
      }
      @media (max-width: 900px) {
        .stats-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        .menu-btn {
          display: flex;
        }
      }
      @media (max-width: 600px) {
        .stats-grid {
          grid-template-columns: 1fr;
        }
      }
      .stat-card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        text-align: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      .stat-card.primary { border-top: 4px solid #3880ff; }
      .stat-card.success { border-top: 4px solid #2dd36f; }
      .stat-card.warning { border-top: 4px solid #ffc409; }
      .stat-card.tertiary { border-top: 4px solid #5260ff; }
      .stat-icon {
        width: 48px;
        height: 48px;
        margin: 0 auto 12px;
        color: #666;
      }
      .stat-icon ::ng-deep svg {
        width: 48px;
        height: 48px;
      }
      .stat-value {
        font-size: 2.5rem;
        font-weight: bold;
        color: #333;
        margin-bottom: 4px;
      }
      .stat-label {
        color: #666;
        font-size: 14px;
      }
      .card {
        background: white;
        border-radius: 12px;
        margin-bottom: 24px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      .card-header {
        padding: 20px 24px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .card-header h2 {
        margin: 0;
        font-size: 1.1rem;
      }
      .link {
        color: #3880ff;
        text-decoration: none;
      }
      .activity-list {
        padding: 8px 0;
      }
      .activity-item {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        padding: 16px 24px;
        border-bottom: 1px solid #eee;
      }
      .activity-item:last-child {
        border-bottom: none;
      }
      .activity-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .activity-icon ::ng-deep svg {
        width: 20px;
        height: 20px;
      }
      .activity-icon.success { background: #d4edda; color: #155724; }
      .activity-icon.primary { background: #cce5ff; color: #004085; }
      .activity-icon.tertiary { background: #e2e3f3; color: #383d41; }
      .activity-icon.medium { background: #f8f9fa; color: #6c757d; }
      .activity-title {
        font-weight: 600;
        margin-bottom: 4px;
      }
      .activity-details {
        color: #666;
        font-size: 14px;
        margin-bottom: 4px;
      }
      .activity-time {
        color: #999;
        font-size: 12px;
      }
      .empty-state {
        padding: 40px;
        text-align: center;
        color: #999;
      }
      .project-list {
        padding: 8px 0;
      }
      .project-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        border-bottom: 1px solid #eee;
        text-decoration: none;
        color: inherit;
        transition: background 0.2s;
      }
      .project-item:hover {
        background: #f8f9fa;
      }
      .project-item:last-child {
        border-bottom: none;
      }
      .project-name {
        font-weight: 600;
        margin-bottom: 4px;
      }
      .project-meta {
        color: #666;
        font-size: 14px;
      }
      .badge {
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
      }
      .badge.success { background: #d4edda; color: #155724; }
      .badge.warning { background: #fff3cd; color: #856404; }
      .badge.tertiary { background: #e2e3f3; color: #383d41; }
      .badge.medium { background: #f8f9fa; color: #6c757d; }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  icons = ICONS;
  getIconForAction = getIconForAction;
  clients: Client[] = [];
  projects: Project[] = [];
  stats?: CompanyStats;
  recentActivity: Activity[] = [];

  constructor(
    private db: DatabaseService,
    private activityService: ActivityService
  ) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    try {
      this.clients = await this.db.getClients();
      this.projects = await this.db.getProjects();
      this.stats = await this.db.getLatestStats();
      this.recentActivity = await this.activityService.getRecentActivities(5);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      this.loadMockData();
    }
  }

  loadMockData() {
    this.clients = [];
    this.projects = [];
  }

  formatTime(timestamp: string | undefined): string {
    if (!timestamp) return 'Unknown';
    return this.activityService.formatTime(timestamp);
  }

  get productionCount(): number {
    return this.projects.filter((p) => p.status === "production").length;
  }

  get totalRevenue(): number {
    return this.clients.reduce((sum, c) => sum + (c.budget || 0), 0);
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      discovery: "medium",
      in_progress: "warning",
      beta: "tertiary",
      production: "success",
      maintenance: "primary",
      archived: "medium",
    };
    return colors[status] || "medium";
  }

  toggleMenu() {
    // Menu toggle handled by app component
  }
}
