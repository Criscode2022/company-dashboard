import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { DatabaseService } from '../../services/database.service';
import { Client, Project } from '../../models';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Clients & Projects</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-list>
        <ion-list-header>
          <ion-label>Clients</ion-label>
          <ion-badge color="primary" slot="end">{{clients.length}}</ion-badge>
        </ion-list-header>

        <ion-card *ngFor="let client of clients" [routerLink]="['/clients', client.id]" class="client-card">
          <ion-card-header>
            <ion-card-title>{{client.name}}</ion-card-title>
            <ion-card-subtitle>
              <ion-badge [color]="getIndustryColor(client.industry)" class="mr-2">
                {{client.industry | titlecase}}
              </ion-badge>
              <ion-badge [color]="getStatusColor(client.status)">
                {{client.status | titlecase}}
              </ion-badge>
            </ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            <p *ngIf="client.contact_name">
              <ion-icon name="person" color="medium"></ion-icon>
              {{client.contact_name}}
            </p>
            <p *ngIf="client.email">
              <ion-icon name="mail" color="medium"></ion-icon>
              {{client.email}}
            </p>
            
            <ion-row class="ion-margin-top">
              <ion-col size="6">
                <ion-label class="text-small">
                  <strong>Projects:</strong> {{getProjectCount(client.id)}}
                </ion-label>
              </ion-col>
              <ion-col size="6" *ngIf="client.budget">
                <ion-label class="text-small">
                  <strong>Budget:</strong> {{client.budget | number}}
                </ion-label>
              </ion-col>
            </ion-row>
          </ion-card-content>
        </ion-card>
      </ion-list>
    </ion-content>
  `,
  styles: [`
    .client-card {
      cursor: pointer;
      transition: transform 0.2s;
    }
    .client-card:hover {
      transform: translateY(-2px);
    }
    .mr-2 {
      margin-right: 0.5rem;
    }
    .text-small {
      font-size: 0.875rem;
    }
  `]
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
  projectCounts: Map<string, number> = new Map();

  constructor(private db: DatabaseService) {}

  async ngOnInit() {
    await this.loadClients();
  }

  async loadClients() {
    try {
      this.clients = await this.db.getClients();
      
      // Load project counts for each client
      for (const client of this.clients) {
        const projects = await this.db.getProjects(client.id);
        this.projectCounts.set(client.id, projects.length);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      this.loadMockData();
    }
  }

  loadMockData() {
    this.clients = [
      {
        id: '1',
        name: 'GreenFork Bistro',
        contact_name: 'Maya Chen',
        email: 'maya@greenfork.com',
        industry: 'restaurant',
        status: 'active',
        budget: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'FitPulse Studio',
        contact_name: 'Marcus Chen',
        email: 'marcus@fitpulse.com',
        industry: 'fitness',
        status: 'active',
        budget: 15000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    this.projectCounts.set('1', 1);
    this.projectCounts.set('2', 1);
  }

  getProjectCount(clientId: string): number {
    return this.projectCounts.get(clientId) || 0;
  }

  getIndustryColor(industry?: string): string {
    const colors: Record<string, string> = {
      'restaurant': 'success',
      'fitness': 'tertiary',
      'retail': 'warning',
      'technology': 'primary'
    };
    return colors[industry || ''] || 'medium';
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'active': 'success',
      'paused': 'warning',
      'completed': 'primary'
    };
    return colors[status] || 'medium';
  }
}