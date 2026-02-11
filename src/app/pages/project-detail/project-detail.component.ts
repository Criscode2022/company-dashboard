import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DatabaseService } from "../../services/database.service";
import { Project, Feature, Version } from "../../models";

@Component({
  selector: "app-project-detail",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div *ngIf="project" class="project-detail">
        <header class="page-header">
          <div>
            <h1>{{ project.name }}</h1>
            <span class="badge" [class]="'badge-' + getStatusColor(project.status)">
              {{ project.status | titlecase }}
            </span>
          </div>
          <span *ngIf="project.budget" class="budget">${{ project.budget | number }}</span>
        </header>

        <p *ngIf="project.description" class="description">{{ project.description }}</p>

        <div class="info-grid">
          <div class="info-card" *ngIf="project.start_date">
            <span class="label">Start Date</span>
            <span class="value">{{ project.start_date | date }}</span>
          </div>
          <div class="info-card" *ngIf="project.deadline">
            <span class="label">Deadline</span>
            <span class="value">{{ project.deadline | date }}</span>
          </div>
        </div>

        <h2>Features</h2>
        <div class="features-list">
          <div *ngFor="let feature of features" class="feature-item">
            <span class="feature-name">{{ feature.name }}</span>
            <span class="badge" [class]="'badge-' + getFeatureStatusColor(feature.status)">
              {{ feature.status | titlecase }}
            </span>
          </div>
        </div>
      </div>

      <div *ngIf="!project" class="empty-state">
        <p>Project not found</p>
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
      .badge {
        padding: 4px 12px;
        border-radius: 100px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
      }
      .badge-success { background: var(--success-bg); color: var(--success-text); }
      .badge-warning { background: var(--warning-bg); color: var(--warning-text); }
      .badge-primary { background: var(--accent); color: white; }
      .badge-medium { background: var(--bg-hover); color: var(--text-secondary); }
      .budget {
        font-size: 24px;
        font-weight: 700;
        color: var(--accent);
      }
      .description {
        color: var(--text-secondary);
        margin-bottom: 24px;
        line-height: 1.6;
      }
      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
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
      .features-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .feature-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        background: var(--bg-card);
        border-radius: 8px;
        border: 1px solid var(--border);
      }
      .feature-name {
        font-weight: 500;
      }
      .empty-state {
        text-align: center;
        padding: 60px;
        color: var(--text-secondary);
      }
    `,
  ],
})
export class ProjectDetailComponent implements OnInit {
  project?: Project;
  features: Feature[] = [];
  versions: Version[] = [];

  constructor(
    private route: ActivatedRoute,
    private db: DatabaseService
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.project = await this.db.getProject(id);
      if (this.project) {
        this.features = await this.db.getFeatures(id);
        this.versions = await this.db.getVersions(id);
      }
    }
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

  getFeatureStatusColor(status: string): string {
    const colors: Record<string, string> = {
      completed: "success",
      in_progress: "warning",
      pending: "medium",
    };
    return colors[status] || "medium";
  }
}
