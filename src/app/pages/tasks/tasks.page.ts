import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { addIcons } from "ionicons";
import {
  add,
  calendar,
  checkmarkCircle,
  chevronDown,
  create,
  ellipse,
  filter,
  flag,
  funnel,
  search,
  trash,
} from "ionicons/icons";
import { Priority, Tag, Task, TaskStatus } from "../../models/task.model";
import { TaskService } from "../../services/task.service";

@Component({
  selector: "app-tasks",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">✅ Tasks</h1>
        <button class="btn btn-primary" (click)="showAddTask = true">
          <span>+</span> New Task
        </button>
      </div>

      <!-- Filters -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="filters-row">
            <div class="search-box">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                placeholder="Search tasks..."
                class="form-input"
              />
            </div>

            <select [(ngModel)]="filterStatus" class="form-input">
              <option value="all">All Status</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>

            <select [(ngModel)]="filterPriority" class="form-input">
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-grid mb-4">
        <div class="stat-card">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">Total Tasks</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: var(--success)">
            {{ stats.completed }}
          </div>
          <div class="stat-label">Completed</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: var(--warning)">
            {{ stats.inProgress }}
          </div>
          <div class="stat-label">In Progress</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: var(--danger)">
            {{ stats.overdue }}
          </div>
          <div class="stat-label">Overdue</div>
        </div>
      </div>

      <!-- Task List -->
      <div class="card">
        <div class="task-list">
          <div
            *ngFor="let task of filteredTasks; let i = index"
            class="task-item"
            [class.completed]="task.completed"
          >
            <div class="task-checkbox">
              <input
                type="checkbox"
                [checked]="task.completed"
                (change)="toggleComplete(task)"
              />
            </div>

            <div class="task-content" (click)="editTask(task)">
              <div class="task-title">{{ task.title }}</div>
              <div class="task-meta">
                <span class="badge" [class]="'badge-' + task.priority">
                  {{ task.priority }}
                </span>
                <span
                  *ngIf="task.dueDate"
                  class="task-due"
                  [class.overdue]="isOverdue(task)"
                >
                  📅 {{ formatDate(task.dueDate) }}
                </span>
                <span *ngIf="task.subtasks?.length">
                  ✅ {{ getCompletedSubtasks(task) }}/{{ task.subtasks.length }}
                </span>
              </div>
            </div>

            <button class="btn btn-ghost btn-sm" (click)="deleteTask(task.id)">
              🗑️
            </button>
          </div>

          <div *ngIf="filteredTasks.length === 0" class="empty-state">
            <div class="empty-state-icon">📝</div>
            <h3>No tasks found</h3>
            <p>Create your first task to get started</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .mb-4 {
        margin-bottom: 24px;
      }
      .filters-row {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
      }
      .search-box {
        flex: 1;
        min-width: 200px;
      }

      .task-list {
        display: flex;
        flex-direction: column;
      }
      .task-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px 20px;
        border-bottom: 1px solid var(--border);
        transition: background var(--transition-fast);
      }
      .task-item:hover {
        background: var(--bg-hover);
      }
      .task-item.completed .task-title {
        text-decoration: line-through;
        opacity: 0.6;
      }

      .task-checkbox {
        width: 20px;
        height: 20px;
        cursor: pointer;
      }
      .task-checkbox input {
        width: 100%;
        height: 100%;
        cursor: pointer;
      }

      .task-content {
        flex: 1;
        cursor: pointer;
      }
      .task-title {
        font-weight: 600;
        margin-bottom: 4px;
      }
      .task-meta {
        display: flex;
        gap: 12px;
        align-items: center;
        font-size: 13px;
      }

      .task-due {
        color: var(--text-secondary);
      }
      .task-due.overdue {
        color: var(--danger);
        font-weight: 600;
      }

      .badge-urgent {
        background: var(--danger-bg);
        color: var(--danger-text);
      }
      .badge-high {
        background: rgba(255, 71, 87, 0.15);
        color: #ff4757;
      }
      .badge-medium {
        background: var(--warning-bg);
        color: var(--warning-text);
      }
      .badge-low {
        background: var(--success-bg);
        color: var(--success-text);
      }
    `,
  ],
})
export class TasksPage implements OnInit {
  tasks: Task[] = [];
  tags: Tag[] = [];
  searchQuery = "";
  filterStatus: "all" | TaskStatus = "all";
  filterPriority: "all" | Priority = "all";
  showAddTask = false;

  constructor(private taskService: TaskService) {
    addIcons({
      add,
      funnel,
      checkmarkCircle,
      ellipse,
      calendar,
      flag,
      search,
      filter,
      trash,
      create,
      chevronDown,
    });
  }

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.tasks = await this.taskService.getTasks();
    this.tags = await this.taskService.getTags();
  }

  get filteredTasks(): Task[] {
    return this.tasks.filter((task) => {
      if (
        this.searchQuery &&
        !task.title.toLowerCase().includes(this.searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (this.filterStatus !== "all" && task.status !== this.filterStatus) {
        return false;
      }
      if (
        this.filterPriority !== "all" &&
        task.priority !== this.filterPriority
      ) {
        return false;
      }
      return true;
    });
  }

  get stats() {
    return this.taskService.getTaskStats(this.tasks);
  }

  async toggleComplete(task: Task) {
    await this.taskService.toggleTaskCompletion(task.id, !task.completed);
    await this.loadData();
  }

  async deleteTask(id: string) {
    if (confirm("Delete this task?")) {
      await this.taskService.deleteTask(id);
      await this.loadData();
    }
  }

  editTask(task: Task) {
    // TODO: Open edit modal
    console.log("Edit task:", task);
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < new Date();
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  getCompletedSubtasks(task: Task): number {
    return task.subtasks?.filter((s) => s.completed).length || 0;
  }
}
