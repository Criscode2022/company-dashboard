import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DatabaseService } from "../../services/database.service";
import { DailyMemory } from "../../models";

@Component({
  selector: "app-memory-detail",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div *ngIf="memory" class="memory-detail">
        <header class="page-header">
          <span class="date">{{ memory.date | date: 'longDate' }}</span>
          <div class="stats">
            <span class="badge">{{ memory.clients_active }} clients</span>
            <span class="badge">{{ memory.projects_active }} projects</span>
            <span class="badge">{{ memory.commits_total }} commits</span>
          </div>
        </header>

        <h1>{{ memory.title }}</h1>

        <div class="content" [innerHTML]="memory.content | nl2br"></div>
      </div>

      <div *ngIf="!memory" class="empty-state">
        <p>Memory not found</p>
      </div>
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 24px;
        max-width: 900px;
        margin: 0 auto;
      }
      .memory-detail {
        background: var(--bg-card);
        border-radius: 12px;
        border: 1px solid var(--border);
        box-shadow: var(--shadow-sm);
        padding: 32px;
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--border);
      }
      .date {
        font-size: 14px;
        color: var(--text-secondary);
      }
      .stats {
        display: flex;
        gap: 8px;
      }
      .badge {
        padding: 4px 12px;
        background: var(--bg-tertiary);
        color: var(--text-secondary);
        border-radius: 100px;
        font-size: 12px;
      }
      h1 {
        margin: 0 0 24px 0;
        font-size: 24px;
      }
      .content {
        line-height: 1.8;
        color: var(--text-primary);
      }
      .content ::ng-deep h2 {
        margin-top: 32px;
        margin-bottom: 16px;
        font-size: 20px;
      }
      .content ::ng-deep h3 {
        margin-top: 24px;
        margin-bottom: 12px;
        font-size: 18px;
      }
      .content ::ng-deep p {
        margin-bottom: 16px;
      }
      .content ::ng-deep ul, .content ::ng-deep ol {
        margin-bottom: 16px;
        padding-left: 24px;
      }
      .content ::ng-deep li {
        margin-bottom: 8px;
      }
      .content ::ng-deep code {
        background: var(--bg-tertiary);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: monospace;
      }
      .empty-state {
        text-align: center;
        padding: 60px;
        color: var(--text-secondary);
      }
    `,
  ],
})
export class MemoryDetailComponent implements OnInit {
  memory?: DailyMemory;

  constructor(
    private route: ActivatedRoute,
    private db: DatabaseService
  ) {}

  async ngOnInit() {
    const date = this.route.snapshot.paramMap.get('date');
    if (date) {
      this.memory = await this.db.getDailyMemory(date);
    }
  }
}
