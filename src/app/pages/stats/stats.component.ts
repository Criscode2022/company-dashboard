import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import {
  IonBadge,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonMenuButton,
  IonNote,
  IonRow,
  IonTitle,
  IonToolbar,
} from "@ionic/angular/standalone";
import { CompanyStats } from "../../models";
import { DatabaseService } from "../../services/database.service";

@Component({
  selector: "app-stats",
  standalone: true,
  imports: [
    CommonModule,
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
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonBadge,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Statistics</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Overview Cards -->
      <ion-grid>
        <ion-row>
          <ion-col size="6" sizeMd="3">
            <ion-card color="primary">
              <ion-card-content class="text-center">
                <h1>{{ latestStats?.total_clients || 0 }}</h1>
                <p>Total Clients</p>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="6" sizeMd="3">
            <ion-card color="success">
              <ion-card-content class="text-center">
                <h1>{{ latestStats?.total_projects || 0 }}</h1>
                <p>Total Projects</p>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="6" sizeMd="3">
            <ion-card color="warning">
              <ion-card-content class="text-center">
                <h1>{{ latestStats?.total_commits || 0 }}</h1>
                <p>Total Commits</p>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="6" sizeMd="3">
            <ion-card color="tertiary">
              <ion-card-content class="text-center">
                <h1>{{ latestStats?.total_features || 0 }}</h1>
                <p>Features Delivered</p>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- Development Activity -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>30-Day Development Activity</ion-card-title>
        </ion-card-header>

        <ion-card-content>
          <ion-list>
            <ion-item *ngFor="let stat of stats.slice(-7)">
              <ion-label>
                <h3>{{ stat.date | date: "mediumDate" }}</h3>
              </ion-label>
              <ion-note slot="end">
                {{ stat.total_commits }} commits &#183;
                {{ stat.total_features }} features
              </ion-note>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

      <!-- Project Breakdown -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Project Status Breakdown</ion-card-title>
        </ion-card-header>

        <ion-card-content>
          <ion-list>
            <ion-item>
              <ion-label>Discovery</ion-label>
              <ion-badge color="medium" slot="end">{{
                projectStatusCounts.discovery
              }}</ion-badge>
            </ion-item>
            <ion-item>
              <ion-label>In Progress</ion-label>
              <ion-badge color="warning" slot="end">{{
                projectStatusCounts.in_progress
              }}</ion-badge>
            </ion-item>
            <ion-item>
              <ion-label>Beta</ion-label>
              <ion-badge color="tertiary" slot="end">{{
                projectStatusCounts.beta
              }}</ion-badge>
            </ion-item>
            <ion-item>
              <ion-label>Production</ion-label>
              <ion-badge color="success" slot="end">{{
                projectStatusCounts.production
              }}</ion-badge>
            </ion-item>
            <ion-item>
              <ion-label>Maintenance</ion-label>
              <ion-badge color="primary" slot="end">{{
                projectStatusCounts.maintenance
              }}</ion-badge>
            </ion-item>
          </ion-list>
        </ion-card-content>
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
    `,
  ],
})
export class StatsComponent implements OnInit {
  stats: CompanyStats[] = [];
  latestStats?: CompanyStats;
  projectStatusCounts = {
    discovery: 0,
    in_progress: 0,
    beta: 0,
    production: 0,
    maintenance: 0,
    archived: 0,
  };

  constructor(private db: DatabaseService) {}

  async ngOnInit() {
    await this.loadStats();
  }

  async loadStats() {
    try {
      this.stats = await this.db.getCompanyStats(30);
      this.latestStats = await this.db.getLatestStats();
    } catch (error) {
      console.error("Error loading stats:", error);
      this.loadMockData();
    }
  }

  loadMockData() {
    this.latestStats = {
      id: "1",
      date: new Date().toISOString().split("T")[0],
      total_clients: 2,
      active_clients: 2,
      new_clients: 0,
      total_projects: 2,
      active_projects: 2,
      completed_projects: 0,
      total_commits: 26,
      total_features: 18,
      total_bugs_fixed: 8,
      total_lines_of_code: 4500,
      created_at: new Date().toISOString(),
    };

    this.projectStatusCounts = {
      discovery: 0,
      in_progress: 1,
      beta: 0,
      production: 1,
      maintenance: 0,
      archived: 0,
    };
  }
}
