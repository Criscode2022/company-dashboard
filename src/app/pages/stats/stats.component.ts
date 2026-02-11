import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { DatabaseService } from "../../services/database.service";
import { CompanyStats } from "../../models";

@Component({
  selector: "app-stats",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>📊 Statistics</h1>
      </header>

      <div *ngIf="stats.length > 0" class="stats-container">
        <div class="stats-summary">
          <div class="summary-card">
            <span class="value">{{ latestStats?.total_clients }}</span>
            <span class="label">Total Clients</span>
          </div>
          <div class="summary-card">
            <span class="value">{{ latestStats?.total_projects }}</span>
            <span class="label">Total Projects</span>
          </div>
          <div class="summary-card">
            <span class="value">${{ latestStats?.total_revenue | number:'1.0-0' }}</span>
            <span class="label">Total Revenue</span>
          </div>
        </div>

        <h2>Daily History</h2>
        <div class="stats-table">
          <div class="table-header">
            <span>Date</span>
            <span>Clients</span>
            <span>Projects</span>
            <span>Revenue</span>
          </div>
          <div *ngFor="let stat of stats" class="table-row">
            <span>{{ stat.date | date:'mediumDate' }}</span>
            <span>{{ stat.total_clients }}</span>
            <span>{{ stat.total_projects }}</span>
            <span>${{ stat.total_revenue | number:'1.0-0' }}</span>
          </div>
        </div>
      </div>

      <div *ngIf="stats.length === 0" class="empty-state">
        <p>No statistics available</p>
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
        margin-bottom: 24px;
      }
      .page-header h1 {
        margin: 0;
      }
      .stats-summary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 32px;
      }
      .summary-card {
        background: var(--bg-card);
        border-radius: 12px;
        padding: 24px;
        text-align: center;
        border: 1px solid var(--border);
        box-shadow: var(--shadow-sm);
      }
      .summary-card .value {
        display: block;
        font-size: 32px;
        font-weight: 700;
        color: var(--accent);
        margin-bottom: 8px;
      }
      .summary-card .label {
        color: var(--text-secondary);
        font-size: 14px;
      }
      h2 {
        margin: 32px 0 16px 0;
        font-size: 20px;
      }
      .stats-table {
        background: var(--bg-card);
        border-radius: 12px;
        border: 1px solid var(--border);
        overflow: hidden;
      }
      .table-header {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr;
        gap: 16px;
        padding: 16px 20px;
        background: var(--bg-tertiary);
        font-weight: 600;
        font-size: 14px;
        color: var(--text-secondary);
      }
      .table-row {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr;
        gap: 16px;
        padding: 16px 20px;
        border-top: 1px solid var(--border);
        font-size: 14px;
      }
      .table-row:hover {
        background: var(--bg-hover);
      }
      .empty-state {
        text-align: center;
        padding: 60px;
        color: var(--text-secondary);
      }
    `,
  ],
})
export class StatsComponent implements OnInit {
  stats: CompanyStats[] = [];

  constructor(private db: DatabaseService) {}

  async ngOnInit() {
    this.stats = await this.db.getCompanyStats(30);
  }

  get latestStats(): CompanyStats | undefined {
    return this.stats[0];
  }
}
