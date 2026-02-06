import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-app>
      <ion-split-pane contentId="main-content">
        <ion-menu contentId="main-content" type="overlay">
          <ion-header>
            <ion-toolbar color="primary">
              <ion-title>Company Dashboard</ion-title>
            </ion-toolbar>
          </ion-header>
          <ion-content>
            <ion-list>
              <ion-list-header>Navigation</ion-list-header>
              <ion-item routerLink="/dashboard" routerLinkActive="selected">
                <ion-icon name="stats-chart" slot="start"></ion-icon>
                <ion-label>Overview</ion-label>
              </ion-item>
              <ion-item routerLink="/clients" routerLinkActive="selected">
                <ion-icon name="business" slot="start"></ion-icon>
                <ion-label>Clients & Projects</ion-label>
              </ion-item>
              <ion-item routerLink="/memory" routerLinkActive="selected">
                <ion-icon name="book" slot="start"></ion-icon>
                <ion-label>Daily Memory</ion-label>
              </ion-item>
              <ion-item routerLink="/stats" routerLinkActive="selected">
                <ion-icon name="trending-up" slot="start"></ion-icon>
                <ion-label>Statistics</ion-label>
              </ion-item>
            </ion-list>
          </ion-content>
        </ion-menu>
        <ion-router-outlet id="main-content"></ion-router-outlet>
      </ion-split-pane>
    </ion-app>
  `,
  styles: [`
    ion-item.selected {
      --background: var(--ion-color-primary-tint);
      --color: var(--ion-color-primary);
    }
  `]
})
export class AppComponent {}