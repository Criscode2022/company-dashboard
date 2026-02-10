import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { addIcons } from "ionicons";
import { add, checkmark, filter } from "ionicons/icons";
import { Task, TaskStatus } from "../../models/task.model";
import { Project } from "../../models";
import { TaskService } from "../../services/task.service";
import { DatabaseService } from "../../services/database.service";

@Component({
  selector: "app-kanban",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">📋 Kanban Board</h1>
          <p class="text-secondary">Drag and drop tasks to change status</p>
        </div>
        <div class="header-filters">
          <select [(ngModel)]="filterProject" class="form-input" (change)="onProjectFilterChange()">
            <option value="all">All Projects</option>
            <option *ngFor="let project of projects" [value]="project.id">
              {{ project.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="kanban-board">
        <!-- To Do Column -->
        <div
          class="kanban-column"
          [class.drag-over]="dragOverColumn === 'todo'"
          (dragover)="onDragOver($event, 'todo')"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event, 'todo')"
        >
          <div class="column-header todo">
            <span class="column-dot"></span>
            <span>To Do</span>
            <span class="column-count">{{ todoTasks.length }}</span>
          </div>
          <div class="column-content">
            <div
              *ngFor="let task of todoTasks"
              class="kanban-card"
              draggable="true"
              (dragstart)="onDragStart($event, task)"
              (click)="editTask(task)"
            >
              <div class="card-priority" [class]="task.priority"></div>
              <div class="card-title">{{ task.title }}</div>
              <div *ngIf="getProjectName(task.projectId)" class="card-project">
                📁 {{ getProjectName(task.projectId) }}
              </div>
              <div *ngIf="task.dueDate" class="card-meta">
                📅 {{ formatDate(task.dueDate) }}
              </div>
              <div *ngIf="task.subtasks?.length" class="card-meta">
                ✅ {{ getCompletedSubtasks(task) }}/{{ task.subtasks.length }}
              </div>
            </div>
          </div>
        </div>

        <!-- In Progress Column -->
        <div
          class="kanban-column"
          [class.drag-over]="dragOverColumn === 'in-progress'"
          (dragover)="onDragOver($event, 'in-progress')"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event, 'in-progress')"
        >
          <div class="column-header inprogress">
            <span class="column-dot"></span>
            <span>In Progress</span>
            <span class="column-count">{{ inProgressTasks.length }}</span>
          </div>
          <div class="column-content">
            <div
              *ngFor="let task of inProgressTasks"
              class="kanban-card"
              draggable="true"
              (dragstart)="onDragStart($event, task)"
              (click)="editTask(task)"
            >
              <div class="card-priority" [class]="task.priority"></div>
              <div class="card-title">{{ task.title }}</div>
              <div *ngIf="getProjectName(task.projectId)" class="card-project">
                📁 {{ getProjectName(task.projectId) }}
              </div>
              <div *ngIf="task.dueDate" class="card-meta">
                📅 {{ formatDate(task.dueDate) }}
              </div>
              <div *ngIf="task.subtasks?.length" class="card-meta">
                ✅ {{ getCompletedSubtasks(task) }}/{{ task.subtasks.length }}
              </div>
            </div>
          </div>
        </div>

        <!-- Done Column -->
        <div
          class="kanban-column"
          [class.drag-over]="dragOverColumn === 'done'"
          (dragover)="onDragOver($event, 'done')"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event, 'done')"
        >
          <div class="column-header done">
            <span class="column-dot"></span>
            <span>Done</span>
            <span class="column-count">{{ doneTasks.length }}</span>
          </div>
          <div class="column-content">
            <div
              *ngFor="let task of doneTasks"
              class="kanban-card completed"
              draggable="true"
              (dragstart)="onDragStart($event, task)"
              (click)="editTask(task)"
            >
              <div class="card-priority" [class]="task.priority"></div>
              <div class="card-title">{{ task.title }}</div>
              <div *ngIf="getProjectName(task.projectId)" class="card-project">
                📁 {{ getProjectName(task.projectId) }}
              </div>
              <div class="card-meta">✅ Completed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24px;
      }
      .page-header p {
        margin-top: 8px;
        font-size: 14px;
      }
      .header-filters {
        display: flex;
        gap: 12px;
      }
      .header-filters select {
        min-width: 200px;
      }

      .kanban-board {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
        overflow-x: auto;
      }

      @media (max-width: 1024px) {
        .kanban-board {
          grid-template-columns: repeat(3, 300px);
        }
      }

      .kanban-column {
        background: var(--bg-tertiary);
        border-radius: var(--radius-lg);
        min-height: 500px;
        transition: background var(--transition-fast);
        border: 2px solid transparent;
      }

      .kanban-column.drag-over {
        background: var(--bg-secondary);
        border-color: var(--accent);
      }

      .column-header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 16px 20px;
        font-weight: 600;
        border-bottom: 1px solid var(--border);
      }

      .column-header.todo {
        color: var(--text-secondary);
      }
      .column-header.inprogress {
        color: var(--accent);
      }
      .column-header.done {
        color: var(--success);
      }

      .column-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
      .column-header.todo .column-dot {
        background: var(--text-tertiary);
      }
      .column-header.inprogress .column-dot {
        background: var(--accent);
      }
      .column-header.done .column-dot {
        background: var(--success);
      }

      .column-count {
        margin-left: auto;
        background: var(--bg-secondary);
        padding: 2px 10px;
        border-radius: 100px;
        font-size: 12px;
      }

      .column-content {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-height: 400px;
      }

      .kanban-card {
        background: var(--bg-card);
        border-radius: var(--radius-md);
        padding: 16px;
        cursor: grab;
        transition:
          transform var(--transition-fast),
          box-shadow var(--transition-fast),
          opacity var(--transition-fast);
        border-left: 3px solid transparent;
      }

      .kanban-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }

      .kanban-card:active {
        cursor: grabbing;
      }

      .kanban-card.completed {
        opacity: 0.7;
      }
      .kanban-card.completed .card-title {
        text-decoration: line-through;
      }

      .card-priority {
        width: 100%;
        height: 3px;
        border-radius: 2px;
        margin-bottom: 12px;
      }
      .card-priority.urgent {
        background: var(--danger);
      }
      .card-priority.high {
        background: #ff4757;
      }
      .card-priority.medium {
        background: var(--warning);
      }
      .card-priority.low {
        background: var(--success);
      }

      .card-title {
        font-weight: 600;
        margin-bottom: 8px;
      }

      .card-project {
        font-size: 12px;
        color: var(--accent);
        font-weight: 500;
        margin-bottom: 4px;
      }

      .card-meta {
        font-size: 12px;
        color: var(--text-secondary);
      }
    `,
  ],
})
export class KanbanPage implements OnInit {
  tasks: Task[] = [];
  projects: Project[] = [];
  filterProject: "all" | string = "all";
  dragOverColumn: TaskStatus | null = null;
  draggedTaskId: string | null = null;

  constructor(
    private taskService: TaskService,
    private db: DatabaseService
  ) {
    addIcons({ add, checkmark, filter });
  }

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    await Promise.all([
      this.loadTasks(),
      this.loadProjects(),
    ]);
  }

  async loadTasks() {
    this.tasks = await this.taskService.getTasks();
  }

  async loadProjects() {
    this.projects = await this.db.getProjects();
  }

  get filteredTasks(): Task[] {
    if (this.filterProject === "all") {
      return this.tasks;
    }
    return this.tasks.filter((t) => t.projectId === this.filterProject);
  }

  get todoTasks(): Task[] {
    return this.filteredTasks.filter((t) => t.status === "todo");
  }

  get inProgressTasks(): Task[] {
    return this.filteredTasks.filter((t) => t.status === "in-progress");
  }

  get doneTasks(): Task[] {
    return this.filteredTasks.filter((t) => t.status === "done");
  }

  onProjectFilterChange() {
    // Filter is reactive via getter
  }

  getProjectName(projectId: string | null): string {
    if (!projectId) return "";
    const project = this.projects.find((p) => p.id === projectId);
    return project?.name || "";
  }

  // Drag and Drop Handlers
  onDragStart(event: DragEvent, task: Task) {
    this.draggedTaskId = task.id;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", task.id);
      const card = event.target as HTMLElement;
      card.style.opacity = "0.5";
    }
  }

  onDragOver(event: DragEvent, column: TaskStatus) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
    this.dragOverColumn = column;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      this.dragOverColumn = null;
    }
  }

  async onDrop(event: DragEvent, newStatus: TaskStatus) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOverColumn = null;

    document.querySelectorAll('.kanban-card').forEach((card) => {
      (card as HTMLElement).style.opacity = '1';
    });

    if (!this.draggedTaskId) return;

    const task = this.tasks.find((t) => t.id === this.draggedTaskId);
    if (!task) return;

    if (task.status === newStatus) return;

    const updates: Partial<Task> = {
      status: newStatus,
      completed: newStatus === "done",
    };

    try {
      await this.taskService.updateTask(task.id, updates);
      await this.loadTasks();
      await this.taskService.logActivity(
        "Task moved",
        task.id,
        `Moved "${task.title}" to ${newStatus}`
      );
    } catch (error) {
      console.error("Failed to update task status:", error);
    }

    this.draggedTaskId = null;
  }

  editTask(task: Task) {
    console.log("Edit task:", task);
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
