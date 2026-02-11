import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { DatabaseService } from "../../services/database.service";
import { Client, Project, Feature, Version } from "../../models";

@Component({
  selector: "app-client-detail",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-container">
      <div *ngIf="client" class="client-detail">
        <header class="page-header">
          <div>
            <h1>{{ client.name }}</h1>
            <div class="badges">
              <span class="badge" [class]="'badge-' + getIndustryColor(client.industry)">
                {{ client.industry | titlecase }}
              </span>
              <span class="badge" [class]="'badge-' + getStatusColor(client.status)">
                {{ client.status | titlecase }}</span>
            </div>
          </div>
          <span *ngIf="client.budget" class="budget">${{ client.budget | number }}</span>
        </header>

        <div class="info-grid">
          <div class="info-card" *ngIf="client.contact_name">
            <span class="label">Contact</span>
            <span class="value">{{ client.contact_name }}</span>
          </div>
          <div class="info-card" *ngIf="client.email">
            <span class="label">Email</span>
            <span class="value">{{ client.email }}</span>
          </div>
        </div>

        <h2>Projects</h2>
        <div class="projects-list">
          <div *ngFor="let project of projects" class="project-card">
            <h3>{{ project.name }}</h3>
            <p *ngIf="project.description">{{ project.description }}</p>
            <div class="project-meta">
              <span class="badge" [class]="'badge-' + getStatusColor(project.status)">
                {{ project.status | titlecase }}
              </span>
              <span *ngIf="project.deadline">Due: {{ project.deadline | date }}</span>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!client" class="empty-state">
        <p>Client not found</p>
      </div>
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 24px;
        max-width: 1200px;
        margin: 0 auto;
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24px;
      }
      .page-header h1 {
        margin: 0 0 12px 0;
      }
      .badges {
        display: flex;
        gap: 8px;
      }
      .badge {
        padding: 4px 12px;
        border-radius: 100px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
      }
      .badge-success { background: var(--success-bg); color: var(--success-text); }
      .badge-tertiary { background: var(--info-bg); color: var(--info-text); }
      .badge-warning { background: var(--warning-bg); color: var(--warning-text); }
      .badge-primary { background: var(--accent); color: white; }
      .badge-medium { background: var(--bg-hover); color: var(--text-secondary); }
      .budget {
        font-size: 24px;
        font-weight: 700;
        color: var(--accent);
      }
      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 16px;
        margin-bottom: 32px;
      }
      .info-card {
        background: var(--bg-card);
        border-radius: 8px;
        padding: 16px;
        border: 1px solid var(--border);
      }
      .info-card .label {
        display: block;
        font-size: 12px;
        color: var(--text-tertiary);
        text-transform: uppercase;
        margin-bottom: 4px;
      }
      .info-card .value {
        font-size: 16px;
        color: var(--text-primary);
      }
      h2 {
        margin: 32px 0 16px 0;
        font-size: 20px;
      }
      .projects-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .project-card {
        background: var(--bg-card);
        border-radius: 12px;
        padding: 20px;
        border: 1px solid var(--border);
        box-shadow: var(--shadow-sm);
      }
      .project-card h3 {
        margin: 0 0 8px 0;
      }
      .project-card p {
        margin: 0 0 12px 0;
        color: var(--text-secondary);
      }
      .project-meta {
        display: flex;
        gap: 16px;
        align-items: center;
        font-size: 14px;
        color: var(--text-secondary);
      }
      .empty-state {
        text-align: center;
        padding: 60px;
        color: var(--text-secondary);
      }
    `,
  ],
})
export class ClientDetailComponent implements OnInit {
  client?: Client;
  projects: Project[] = [];

  constructor(
    private route: ActivatedRoute,
    private db: DatabaseService
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.client = await this.db.getClient(id);
      this.projects = await this.db.getProjects(id);
    }
  }

  getIndustryColor(industry?: string): string {
    const colors: Record<string, string> = {
      restaurant: "success",
      fitness: "tertiary",
      retail: "warning",
      technology: "primary",
      bakery: "success",
      education: "primary",
    };
    return colors[industry || ""] || "medium";
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      active: "success",
      paused: "warning",
      completed: "primary",
      in_progress: "warning",
      production: "success",
    };
    return colors[status] || "medium";
  }
}
