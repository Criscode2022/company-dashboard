import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { TaskFormComponent } from "../../components/task-form/task-form.component";
import { Priority, Tag, Task, TaskStatus } from "../../models/task.model";
import { Project } from "../../models";
import { TaskService } from "../../services/task.service";
import { DatabaseService } from "../../services/database.service";

// Inline SVG icons
const ICONS: Record<string, string> = {
  plus: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>`,
  filter: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>`,
  trash: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  folder: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
  checkSquare: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>`,
};

@Component({
  selector: "app-tasks",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TaskFormComponent],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>✅ Tasks</h1>
        <button class="btn btn-primary" (click)="showAddTask = true">
          <span class="icon" [innerHTML]="icons.plus"></span> New Task
        </button>
      </header>

      <app-task-form
        *ngIf="showAddTask"
        [availableTags]="tags"
        [projects]="projects"
        (save)="createTask($event)"
        (close)="closeAddTask()"
      ></app-task-form>

      <!-- Filters -->
      <div class="card mb-4">
        <div class="filters-row">
          <div class="search-box">
            <span class="icon" [innerHTML]="icons.search"></span>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search tasks..."
            />
          </div>

          <select [(ngModel)]="filterStatus" class="form-select">
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          <select [(ngModel)]="filterPriority" class="form-select">
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select [(ngModel)]="filterProject" class="form-select">
            <option value="all">All Projects</option>
            <option *ngFor="let project of projects" [value]="project.id">
              {{ project.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-grid mb-4">
        <div class="stat-card">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">Total Tasks</div>
        </div>
        <div class="stat-card success">
          <div class="stat-value">{{ stats.completed }}</div>
          <div class="stat-label">Completed</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-value">{{ stats.inProgress }}</div>
          <div class="stat-label">In Progress</div>
        </div>
        <div class="stat-card danger">
          <div class="stat-value">{{ stats.overdue }}</div>
          <div class="stat-label">Overdue</div>
        </div>
      </div>

      <!-- Task List -->
      <div class="card">
        <div class="task-list">
          <div
            *ngFor="let task of filteredTasks"
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
                <span class="badge badge-{{ task.priority }}">
                  {{ task.priority }}
                </span>
                <span *ngIf="getProjectName(task.projectId)" class="task-project">
                  <span class="icon-sm" [innerHTML]="icons.folder"></span>
                  {{ getProjectName(task.projectId) }}
                </span>
                <span
                  *ngIf="task.dueDate"
                  class="task-due"
                  [class.overdue]="isOverdue(task)"
                >
                  <span class="icon-sm" [innerHTML]="icons.calendar"></span>
                  {{ formatDate(task.dueDate) }}
                </span>
                <span *ngIf="task.subtasks?.length">
                  <span class="icon-sm" [innerHTML]="icons.checkSquare"></span>
                  {{ getCompletedSubtasks(task) }}/{{ task.subtasks.length }}
                </span>
              </div>
            </div>

            <button class="btn-delete" (click)="deleteTask(task.id)">
              <span class="icon-sm" [innerHTML]="icons.trash"></span>
            </button>
          </div>

          <div *ngIf="filteredTasks.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <h3>No tasks found</h3>
            <p>Create your first task to get started</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 24px;
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
      .icon {
        display: inline-flex;
        width: 18px;
        height: 18px;
      }
      .icon ::ng-deep svg {
        width: 18px;
        height: 18px;
      }
      .icon-sm {
        display: inline-flex;
        width: 14px;
        height: 14px;
      }
      .icon-sm ::ng-deep svg {
        width: 14px;
        height: 14px;
      }
      .mb-4 {
        margin-bottom: 24px;
      }
      .card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        padding: 20px;
      }
      .filters-row {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
      }
      .search-box {
        flex: 1;
        min-width: 200px;
        position: relative;
        display: flex;
        align-items: center;
      }
      .search-box .icon {
        position: absolute;
        left: 12px;
        color: #666;
      }
      .search-box input {
        width: 100%;
        padding: 10px 12px 10px 40px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
      }
      .form-select {
        padding: 10px 36px 10px 12px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
        background: white;
        min-width: 140px;
      }
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
      }
      @media (max-width: 768px) {
        .stats-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      .stat-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        text-align: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      .stat-card.success {
        border-top: 4px solid #2dd36f;
      }
      .stat-card.warning {
        border-top: 4px solid #ffc409;
      }
      .stat-card.danger {
        border-top: 4px solid #eb445a;
      }
      .stat-value {
        font-size: 2rem;
        font-weight: bold;
        margin-bottom: 4px;
      }
      .stat-label {
        color: #666;
        font-size: 14px;
      }
      .task-list {
        display: flex;
        flex-direction: column;
      }
      .task-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        border-bottom: 1px solid #eee;
      }
      .task-item:last-child {
        border-bottom: none;
      }
      .task-item.completed .task-title {
        text-decoration: line-through;
        opacity: 0.6;
      }
      .task-checkbox input {
        width: 20px;
        height: 20px;
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
      .task-project {
        color: #3880ff;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .task-due {
        color: #666;
      }
      .task-due.overdue {
        color: #eb445a;
        font-weight: 600;
      }
      .badge {
        padding: 2px 10px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
      }
      .badge-urgent { background: #fde8ea; color: #eb445a; }
      .badge-high { background: #fff4e6; color: #f39c12; }
      .badge-medium { background: #e8f4fd; color: #3498db; }
      .badge-low { background: #e8f8f0; color: #27ae60; }
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
      }
      .btn-primary {
        background: #3880ff;
        color: white;
      }
      .btn-primary:hover {
        background: #3171e0;
      }
      .btn-delete {
        background: none;
        border: none;
        color: #eb445a;
        cursor: pointer;
        padding: 8px;
        border-radius: 4px;
      }
      .btn-delete:hover {
        background: #fde8ea;
      }
      .empty-state {
        text-align: center;
        padding: 48px 20px;
        color: #999;
      }
      .empty-icon {
        font-size: 48px;
        margin-bottom: 16px;
      }
      .empty-state h3 {
        margin: 0 0 8px 0;
        color: #333;
      }
    `,
  ],
})
export class TasksPage implements OnInit {
  icons = ICONS;
  tasks: Task[] = [];
  tags: Tag[] = [];
  projects: Project[] = [];
  searchQuery = "";
  filterStatus: "all" | TaskStatus = "all";
  filterPriority: "all" | Priority = "all";
  filterProject: "all" | string = "all";
  showAddTask = false;

