import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService } from '../../services/database.service';
import { Project, Feature, Version, DailyProgress } from '../../models';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>{{project?.name || 'Project Details'}}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" *ngIf="project">
      <!-- Project Overview -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>{{project.name}}</ion-card-title>
          <ion-card-subtitle>{{project.client_name}}</ion-card-subtitle>
        </ion-card-header>
        
        <ion-card-content>
          <p *ngIf="project.description">{{project.description}}</p>
          
          <ion-row class="ion-margin-top">
            <ion-col size="6">
              <ion-label>
                <strong>Status:</strong>
                <ion-badge [color]="getStatusColor(project.status)">
                  {{project.status | titlecase}}
                </ion-badge>
              </ion-label>
            </ion-col>
            <ion-col size="6" *ngIf="project.budget">
              <ion-label>
                <strong>Budget:</strong> ${{project.budget | number}}
              </ion-label>
            </ion-col>
          </ion-row>
          
          <!-- Links -->
          <ion-list lines="none" class="ion-margin-top">
            <ion-item *ngIf="project.repo_url" [href]="project.repo_url" target="_blank">
              <ion-icon name="logo-github" slot="start" color="dark"></ion-icon>
              <ion-label>Repository</ion-label>
              <ion-icon name="open-outline" slot="end"></ion-icon>
            </ion-item>
            
            <ion-item *ngIf="project.production_url" [href]="project.production_url" target="_blank">
              <ion-icon name="globe" slot="start" color="primary"></ion-icon>
              <ion-label>Production Site</ion-label>
              <ion-icon name="open-outline" slot="end"></ion-icon>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

      <!-- Features -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Features</ion-card-title>
          <ion-badge color="primary" slot="end">{{features.length}}</ion-badge>
        </ion-card-header>
        
        <ion-list>
          <ion-item *ngFor="let feature of features">
            <ion-label>
              <h3>{{feature.name}}</h3>
              <p *ngIf="feature.description">{{feature.description}}</p>
            </ion-label>
            <ion-badge [color]="getFeatureStatusColor(feature.status)" slot="end">
              {{feature.status | titlecase}}
            </ion-badge>
          </ion-item>
        </ion-list>
      </ion-card>

      <!-- Versions -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Versions</ion-card-title>
        </ion-card-header>
        
        <ion-list>
          <ion-item *ngFor="let version of versions">
            <ion-label>
              <h3>
                {{version.version_number}}
                <ion-badge *ngIf="version.is_production" color="success">Production</ion-badge>
              </h3>
              <p *ngIf="version.release_date">Released: {{version.release_date | date}}</p>
            </ion-label>
          </ion-item>
        </ion-list>
      </ion-card>
    </ion-content>
  `
})
export class ProjectDetailComponent implements OnInit {
  projectId: string = '';
  project?: Project;
  features: Feature[] = [];
  versions: Version[] = [];
  progress: DailyProgress[] = [];

  constructor(
    private route: ActivatedRoute,
    private db: DatabaseService
  ) {}

  async ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    await this.loadData();
  }

  async loadData() {
    try {
      this.project = await this.db.getProject(this.projectId);
      this.features = await this.db.getFeatures(this.projectId);
      this.versions = await this.db.getVersions(this.projectId);
      this.progress = await this.db.getDailyProgress(this.projectId, 30);
    } catch (error) {
      console.error('Error loading project:', error);
      this.loadMockData();
    }
  }

  loadMockData() {
    this.project = {
      id: this.projectId,
      client_id: '1',
      name: 'GreenFork Scheduler',
      description: 'Staff scheduling and time tracking for restaurants',
      status: 'production',
      repo_url: 'https://github.com/Criscode2022/greenfork-scheduler',
      production_url: 'https://greenfork-scheduler.netlify.app',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.features = [
      { id: '1', project_id: this.projectId, name: 'Digital Scheduling', status: 'completed', priority: 1, created_at: new Date().toISOString() },
      { id: '2', project_id: this.projectId, name: 'GPS Time Clock', status: 'completed', priority: 2, created_at: new Date().toISOString() }
    ];
    
    this.versions = [
      { id: '1', project_id: this.projectId, version_number: '1.0.0', is_production: true, created_at: new Date().toISOString() }
    ];
  }

  getStatusColor(status: string): string {
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

  getFeatureStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'planned': 'medium',
      'in_progress': 'warning',
      'completed': 'success',
      'deferred': 'danger'
    };
    return colors[status] || 'medium';
  }
}