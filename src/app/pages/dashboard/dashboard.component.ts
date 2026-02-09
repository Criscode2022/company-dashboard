import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  IonContent,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  business, folder, checkmarkCircle, cash, rocket, 
  gitBranch, book, arrowForward
} from 'ionicons/icons';
import { Client, CompanyStats, Project } from '../../models';
import { DatabaseService } from '../../services/database.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, IonContent, IonIcon],
  template: `
    <ion-content class="page-container"
      <!-- Page Header -->
      <div class="page-header animate-fade-in"
        <h1 class="page-title"
          <span>👋</span>
          Welcome Back
        </h1>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid"
        <div class="stat-card animate-slide-in" style="animation-delay: 0.05s"
          <div class="stat-icon primary">📊</div>
          <div class="stat-value">{{ clients.length }}</div>
          <div class="stat-label">Total Clients</div>
        </div>

        <div class="stat-card animate-slide-in" style="animation-delay: 0.1s"
          <div class="stat-icon success">🚀</div>
          <div class="stat-value">{{ projects.length }}</div>
          <div class="stat-label">Active Projects</div>
        </div>

        <div class="stat-card animate-slide-in" style="animation-delay: 0.15s"
          <div class="stat-icon warning">✅</div>
          <div class="stat-value">{{ productionCount }}</div>
          <div class="stat-label">In Production</div>
        </div>

        <div class="stat-card animate-slide-in" style="animation-delay: 0.2s"
          <div class="stat-icon danger">💰</div>
          <div class="stat-value">${{ totalRevenue | number:'1.0-0' }}</div>
          <div class="stat-label">Total Revenue</div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="content-grid"
        <!-- Active Projects -->
        <div class="card animate-fade-in" style="animation-delay: 0.25s"
          <div class="card-header"
            <h2>🚀 Active Projects</h2>
            <a routerLink="/clients" class="btn btn-ghost btn-sm"
              View All
              <ion-icon name="arrow-forward"></ion-icon>
            </a>
          </div>
          <div class="card-body"
            <div class="project-list"
              <div 
                *ngFor="let project of projects.slice(0, 5); let i = index"
                class="project-item"
                [routerLink]="['/projects', project.id]"
                [style.animation-delay]="0.3 + (i * 0.05) + 's'"
              
                <div class="project-info"
                  <div class="project-name">{{ project.name }}</div>
                  <div class="project-client">{{ project.client_name }}</div>
                </div>
                <span class="badge" [class]="'badge-' + getStatusColor(project.status)"
                  {{ project.status | titlecase }}
                </span>
              </div>
            </div>
            
            <div *ngIf="projects.length === 0" class="empty-state"
              <div class="empty-state-icon">📁</div>
              <h3>No projects yet</h3>
              <p>Create your first project to get started</p>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="card animate-fade-in" style="animation-delay: 0.3s"
          <div class="card-header"
            <h2>🔔 Recent Activity</h2>
          </div>
          <div class="card-body"
            <div class="activity-list"
              <div 
                *ngFor="let activity of recentActivity; let i = index"
                class="activity-item"
                [style.animation-delay]="0.35 + (i * 0.05) + 's'"
              
                <div class="activity-icon" [class]="activity.color"
                  {{ activity.emoji }}
                </div>
                <div class="activity-content"
                  <div class="activity-title">{{ activity.title }}</div>
                  <div class="activity-desc">{{ activity.description }}</div>
                  <div class="activity-time">{{ activity.time }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    :host {
      display: block;
    }

    .page-container {
      --padding-top: 24px;
      --padding-start: 24px;
      --padding-end: 24px;
      --padding-bottom: 24px;
      --background: var(--bg-primary);
    }

    .page-header {
      margin-bottom: 28px;
    }

    .page-title {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 28px;
    }

    .stat-card {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      padding: 24px;
      border: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
      transition: transform var(--transition-fast), box-shadow var(--transition-fast);
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      margin-bottom: 16px;
    }

    .stat-icon.primary { background: var(--accent-light); }
    .stat-icon.success { background: var(--success-bg); }
    .stat-icon.warning { background: var(--warning-bg); }
    .stat-icon.danger { background: var(--danger-bg); }

    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 14px;
      color: var(--text-secondary);
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
    }

    @media (min-width: 1024px) {
      .content-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    .card {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }

    .card-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .card-header h2 {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .card-body {
      padding: 16px;
    }

    .project-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .project-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: background var(--transition-fast);
    }

    .project-item:hover {
      background: var(--bg-hover);
    }

    .project-info {
      flex: 1;
    }

    .project-name {
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 2px;
    }

    .project-client {
      font-size: 13px;
      color: var(--text-tertiary);
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 100px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .badge-success { background: var(--success-bg); color: var(--success-text); }
    .badge-warning { background: var(--warning-bg); color: var(--warning-text); }
    .badge-info { background: var(--info-bg); color: var(--info-text); }
    .badge-medium { background: var(--bg-tertiary); color: var(--text-secondary); }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 8px 0;
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }

    .activity-content {
      flex: 1;
    }

    .activity-title {
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 2px;
    }

    .activity-desc {
      font-size: 13px;
      color: var(--text-secondary);
      margin-bottom: 4px;
    }

    .activity-time {
      font-size: 12px;
      color: var(--text-tertiary);
    }

    .empty-state {
      text-align: center;
      padding: 40px 24px;
      color: var(--text-secondary);
    }

    .empty-state-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      font-size: 16px;
      color: var(--text-primary);
      margin-bottom: 8px;
    }

    .empty-state p {
      font-size: 14px;
      margin: 0;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 13px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  clients: Client[] = [];
  projects: Project[] = [];
  stats?: CompanyStats;

  recentActivity = [
    { emoji: '📚', color: 'tertiary', title: 'New Project: TaskFlow', description: 'React learning app added', time: 'Just now' },
    { emoji: '🚀', color: 'success', title: 'GreenFork Deployed', description: 'Production deployment successful', time: '8 hours ago' },
    { emoji: '🌿', color: 'primary', title: 'FitPulse Repository Created', description: 'New project initialized', time: '1 day ago' },
    { emoji: '💪', color: 'info', title: 'New Client: FitPulse Studio', description: 'Marcus Chen - $15K budget', time: '2 days ago' },
    { emoji: '✅', color: 'success', title: 'GreenFork v1.0 Complete', description: 'All features delivered', time: '3 days ago' },
  ];

  constructor(private db: DatabaseService) {
    addIcons({ business, folder, checkmarkCircle, cash, rocket, gitBranch, book, arrowForward });
  }

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    try {
      this.clients = await this.db.getClients();
      this.projects = await this.db.getProjects();
      this.stats = await this.db.getLatestStats();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.loadMockData();
    }
  }

  loadMockData() {
    this.clients = [
      { id: '1', name: 'GreenFork Bistro', industry: 'restaurant', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '2', name: 'FitPulse Studio', industry: 'fitness', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '3', name: 'TaskFlow (Internal)', industry: 'technology', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ];
    this.projects = [
      { id: '1', client_id: '1', name: 'GreenFork Scheduler', client_name: 'GreenFork Bistro', status: 'production', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '2', client_id: '2', name: 'FitPulse Studio', client_name: 'FitPulse Studio', status: 'in_progress', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '3', client_id: '3', name: 'TaskFlow', client_name: 'TaskFlow (Internal)', status: 'in_progress', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ];
  }

  get productionCount(): number {
    return this.projects.filter(p => p.status === 'production').length;
  }

  get totalRevenue(): number {
    return this.clients.reduce((sum, c) => sum + (c.budget || 0), 0);
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      discovery: 'medium',
      in_progress: 'warning',
      beta: 'info',
      production: 'success',
      maintenance: 'primary',
      archived: 'medium',
    };
    return colors[status] || 'medium';
  }
}
