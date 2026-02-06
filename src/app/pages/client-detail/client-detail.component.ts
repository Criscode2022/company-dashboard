import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService } from '../../services/database.service';
import { Client, Project } from '../../models';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/clients"></ion-back-button>
        </ion-buttons>
        <ion-title>{{client?.name || 'Client Details'}}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" *ngIf="client">
      <!-- Client Info Card -->
      <ion-card>
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
          <ion-list lines="none">
            <ion-item *ngIf="client.contact_name">
              <ion-icon name="person" slot="start" color="primary"></ion-icon>
              <ion-label>{{client.contact_name}}</ion-label>
            </ion-item>
            
            <ion-item *ngIf="client.email">
              <ion-icon name="mail" slot="start" color="primary"></ion-icon>
              <ion-label>{{client.email}}</ion-label>
            </ion-item>
            
            <ion-item *ngIf="client.phone">
              <ion-icon name="call" slot="start" color="primary"></ion-icon>
              <ion-label>{{client.phone}}</ion-label>
            </ion-item>
            
            <ion-item *ngIf="client.budget">
              <ion-icon name="cash" slot="start" color="primary"></ion-icon>
              <ion-label>Budget: ${{client.budget | number}}</ion-label>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

      <!-- Projects Section -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Projects</ion-card-title>
          <ion-badge color="primary" slot="end">{{projects.length}}</ion-badge>
        </ion-card-header>
        
        <ion-list>
          <ion-item *ngFor="let project of projects" [routerLink]="['/projects', project.id]"
            detail="true">
            <ion-label>
              <h3>{{project.name}}</h3>
              <p>{{project.status | titlecase}}</p>
            </ion-label>
            <ion-badge [color]="getProjectStatusColor(project.status)" slot="end">
              {{project.status | titlecase}}
            </ion-badge>
          </ion-item>
        </ion-list>
      </ion-card>
    </ion-content>
  `,
  styles: [`
    .mr-2 {
      margin-right: 0.5rem;
    }
  `]
})
export class ClientDetailComponent implements OnInit {
  clientId: string = '';
  client?: Client;
  projects: Project[] = [];

  constructor(
    private route: ActivatedRoute,
    private db: DatabaseService
  ) {}

  async ngOnInit() {
    this.clientId = this.route.snapshot.paramMap.get('id') || '';
    await this.loadData();
  }

  async loadData() {
    try {
      this.client = await this.db.getClient(this.clientId);
      this.projects = await this.db.getProjects(this.clientId);
    } catch (error) {
      console.error('Error loading client:', error);
      this.loadMockData();
    }
  }

  loadMockData() {
    this.client = {
      id: this.clientId,
      name: 'GreenFork Bistro',
      contact_name: 'Maya Chen',
      email: 'maya@greenfork.com',
      industry: 'restaurant',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.projects = [
      {
        id: '1',
        client_id: this.clientId,
        name: 'GreenFork Scheduler',
        status: 'production',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
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

  getProjectStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'discovery': 'medium',
      'in_progress': 'warning',
      'beta': 'tertiary',
      'production': 'success',
      'maintenance': 'primary',
      'archived': 'medium'
    };
    return colors[status] || 'medium';
  }
}