import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { ActivityEntry } from '../../models/task.model';

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container"
      <div class="page-header"
        <h1 class="page-title">📊 Activity Log</h1>
      </div>

      <div class="card"
        <div class="activity-list"
          <div 
            *ngFor="let activity of activities; let i = index"
            class="activity-item"
            [class]="getActionClass(activity.action)"
          
            <div class="activity-icon">{{ getActivityIcon(activity.action) }}</div>
            
            <div class="activity-content"
              <div class="activity-header"
                <span class="activity-action">{{ activity.action }}</span>
                <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
              </div>
              <div class="activity-details" *ngIf="activity.details">{{ activity.details }}</div>
            </div>
          </div>
          
          <div *ngIf="activities.length === 0" class="empty-state"
            <div class="empty-state-icon">📋</div>
            <h3>No activity yet</h3>
            <p>Activity will appear as you work on tasks</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .activity-list {
      display: flex;
      flex-direction: column;
    }
    
    .activity-item {
      display: flex;
      gap: 16px;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
      transition: background var(--transition-fast);
    }
    .activity-item:hover { background: var(--bg-hover); }
    .activity-item:last-child { border-bottom: none; }
    
    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }
    
    .activity-content {
      flex: 1;
    }
    
    .activity-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    
    .activity-action {
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .activity-time {
      font-size: 12px;
      color: var(--text-tertiary);
    }
    
    .activity-details {
      font-size: 14px;
      color: var(--text-secondary);
    }
    
    /* Action type colors */
    .activity-item.created .activity-icon { background: var(--success-bg); }
    .activity-item.updated .activity-icon { background: var(--info-bg); }
    .activity-item.completed .activity-icon { background: var(--success-bg); }
    .activity-item.deleted .activity-icon { background: var(--danger-bg); }
    .activity-item.default .activity-icon { background: var(--bg-tertiary); }
  `]
})
export class ActivityPage implements OnInit {
  activities: ActivityEntry[] = [];

  constructor(private taskService: TaskService) {}

  async ngOnInit() {
    await this.loadActivity();
  }

  async loadActivity() {
    this.activities = await this.taskService.getActivityLog();
  }

  getActionClass(action: string): string {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('create')) return 'created';
    if (actionLower.includes('update')) return 'updated';
    if (actionLower.includes('complete')) return 'completed';
    if (actionLower.includes('delete')) return 'deleted';
    return 'default';
  }

  getActivityIcon(action: string): string {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('create')) return '✨';
    if (actionLower.includes('update')) return '📝';
    if (actionLower.includes('complete')) return '✅';
    if (actionLower.includes('delete')) return '🗑️';
    return '📋';
  }

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
