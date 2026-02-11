import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { addIcons } from "ionicons";
import {
  business,
  folder,
  checkmarkCircle,
  cash,
  notifications,
  add,
  create,
  gitBranch,
  moon,
  star,
  rocket,
} from "ionicons/icons";
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenuButton,
  IonNote,
  IonRouterLink,
  IonRow,
  IonTitle,
  IonToolbar,
} from "@ionic/angular/standalone";
import { Client, CompanyStats, Project } from "../../models";
import { DatabaseService } from "../../services/database.service";
import { ActivityService, Activity } from "../../services/activity.service";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonBadge,
    IonButton,
    IonRouterLink,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Company Overview</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Stats Cards -->
      <ion-grid>
        <ion-row>
          <ion-col size="6" sizeMd="3">
            <ion-card color="primary">
              <ion-card-content class="text-center">
                <ion-icon name="business" size="large"></ion-icon>
                <h1>{{ clients.length }}</h1>
                <p>Total Clients</p>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="6" sizeMd="3">
            <ion-card color="success">
              <ion-card-content class="text-center">
                <ion-icon name="folder" size="large"></ion-icon>
                <h1>{{ projects.length }}</h1>
                <p>Active Projects</p>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="6" sizeMd="3">
            <ion-card color="warning">
              <ion-card-content class="text-center">
                <ion-icon name="checkmark-circle" size="large"></ion-icon>
                <h1>{{ productionCount }}</h1>
                <p>In Production</p>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="6" sizeMd="3">
            <ion-card color="tertiary">
              <ion-card-content class="text-center">
                <ion-icon name="cash" size="large"></ion-icon>
                <h1>{{ totalRevenue | number: "1.0-0" }}</h1>
                <p>Total Revenue</p>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- Recent Activity - NOW FROM DATABASE -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Recent Activity</ion-card-title>
        </ion-card-header>
        <ion-list>
          <ion-item *ngFor="let activity of recentActivity">
            <ion-icon
              [name]="activity.icon || 'notifications'"
              slot="start"
              [color]="activity.color || 'medium'"
            ></ion-icon>
            <ion-label>
              <h3>{{ activity.action }}</h3>
              <p *ngIf="activity.details">{{ activity.details }}</p>
              <ion-note>{{ formatTime(activity.created_at) }}</ion-note>
            </ion-label>
          </ion-item>
          
          <ion-item *ngIf="recentActivity.length === 0">
            <ion-label>
              <p>No recent activity</p>
            </ion-label>
          </ion-item>
        </ion-list>
      </ion-card>

      <!-- Active Projects -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Active Projects</ion-card-title>
          <ion-button fill="clear" routerLink="/clients">View All</ion-button>
        </ion-card-header>
        <ion-list>
          <ion-item
            *ngFor="let project of projects.slice(0, 5)"
            [routerLink]="['/projects', project.id]"
          >
            <ion-label>
              <h3>{{ project.name }}</h3>
              <p>
                {{ project.client_name }} &#183;
                {{ project.status | titlecase }}
              </p>
            </ion-label>
            <ion-badge [color]="getStatusColor(project.status)" slot="end">
              {{ project.status | titlecase }}
            </ion-badge>
          </ion-item>
        </ion-list>
      </ion-card>
    </ion-content>
  `,
  styles: [
    `
      .text-center {
        text-align: center;
      }
      h1 {
        font-size: 2.5rem;
        font-weight: bold;
        margin: 0.5rem 0;
      }
      ion-card-content {
        padding: 1.5rem;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  clients: Client[] = [];
  projects: Project[] = [];
  stats?: CompanyStats;
  recentActivity: Activity[] = [];

  constructor(
    private db: DatabaseService,
    private activityService: ActivityService
  ) {
    // Register all icons used in the dashboard
    addIcons({
      business,
      folder,
      checkmarkCircle,
      cash,
      notifications,
      add,
      create,
      gitBranch,
      moon,
      star,
      rocket,
    });
  }

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    try {
      this.clients = await this.db.getClients();
      this.projects = await this.db.getProjects();
      this.stats = await this.db.getLatestStats();
      // Fetch activities from database
      this.recentActivity = await this.activityService.getRecentActivities(5);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      this.loadMockData();
    }
  }

  loadMockData() {
    this.clients = [
      {
        id: "1",
        name: "GreenFork Bistro",
        industry: "restaurant",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "2",
        name: "FitPulse Studio",
        industry: "fitness",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "3",
        name: "TaskFlow (Internal)",
        industry: "technology",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    this.projects = [
      {
        id: "1",
        client_id: "1",
        name: "GreenFork Scheduler",
        client_name: "GreenFork Bistro",
        status: "production",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "2",
        client_id: "2",
        name: "FitPulse Studio",
        client_name: "FitPulse Studio",
        status: "in_progress",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "3",
        client_id: "3",
        name: "TaskFlow",
        client_name: "TaskFlow (Internal)",
        status: "in_progress",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  formatTime(timestamp: string | undefined): string {
    if (!timestamp) return 'Unknown';
    return this.activityService.formatTime(timestamp);
  }

  get productionCount(): number {
    return this.projects.filter((p) => p.status === "production").length;
  }

  get totalRevenue(): number {
    return this.clients.reduce((sum, c) => sum + (c.budget || 0), 0);
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      discovery: "medium",
      in_progress: "warning",
      beta: "tertiary",
      production: "success",
      maintenance: "primary",
      archived: "medium",
    };
    return colors[status] || "medium";
  }
}
