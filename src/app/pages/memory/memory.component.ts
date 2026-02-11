import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { DatabaseService } from "../../services/database.service";
import { DailyMemory } from "../../models";

@Component({
  selector: "app-memory",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>📚 Daily Memory</h1>
      </header>

      <div class="memory-list">
        <div *ngFor="let memory of memories" class="memory-card">
          <div class="card-header">
            <span class="date">{{ memory.date | date: 'longDate' }}</span>
            <span class="badge">{{ memory.clients_active }} clients · {{ memory.projects_active }} projects</span>
          </div>
          <div class="card-body">
            <h3>{{ memory.title }}</h3>
            <p class="summary">{{ memory.summary }}</p>
            <div class="stats">
              <span>{{ memory.commits_total }} commits</span>
              <span>{{ memory.new_features }} features</span>
            </div>
          </div>
        </div>
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
      .memory-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .memory-card {
        background: var(--bg-card);
        border-radius: 12px;
        border: 1px solid var(--border);
        box-shadow: var(--shadow-sm);
        overflow: hidden;
      }
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        background: var(--bg-tertiary);
        border-bottom: 1px solid var(--border);
      }
      .date {
        font-weight: 600;
        color: var(--text-primary);
      }
      .badge {
        padding: 4px 12px;
        background: var(--accent);
        color: white;
        border-radius: 100px;
        font-size: 12px;
      }
      .card-body {
        padding: 20px;
      }
      .card-body h3 {
        margin: 0 0 12px 0;
        font-size: 18px;
      }
      .summary {
        color: var(--text-secondary);
        margin: 0 0 16px 0;
        line-height: 1.6;
      }
      .stats {
        display: flex;
        gap: 16px;
        font-size: 14px;
        color: var(--text-tertiary);
      }
    `,
  ],
})
export class MemoryComponent implements OnInit {
  memories: DailyMemory[] = [];

  constructor(private db: DatabaseService) {}

  async ngOnInit() {
    this.memories = await this.db.getDailyMemories();
  }
}
