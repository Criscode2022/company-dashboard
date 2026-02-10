import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Tag, Task } from "../../models/task.model";
import { Project } from "../../models";

@Component({
  selector: "app-task-form",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ task ? "Edit Task" : "New Task" }}</h2>
          <button class="btn-close" (click)="onClose()">✕</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>Title *</label>
            <input
              type="text"
              [(ngModel)]="formData.title"
              placeholder="What needs to be done?"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>Project *</label>
            <select [(ngModel)]="formData.projectId" class="form-input" required>
              <option value="" disabled selected>Select a project</option>
              <option *ngFor="let project of projects" [value]="project.id">
                {{ project.name }}
              </option>
            </select>
            <small class="form-help" *ngIf="projects.length === 0"
              >No projects available. Create a project first.</small
            >
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea
              [(ngModel)]="formData.description"
              placeholder="Add more details..."
              class="form-input"
              rows="3"
            >
            </textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Priority</label>
              <select [(ngModel)]="formData.priority" class="form-input">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div class="form-group">
              <label>Status</label>
              <select [(ngModel)]="formData.status" class="form-input">
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Due Date</label>
            <input
              type="date"
              [(ngModel)]="formData.dueDate"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>Tags</label>
            <div class="tag-selector">
              <span
                *ngFor="let tag of availableTags"
                class="tag-option"
                [class.selected]="isTagSelected(tag.id)"
                [style.background]="tag.color"
                (click)="toggleTag(tag.id)"
                >{{ tag.name }}</span
              >
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="onClose()">Cancel</button>
          <button
            class="btn btn-primary"
            (click)="onSave()"
            [disabled]="!formData.title || !formData.projectId"
          >
            {{ task ? "Update" : "Create" }} Task
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.2s ease;
      }

      .modal-content {
        background: var(--bg-card);
        border-radius: var(--radius-lg);
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: var(--shadow-xl);
        animation: scaleIn 0.2s ease;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid var(--border);
      }
      .modal-header h2 {
        margin: 0;
        font-size: 20px;
      }
      .btn-close {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: var(--text-secondary);
      }

      .modal-body {
        padding: 24px;
      }
      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 16px 24px;
        border-top: 1px solid var(--border);
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .form-help {
        display: block;
        margin-top: 6px;
        font-size: 12px;
        color: var(--warning);
      }

      .tag-selector {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .tag-option {
        padding: 6px 12px;
        border-radius: 100px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        opacity: 0.5;
        transition:
          opacity 0.2s,
          transform 0.2s;
        color: white;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      }
      .tag-option:hover {
        opacity: 0.8;
      }
      .tag-option.selected {
        opacity: 1;
        box-shadow:
          0 0 0 2px var(--bg-card),
          0 0 0 4px var(--accent);
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
    `,
  ],
})
export class TaskFormComponent implements OnInit {
  @Input() task: Task | null = null;
  @Input() availableTags: Tag[] = [];
  @Input() projects: Project[] = [];
  @Output() save = new EventEmitter<Partial<Task>>();
  @Output() close = new EventEmitter<void>();

  formData: Partial<Task> = {
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    dueDate: null,
    tagIds: [],
    projectId: "",
  };

  ngOnInit() {
    if (this.task) {
      this.formData = {
        title: this.task.title,
        description: this.task.description,
        priority: this.task.priority,
        status: this.task.status,
        dueDate: this.task.dueDate,
        tagIds: [...this.task.tagIds],
        projectId: this.task.projectId || "",
      };
    }
  }

  isTagSelected(tagId: string): boolean {
    return this.formData.tagIds?.includes(tagId) || false;
  }

  toggleTag(tagId: string) {
    const currentIds = this.formData.tagIds || [];
    if (currentIds.includes(tagId)) {
      this.formData.tagIds = currentIds.filter((id) => id !== tagId);
    } else {
      this.formData.tagIds = [...currentIds, tagId];
    }
  }

  onSave() {
    if (!this.formData.title || !this.formData.projectId) return;
    this.save.emit(this.formData);
  }

  onClose() {
    this.close.emit();
  }
}
