import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenuButton,
  IonRefresher,
  IonRefresherContent,
  IonRouterLink,
  IonRow,
  IonTitle,
  IonToolbar,
} from "@ionic/angular/standalone";
import { DailyMemory } from "../../models";
import { DatabaseService } from "../../services/database.service";

@Component({
  selector: "app-memory",
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
    IonRefresher,
    IonRefresherContent,
    IonList,
    IonListHeader,
    IonLabel,
    IonBadge,
    IonItem,
    IonRow,
    IonCol,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonRouterLink,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Daily Memory</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" (ionRefresh)="refresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <!-- Memory List -->
      <ion-list>
        <ion-list-header>
          <ion-label>Company History</ion-label>
          <ion-badge color="primary" slot="end"
            >{{ memories.length }} days</ion-badge
          >
        </ion-list-header>

        <ion-item
          *ngFor="let memory of memories"
          [routerLink]="['/memory', memory.date]"
          detail="true"
        >
          <ion-label>
            <h2>{{ memory.title || "Daily Log" }}</h2>
            <h3>{{ memory.date | date: "fullDate" }}</h3>
            <p *ngIf="memory.summary">{{ memory.summary }}</p>
            <ion-row class="ion-margin-top stats-row">
              <ion-col size="auto" *ngIf="memory.clients_active > 0">
                <ion-badge color="primary"
                  >{{ memory.clients_active }} clients</ion-badge
                >
              </ion-col>
              <ion-col size="auto" *ngIf="memory.projects_active > 0">
                <ion-badge color="success"
                  >{{ memory.projects_active }} projects</ion-badge
                >
              </ion-col>
              <ion-col size="auto" *ngIf="memory.commits_total > 0">
                <ion-badge color="tertiary"
                  >{{ memory.commits_total }} commits</ion-badge
                >
              </ion-col>
              <ion-col size="auto" *ngIf="memory.new_features > 0">
                <ion-badge color="warning"
                  >{{ memory.new_features }} features</ion-badge
                >
              </ion-col>
            </ion-row>
          </ion-label>

          <ion-button
            slot="end"
            fill="clear"
            (click)="downloadMemory($event, memory)"
          >
            <ion-icon name="download" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-item>
      </ion-list>

      <!-- Empty State -->
      <ion-card *ngIf="memories.length === 0">
        <ion-card-content class="ion-text-center ion-padding">
          <ion-icon name="book" size="large" color="medium"></ion-icon>
          <h2>No Memory Entries Yet</h2>
          <p>Daily memory entries will appear here.</p>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  styles: [
    `
      h2 {
        font-weight: 600;
      }
      h3 {
        color: var(--ion-color-medium);
        font-size: 0.875rem;
      }
      .stats-row {
        gap: 0.5rem;
      }
      ion-col[size="auto"] {
        padding: 0;
      }
    `,
  ],
})
export class MemoryComponent implements OnInit {
  memories: DailyMemory[] = [];

  constructor(private db: DatabaseService) {}

  async ngOnInit() {
    await this.loadMemories();
  }

  async loadMemories() {
    try {
      this.memories = await this.db.getDailyMemories();
    } catch (error) {
      console.error("Error loading memories:", error);
      this.loadMockData();
    }
  }

  loadMockData() {
    this.memories = [
      {
        id: "1",
        date: "2026-02-05",
        filename: "2026-02-05.md",
        title: "Day 2: FitPulse Onboarding & Neon Database",
        summary:
          "New client FitPulse Studio onboarded. GreenFork database created in Neon.",
        content: "# Company Memory - Day 2...",
        clients_active: 2,
        projects_active: 2,
        commits_total: 6,
        new_features: 3,
        bugs_fixed: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "2",
        date: "2026-02-04",
        filename: "2026-02-04.md",
        title: "Day 1: GreenFork Launch",
        summary:
          "First client GreenFork Bistro. Full MVP built and deployed in one day.",
        content: "# Company Memory - Day 1...",
        clients_active: 1,
        projects_active: 1,
        commits_total: 20,
        new_features: 15,
        bugs_fixed: 8,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  async refresh(event: any) {
    await this.loadMemories();
    event.target.complete();
  }

  downloadMemory(event: Event, memory: DailyMemory) {
    event.stopPropagation();

    // Create and download the file
    const blob = new Blob([memory.content], { type: "text/markdown" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = memory.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
