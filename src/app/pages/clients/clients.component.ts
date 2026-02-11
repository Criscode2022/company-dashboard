import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { Client } from "../../models";
import { DatabaseService } from "../../services/database.service";

@Component({
  selector: "app-clients",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>Clients & Projects</h1>
        <span class="badge badge-primary">{{ clients.length }} Clients</span>
      </header>

      <div class="clients-list">
        <a
          *ngFor="let client of clients"
          class="client-card"
          [routerLink]="['/clients', client.id]"
        >
          <div class="card-header">
            <h3>{{ client.name }}</h3>
            <div class="badges">
              <span class="badge" [class]="'badge-' + getIndustryColor(client.industry)">
                {{ client.industry | titlecase }}
              </span>
              <span class="badge" [class]="'badge-' + getStatusColor(client.status)">
                {{ client.status | titlecase }}
              </span>
            </div>
          </div>

          <div class="card-body">
            <p *ngIf="client.contact_name" class="contact-info">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              {{ client.contact_name }}
            </p>
            <p *ngIf="client.email" class="contact-info">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              {{ client.email }}
            </p>

            <div class="card-footer">
              <span><strong>Projects:</strong> {{ getProjectCount(client.id) }}</span>
              <span *ngIf="client.budget"><strong>Budget:</strong> ${{ client.budget | number }}</span>
            </div>
          </div>
        </a>
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
        align-items: center;
        margin-bottom: 24px;
      }
      .page-header h1 {
        margin: 0;
      }
      .clients-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 20px;
      }
      .client-card {
        background: var(--bg-card);
        border-radius: 12px;
        border: 1px solid var(--border);
        box-shadow: var(--shadow-sm);
        text-decoration: none;
        color: inherit;
        transition: transform 0.2s, box-shadow 0.2s;
        overflow: hidden;
      }
      .client-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }
      .card-header {
        padding: 20px;
        border-bottom: 1px solid var(--border);
        background: var(--bg-tertiary);
      }
      .card-header h3 {
        margin: 0 0 12px 0;
        font-size: 18px;
      }
      .badges {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
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
      .card-body {
        padding: 20px;
      }
      .contact-info {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 12px 0;
        color: var(--text-secondary);
        font-size: 14px;
      }
      .icon {
        width: 16px;
        height: 16px;
        color: var(--text-tertiary);
      }
      .card-footer {
        display: flex;
        justify-content: space-between;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--border);
        font-size: 14px;
        color: var(--text-secondary);
      }
    `,
  ],
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
  projectCounts: Map<string, number> = new Map();

  constructor(private db: DatabaseService) {}

  async ngOnInit() {
    await this.loadClients();
  }

  async loadClients() {
    try {
      this.clients = await this.db.getClients();
      for (const client of this.clients) {
        const projects = await this.db.getProjects(client.id);
        this.projectCounts.set(client.id, projects.length);
      }
    } catch (error) {
      console.error("Error loading clients:", error);
    }
  }

  getProjectCount(clientId: string): number {
    return this.projectCounts.get(clientId) || 0;
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
    };
    return colors[status] || "medium";
  }
}
