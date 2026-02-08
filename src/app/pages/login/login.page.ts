import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonItem, IonLabel, IonInput, IonButton,
  IonSegment, IonSegmentButton, IonToast
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <ion-content class="ion-padding" style="--background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <div class="login-container">
        <div class="logo">
          <h1>📊 Company Dashboard</h1>
          <p>Manage your software company</p>
        </div>

        <ion-card>
          <ion-card-header>
            <ion-segment [(ngModel)]="mode">
              <ion-segment-button value="login">
                <ion-label>Login</ion-label>
              </ion-segment-button>
              <ion-segment-button value="register">
                <ion-label>Register</ion-label>
              </ion-segment-button>
            </ion-segment>
          </ion-card-header>

          <ion-card-content>
            <form (ngSubmit)="onSubmit()">
              <ion-item>
                <ion-label position="stacked">Email</ion-label>
                <ion-input 
                  [(ngModel)]="email" 
                  name="email"
                  type="email" 
                  placeholder="you@company.com"
                  required>
                </ion-input>
              </ion-item>

              <ion-item *ngIf="mode === 'register'">
                <ion-label position="stacked">Name</ion-label>
                <ion-input 
                  [(ngModel)]="name" 
                  name="name"
                  type="text" 
                  placeholder="Your name"
                  required>
                </ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Password</ion-label>
                <ion-input 
                  [(ngModel)]="password" 
                  name="password"
                  type="password" 
                  placeholder="Enter password"
                  required>
                </ion-input>
              </ion-item>

              <ion-button 
                expand="block" 
                type="submit"
                [disabled]="isLoading || !email || !password || (mode === 'register' && !name)"
              >
                {{ isLoading ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Register') }}
              </ion-button>
            </form>

            <p *ngIf="error" class="error">{{ error }}</p>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>

    <ion-toast
      [isOpen]="showToast"
      [message]="toastMessage"
      duration="3000"
      (didDismiss)="showToast = false"
    ></ion-toast>
  `,
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonItem, IonLabel, IonInput, IonButton,
    IonSegment, IonSegmentButton, IonToast
  ],
  styles: [`
    .login-container {
      max-width: 400px;
      margin: 0 auto;
      padding-top: 60px;
    }
    .logo {
      text-align: center;
      color: white;
      margin-bottom: 30px;
    }
    .logo h1 {
      font-size: 2rem;
      margin: 0;
    }
    .error {
      color: var(--ion-color-danger);
      text-align: center;
      margin-top: 16px;
    }
  `]
})
export class LoginPage {
  private authService = inject(AuthService);

  mode: 'login' | 'register' = 'login';
  email = '';
  name = '';
  password = '';
  isLoading = false;
  error = '';
  showToast = false;
  toastMessage = '';

  async onSubmit() {
    this.isLoading = true;
    this.error = '';

    try {
      if (this.mode === 'login') {
        await this.authService.login(this.email, this.password);
      } else {
        await this.authService.register(this.email, this.name, this.password);
      }
    } catch (err: any) {
      this.error = err.message || 'An error occurred';
    } finally {
      this.isLoading = false;
    }
  }
}
