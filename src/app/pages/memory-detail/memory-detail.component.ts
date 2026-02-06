import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService } from '../../services/database.service';
import { DailyMemory } from '../../models';

// Simple markdown parser (in real app, use marked library)
@Component({
  selector: 'app-memory-detail',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/memory"></ion-back-button>
        </ion-buttons>
        <ion-title>{{memory?.date | date:'mediumDate'}}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="download()">
            <ion-icon name="download" slot="start"></ion-icon>
            Download
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Loading -->
      <div *ngIf="!memory" class="ion-text-center ion-padding">
        <ion-spinner></ion-spinner>
        <p>Loading memory...</p>
      </div>

      <!-- Memory Content -->
      <div *ngIf="memory">
        <!-- Header Card -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>{{memory.title || 'Daily Log'}}</ion-card-title>
            <ion-card-subtitle>{{memory.date | date:'fullDate'}}</ion-card-subtitle>
          </ion-card-header>
          
          <ion-card-content>
            <ion-row>
              <ion-col size="4" *ngIf="memory.clients_active > 0">
                <div class="stat-box">
                  <div class="stat-number">{{memory.clients_active}}</div>
                  <div class="stat-label">Clients</div>
                </div>
              </ion-col>
              <ion-col size="4" *ngIf="memory.projects_active > 0">
                <div class="stat-box">
                  <div class="stat-number">{{memory.projects_active}}</div>
                  <div class="stat-label">Projects</div>
                </div>
              </ion-col>
              <ion-col size="4" *ngIf="memory.commits_total > 0">
                <div class="stat-box">
                  <div class="stat-number">{{memory.commits_total}}</div>
                  <div class="stat-label">Commits</div>
                </div>
              </ion-col>
            </ion-row>
          </ion-card-content>
        </ion-card>

        <!-- Markdown Content -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Daily Notes</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="markdown-content" [innerHTML]="renderedContent"></div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .stat-box {
      text-align: center;
      padding: 1rem;
      background: var(--ion-color-light);
      border-radius: 8px;
    }
    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      color: var(--ion-color-primary);
    }
    .stat-label {
      font-size: 0.875rem;
      color: var(--ion-color-medium);
    }
    .markdown-content {
      line-height: 1.6;
    }
    .markdown-content h1 {
      font-size: 1.5rem;
      font-weight: bold;
      margin: 1rem 0;
      color: var(--ion-color-primary);
    }
    .markdown-content h2 {
      font-size: 1.25rem;
      font-weight: bold;
      margin: 0.875rem 0;
      color: var(--ion-color-secondary);
    }
    .markdown-content h3 {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0.75rem 0;
    }
    .markdown-content p {
      margin: 0.5rem 0;
    }
    .markdown-content ul, .markdown-content ol {
      margin: 0.5rem 0;
      padding-left: 1.5rem;
    }
    .markdown-content li {
      margin: 0.25rem 0;
    }
    .markdown-content code {
      background: var(--ion-color-light);
      padding: 0.125rem 0.375rem;
      border-radius: 4px;
      font-family: monospace;
    }
    .markdown-content pre {
      background: var(--ion-color-light);
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
    }
    .markdown-content blockquote {
      border-left: 4px solid var(--ion-color-primary);
      margin: 0.5rem 0;
      padding-left: 1rem;
      color: var(--ion-color-medium);
    }
    .markdown-content table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
    }
    .markdown-content th, .markdown-content td {
      border: 1px solid var(--ion-color-light);
      padding: 0.5rem;
      text-align: left;
    }
    .markdown-content th {
      background: var(--ion-color-light);
      font-weight: 600;
    }
  `]
})
export class MemoryDetailComponent implements OnInit {
  date: string = '';
  memory?: DailyMemory;
  renderedContent: string = '';

  constructor(
    private route: ActivatedRoute,
    private db: DatabaseService
  ) {}

  async ngOnInit() {
    this.date = this.route.snapshot.paramMap.get('date') || '';
    await this.loadMemory();
  }

  async loadMemory() {
    try {
      this.memory = await this.db.getDailyMemory(this.date);
      if (this.memory) {
        this.renderedContent = this.renderMarkdown(this.memory.content);
      }
    } catch (error) {
      console.error('Error loading memory:', error);
      // Load from mock data
      this.loadMockData();
    }
  }

  loadMockData() {
    this.memory = {
      id: '1',
      date: this.date,
      filename: `${this.date}.md`,
      title: 'Sample Memory Entry',
      content: '# Sample Content\n\nThis is a sample memory entry.',
      clients_active: 2,
      projects_active: 2,
      commits_total: 6,
      new_features: 3,
      bugs_fixed: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.renderedContent = this.renderMarkdown(this.memory.content);
  }

  renderMarkdown(content: string): string {
    // Simple markdown parser (in production, use 'marked' library)
    let html = content
      // Headers
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      // Bold and italic
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Lists
      .replace(/^\* (.+)$/gm, '<li>$1</li>')
      // Line breaks
      .replace(/\n/g, '<br>');
    
    return html;
  }

  download() {
    if (!this.memory) return;
    
    const blob = new Blob([this.memory.content], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.memory.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}