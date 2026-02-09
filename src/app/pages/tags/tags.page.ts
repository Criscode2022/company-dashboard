import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { Tag } from '../../models/task.model';
import { DEFAULT_TAG_COLORS } from '../../models/task.model';

@Component({
  selector: 'app-tags',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container"
      <div class="page-header"
        <h1 class="page-title">🏷️ Tags</h1>
        <button class="btn btn-primary" (click)="showAddTag = true"
          + New Tag
        </button>
      </div>

      <!-- Add Tag Form -->
      <div *ngIf="showAddTag" class="card mb-4"
        <div class="card-body"
          <h3>Create New Tag</h3>
          <div class="form-row"
            <div class="form-group"
              <label>Tag Name</label>
              <input 
                type="text" 
                [(ngModel)]="newTagName"
                placeholder="e.g., Bug Fix"
                class="form-input"
              >
            </div>
            <div class="form-group"
              <label>Color</label>
              <div class="color-picker"
                <div 
                  *ngFor="let color of defaultColors"
                  class="color-option"
                  [style.background]="color"
                  [class.selected]="newTagColor === color"
                  (click)="newTagColor = color"
                ></div>
              </div>
            </div>
          </div>
          <div class="form-actions"
            <button class="btn btn-secondary" (click)="showAddTag = false">Cancel</button>
            <button class="btn btn-primary" (click)="createTag()" [disabled]="!newTagName">Create Tag</button>
          </div>
        </div>
      </div>

      <!-- Tags Grid -->
      <div class="tags-grid"
        <div 
          *ngFor="let tag of tags"
          class="tag-card"
          [style.border-left-color]="tag.color"
        
          <div class="tag-header"
            <div class="tag-color" [style.background]="tag.color"></div>
            <div class="tag-name">{{ tag.name }}</div>
          </div>
          
          <div class="tag-stats"
            <div class="stat"
              <div class="stat-value">{{ getTaskCount(tag.id) }}</div>
              <div class="stat-label">tasks</div>
            </div>
          </div>
          
          <div class="tag-actions"
            <button class="btn btn-ghost btn-sm" (click)="deleteTag(tag.id)">🗑️ Delete</button>
          </div>
        </div>
      </div>

      <div *ngIf="tags.length === 0" class="empty-state"
        <div class="empty-state-icon">🏷️</div>
        <h3>No tags yet</h3>
        <p>Create tags to organize your tasks</p>
      </div>
    </div>
  `,
  styles: [`
    .mb-4 { margin-bottom: 24px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px; }
    
    .color-picker {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .color-option {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      border: 2px solid transparent;
    }
    .color-option:hover { transform: scale(1.1); }
    .color-option.selected {
      border-color: var(--text-primary);
      box-shadow: 0 0 0 2px var(--bg-primary), 0 0 0 4px var(--text-primary);
    }
    
    .tags-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
    }
    
    .tag-card {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      border-left-width: 4px;
      padding: 20px;
      transition: box-shadow var(--transition-fast);
    }
    .tag-card:hover { box-shadow: var(--shadow-md); }
    
    .tag-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    .tag-color {
      width: 16px;
      height: 16px;
      border-radius: 50%;
    }
    .tag-name {
      font-weight: 600;
      font-size: 16px;
    }
    
    .tag-stats {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }
    .stat {
      text-align: center;
    }
    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary);
    }
    .stat-label {
      font-size: 12px;
      color: var(--text-secondary);
    }
    
    .tag-actions {
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class TagsPage implements OnInit {
  tags: Tag[] = [];
  showAddTag = false;
  newTagName = '';
  newTagColor = DEFAULT_TAG_COLORS[0];
  defaultColors = DEFAULT_TAG_COLORS;
  taskCounts: Map<string, number> = new Map();

  constructor(private taskService: TaskService) {}

  async ngOnInit() {
    await this.loadTags();
  }

  async loadTags() {
    this.tags = await this.taskService.getTags();
    // Calculate task counts for each tag
    const tasks = await this.taskService.getTasks();
    this.taskCounts.clear();
    for (const task of tasks) {
      for (const tagId of task.tagIds) {
        this.taskCounts.set(tagId, (this.taskCounts.get(tagId) || 0) + 1);
      }
    }
  }

  getTaskCount(tagId: string): number {
    return this.taskCounts.get(tagId) || 0;
  }

  async createTag() {
    if (!this.newTagName) return;
    
    await this.taskService.createTag({
      name: this.newTagName,
      color: this.newTagColor,
    });
    
    this.newTagName = '';
    this.newTagColor = DEFAULT_TAG_COLORS[0];
    this.showAddTag = false;
    await this.loadTags();
  }

  async deleteTag(id: string) {
    if (confirm('Delete this tag? It will be removed from all tasks.')) {
      // Note: Actual deletion would need to handle tag removal from tasks
      console.log('Delete tag:', id);
      await this.loadTags();
    }
  }
}
