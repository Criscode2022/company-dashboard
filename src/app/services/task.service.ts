import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { Task, Tag, ActivityEntry } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  constructor(private db: DatabaseService) {}

  // Transform database fields (snake_case) to model fields (camelCase)
  private transformFromDb(dbTask: any): Task {
    return {
      ...dbTask,
      dueDate: dbTask.due_date,
      tagIds: dbTask.tag_ids,
      projectId: dbTask.project_id,
      // Remove snake_case fields
      due_date: undefined,
      tag_ids: undefined,
      project_id: undefined,
    } as Task;
  }

  async getTasks(): Promise<Task[]> {
    const tasks = await this.db.select<any>('tasks', { order: 'created_at.desc' });
    return tasks.map(t => this.transformFromDb(t));
  }

  async getTaskById(id: string): Promise<Task | undefined> {
    const task = await this.db.selectOne<any>('tasks', { filters: { id: `eq.${id}` } });
    return task ? this.transformFromDb(task) : undefined;
  }

  async createTask(task: Partial<Task>): Promise<Task> {
    // Map camelCase fields to snake_case for database
    const dbTask: any = {
      ...task,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Transform dueDate to due_date for database
    if (task.dueDate !== undefined) {
      dbTask.due_date = task.dueDate;
      delete dbTask.dueDate;
    }

    // Transform tagIds to tag_ids for database
    if (task.tagIds !== undefined) {
      dbTask.tag_ids = task.tagIds;
      delete dbTask.tagIds;
    }

    // Transform projectId to project_id for database
    if (task.projectId !== undefined) {
      dbTask.project_id = task.projectId;
      delete dbTask.projectId;
    }

    const result = await this.db.insert<any>('tasks', dbTask);
    return this.transformFromDb(result);
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    // Map camelCase fields to snake_case for database
    const dbUpdates: any = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Transform dueDate to due_date for database
    if (updates.dueDate !== undefined) {
      dbUpdates.due_date = updates.dueDate;
      delete dbUpdates.dueDate;
    }

    // Transform tagIds to tag_ids for database
    if (updates.tagIds !== undefined) {
      dbUpdates.tag_ids = updates.tagIds;
      delete dbUpdates.tagIds;
    }

    // Transform projectId to project_id for database
    if (updates.projectId !== undefined) {
      dbUpdates.project_id = updates.projectId;
      delete dbUpdates.projectId;
    }

    const result = await this.db.update<any>('tasks', id, dbUpdates);
    return result ? this.transformFromDb(result) : undefined;
  }

  async deleteTask(id: string): Promise<void> {
    return this.db.delete('tasks', id);
  }

  async toggleTaskCompletion(id: string, completed: boolean): Promise<Task | undefined> {
    return this.updateTask(id, { completed, status: completed ? 'done' : 'todo' });
  }

  // Tags
  async getTags(): Promise<Tag[]> {
    return this.db.select<Tag>('tags', { order: 'name.asc' });
  }

  async createTag(tag: Partial<Tag>): Promise<Tag> {
    return this.db.insert<Tag>('tags', tag);
  }

  // Activity Log
  async getActivityLog(): Promise<ActivityEntry[]> {
    return this.db.select<ActivityEntry>('activity_log', { order: 'created_at.desc', limit: 50 });
  }

  async logActivity(action: string, taskId?: string, details?: string): Promise<void> {
    await this.db.insert<Partial<ActivityEntry>>('activity_log', {
      action,
      taskId,
      details,
      created_at: new Date().toISOString(),
    });
  }

  // Statistics
  getTaskStats(tasks: Task[]) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const todo = tasks.filter(t => t.status === 'todo').length;
    
    const urgent = tasks.filter(t => t.priority === 'urgent' && !t.completed).length;
    const high = tasks.filter(t => t.priority === 'high' && !t.completed).length;
    
    const overdue = tasks.filter(t => {
      if (t.completed || !t.dueDate) return false;
      return new Date(t.dueDate) < new Date();
    }).length;

    return {
      total,
      completed,
      inProgress,
      todo,
      urgent,
      high,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }
}
