import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { Task, TaskStatus } from '../../models/task.model';
import { addIcons } from 'ionicons';
import { add, checkmark } from 'ionicons/icons';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container"
      <div class="page-header"
        <h1 class="page-title">📋 Kanban Board</h1>
      </div>

      <div class="kanban-board"
        <!-- To Do Column -->
        <div class="kanban-column"
          <div class="column-header todo"
            <span class="column-dot"></span>
            <span>To Do</span>
            <span class="column-count">{{ todoTasks.length }}</span>
          </div>
          <div class="column-content"
            <div 
              *ngFor="let task of todoTasks"
              class="kanban-card"
              (click)="editTask(task)"
            
              <div class="card-priority" [class]="task.priority"></div>
              <div class="card-title">{{ task.title }}</div>
              <div *ngIf="task.dueDate" class="card-meta"
                📅 {{ formatDate(task.dueDate) }}
              </div>
              <div *ngIf="task.subtasks?.length" class="card-meta"
                ✅ {{ getCompletedSubtasks(task) }}/{{ task.subtasks.length }}
              </div>
            </div>
          </div>
        </div>

        <!-- In Progress Column -->
        <div class="kanban-column"
          <div class="column-header inprogress"
            <span class="column-dot"></span>
            <span>In Progress</span>
            <span class="column-count">{{ inProgressTasks.length }}</span>
          </div>
          <div class="column-content"
            <div 
              *ngFor="let task of inProgressTasks"
              class="kanban-card"
              (click)="editTask(task)"
            
              <div class="card-priority" [class]="task.priority"></div>
              <div class="card-title">{{ task.title }}</div>
              <div *ngIf="task.dueDate" class="card-meta"
                📅 {{ formatDate(task.dueDate) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Done Column -->
        <div class="kanban-column"
          <div class="column-header done"
            <span class="column-dot"></span>
            <span>Done</span>
            <span class="column-count">{{ doneTasks.length }}</span>
          </div>
          <div class="column-content"
            <div 
              *ngFor="let task of doneTasks"
              class="kanban-card completed"
              (click)="editTask(task)"
            
              <div class="card-priority" [class]="task.priority"></div>
              <div class="card-title">{{ task.title }}</div>
              <div class="card-meta">✅ Completed
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
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
    }
    
    .column-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 16px 20px;
      font-weight: 600;
      border-bottom: 1px solid var(--border);
    }
    
    .column-header.todo { color: var(--text-secondary); }
    .column-header.inprogress { color: var(--accent); }
    .column-header.done { color: var(--success); }
    
    .column-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .column-header.todo .column-dot { background: var(--text-tertiary); }
    .column-header.inprogress .column-dot { background: var(--accent); }
    .column-header.done .column-dot { background: var(--success); }
    
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
    }
    
    .kanban-card {
      background: var(--bg-card);
      border-radius: var(--radius-md);
      padding: 16px;
      cursor: pointer;
      transition: transform var(--transition-fast), box-shadow var(--transition-fast);
      border-left: 3px solid transparent;
    }
    
    .kanban-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    
    .kanban-card.completed { opacity: 0.7; }
    .kanban-card.completed .card-title { text-decoration: line-through; }
    
    .card-priority {
      width: 100%;
      height: 3px;
      border-radius: 2px;
      margin-bottom: 12px;
    }
    .card-priority.urgent { background: var(--danger); }
    .card-priority.high { background: #ff4757; }
    .card-priority.medium { background: var(--warning); }
    .card-priority.low { background: var(--success); }
    
    .card-title {
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .card-meta {
      font-size: 12px;
      color: var(--text-secondary);
    }
  `]
})
export class KanbanPage implements OnInit {
  tasks: Task[] = [];

  constructor(private taskService: TaskService) {
    addIcons({ add, checkmark });
  }

  async ngOnInit() {
    await this.loadTasks();
  }

  async loadTasks() {
    this.tasks = await this.taskService.getTasks();
  }

  get todoTasks(): Task[] {
    return this.tasks.filter(t => t.status === 'todo');
  }

  get inProgressTasks(): Task[] {
    return this.tasks.filter(t => t.status === 'in-progress');
  }

  get doneTasks(): Task[] {
    return this.tasks.filter(t => t.status === 'done');
  }

  editTask(task: Task) {
    console.log('Edit task:', task);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getCompletedSubtasks(task: Task): number {
    return task.subtasks?.filter(s => s.completed).length || 0;
  }
}