  constructor(
    private taskService: TaskService,
    private db: DatabaseService
  ) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    await Promise.all([
      this.loadTasks(),
      this.loadTags(),
      this.loadProjects(),
    ]);
  }

  async loadTasks() {
    this.tasks = await this.taskService.getTasks();
  }

  async loadTags() {
    this.tags = await this.taskService.getTags();
  }

  async loadProjects() {
    this.projects = await this.db.getProjects();
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
      if (
        this.filterProject !== "all" &&
        task.projectId !== this.filterProject
      ) {
        return false;
      }
      return true;
    });
  }

  get stats() {
    return this.taskService.getTaskStats(this.filteredTasks);
  }

  getProjectName(projectId: string | null): string {
    if (!projectId) return "";
    const project = this.projects.find((p) => p.id === projectId);
    return project?.name || "";
  }

  async toggleComplete(task: Task) {
    await this.taskService.toggleTaskCompletion(task.id, !task.completed);
    await this.loadTasks();
  }

  async deleteTask(id: string) {
    if (confirm("Delete this task?")) {
      await this.taskService.deleteTask(id);
      await this.loadTasks();
    }
  }

  async createTask(formData: Partial<Task>) {
    const normalizedDueDate = formData.dueDate ? formData.dueDate : null;
    const status = formData.status || "todo";
    const completed = status === "done";

    await this.taskService.createTask({
      ...formData,
      dueDate: normalizedDueDate,
      status,
      completed,
      tagIds: formData.tagIds || [],
    });

    this.showAddTask = false;
    await this.loadTasks();
  }

  closeAddTask() {
    this.showAddTask = false;
  }

  editTask(task: Task) {
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
