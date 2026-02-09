import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { addIcons } from "ionicons";
import { chevronBack, chevronForward } from "ionicons/icons";
import { Task } from "../../models/task.model";
import { TaskService } from "../../services/task.service";

@Component({
  selector: "app-calendar",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">📅 Calendar</h1>
        <div class="calendar-nav">
          <button class="btn btn-ghost" (click)="previousMonth()"><</button>
          <span class="current-month">{{ currentMonthYear }}</span>
          <button class="btn btn-ghost" (click)="nextMonth()">></button>
        </div>
      </div>

      <div class="card">
        <!-- Weekday Headers -->
        <div class="calendar-header">
          <div *ngFor="let day of weekDays" class="weekday">{{ day }}</div>
        </div>

        <!-- Calendar Grid -->
        <div class="calendar-grid">
          <div
            *ngFor="let date of calendarDays"
            class="calendar-day"
            [class.other-month]="!date.isCurrentMonth"
            [class.today]="date.isToday"
          >
            <div class="day-number">{{ date.day }}</div>

            <div class="day-tasks">
              <div
                *ngFor="let task of date.tasks.slice(0, 3)"
                class="day-task"
                [class]="task.priority"
                (click)="$event.stopPropagation(); editTask(task)"
                [title]="task.title"
              >
                {{ task.title | slice: 0 : 15
                }}{{ task.title.length > 15 ? "..." : "" }}
              </div>
              <div *ngIf="date.tasks.length > 3" class="more-tasks">
                +{{ date.tasks.length - 3 }} more
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .calendar-nav {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .current-month {
        font-size: 18px;
        font-weight: 600;
        min-width: 150px;
        text-align: center;
      }

      .calendar-header {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        border-bottom: 1px solid var(--border);
      }
      .weekday {
        padding: 12px;
        text-align: center;
        font-weight: 600;
        font-size: 13px;
        text-transform: uppercase;
        color: var(--text-secondary);
      }

      .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
      }

      .calendar-day {
        min-height: 120px;
        padding: 8px;
        border-right: 1px solid var(--border);
        border-bottom: 1px solid var(--border);
        background: var(--bg-card);
        cursor: pointer;
        transition: background var(--transition-fast);
      }
      .calendar-day:hover {
        background: var(--bg-hover);
      }
      .calendar-day:nth-child(7n) {
        border-right: none;
      }
      .calendar-day.other-month {
        background: var(--bg-tertiary);
        opacity: 0.6;
      }
      .calendar-day.today {
        background: var(--accent-light);
      }
      .calendar-day.today .day-number {
        background: var(--accent);
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .day-number {
        font-weight: 600;
        margin-bottom: 8px;
        font-size: 14px;
      }

      .day-tasks {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .day-task {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        cursor: pointer;
      }
      .day-task:hover {
        opacity: 0.8;
      }
      .day-task.urgent {
        background: var(--danger-bg);
        color: var(--danger-text);
      }
      .day-task.high {
        background: rgba(255, 71, 87, 0.15);
        color: #ff4757;
      }
      .day-task.medium {
        background: var(--warning-bg);
        color: var(--warning-text);
      }
      .day-task.low {
        background: var(--success-bg);
        color: var(--success-text);
      }

      .more-tasks {
        font-size: 10px;
        color: var(--text-tertiary);
        text-align: center;
      }

      @media (max-width: 768px) {
        .calendar-day {
          min-height: 80px;
          padding: 4px;
        }
        .day-task {
          font-size: 9px;
          padding: 2px 4px;
        }
      }
    `,
  ],
})
export class CalendarPage implements OnInit {
  tasks: Task[] = [];
  currentDate = new Date();
  weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  constructor(private taskService: TaskService) {
    addIcons({ chevronBack, chevronForward });
  }

  async ngOnInit() {
    await this.loadTasks();
  }

  async loadTasks() {
    this.tasks = await this.taskService.getTasks();
  }

  get currentMonthYear(): string {
    return this.currentDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }

  get calendarDays(): Array<{
    day: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    tasks: Task[];
  }> {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: Array<{
      day: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      tasks: Task[];
    }> = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        isToday: false,
        tasks: [],
      });
    }

    // Current month days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = new Date(year, month, day).toISOString().split("T")[0];
      days.push({
        day,
        isCurrentMonth: true,
        isToday:
          today.getDate() === day &&
          today.getMonth() === month &&
          today.getFullYear() === year,
        tasks: this.tasks.filter(
          (t) => t.dueDate && t.dueDate.startsWith(dateStr),
        ),
      });
    }

    // Next month days to fill grid
    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isToday: false,
        tasks: [],
      });
    }

    return days;
  }

  previousMonth() {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() - 1,
      1,
    );
  }

  nextMonth() {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      1,
    );
  }

  editTask(task: Task) {
    console.log("Edit task:", task);
  }
}
