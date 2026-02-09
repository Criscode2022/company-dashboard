import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';

export interface Activity {
  id?: string;
  action: string;
  details?: string;
  icon?: string;
  color?: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  constructor(private db: DatabaseService) {}

  async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    const activities = await this.db.select<Activity>('activity_log', {
      order: 'created_at.desc',
      limit
    });
    return activities.map(a => ({
      ...a,
      icon: this.getIconForAction(a.action),
      color: this.getColorForAction(a.action)
    }));
  }

  async logActivity(action: string, details?: string): Promise<void> {
    await this.db.insert<Activity>('activity_log', {
      action,
      details,
      created_at: new Date().toISOString()
    });
  }

  private getIconForAction(action: string): string {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('client')) return 'business';
    if (actionLower.includes('project')) return 'folder';
    if (actionLower.includes('deploy')) return 'rocket';
    if (actionLower.includes('complete')) return 'checkmark-circle';
    if (actionLower.includes('merge')) return 'git-branch';
    if (actionLower.includes('feature')) return 'star';
    if (actionLower.includes('revenue') || actionLower.includes('cash')) return 'cash';
    if (actionLower.includes('dark') || actionLower.includes('theme')) return 'moon';
    return 'notifications';
  }

  private getColorForAction(action: string): string {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('new') || actionLower.includes('secured')) return 'success';
    if (actionLower.includes('launch')) return 'primary';
    if (actionLower.includes('complete')) return 'success';
    if (actionLower.includes('merge')) return 'tertiary';
    if (actionLower.includes('revenue')) return 'success';
    return 'medium';
  }

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
