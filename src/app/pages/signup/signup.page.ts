import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  IonContent, IonItem, IonInput, IonButton, IonText, IonSpinner, IonIcon
} from '@ionic/angular/standalone';
import { authClient } from '../../lib/auth';
import { AuthService } from '../../services/auth.service';
import { addIcons } from 'ionicons';
import { business } from 'ionicons/icons';

@Component({
  selector: 'app-signup',
  template: `
    <ion-content class="ion-padding">
      <div class="signup-container">
        <div class="signup-header">
          <ion-icon name="business" class="logo-icon"></ion-icon>
          <h1>Create Account</h1>
          <p>Join your company dashboard</p>
        </div>

        <div class="signup-form">
          <ion-item>
            <ion-input
              type="text"
              placeholder="Your name"
              [(ngModel)]="name"
              label="Full Name"
              labelPlacement="floating"
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-input
              type="email"
              placeholder="Email"
              [(ngModel)]="email"
              label="Email"
              labelPlacement="floating"
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-input
              type="password"
              placeholder="Password"
              [(ngModel)]="password"
              label="Password"
              labelPlacement="floating"
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-input
              type="password"
              placeholder="Confirm password"
              [(ngModel)]="confirmPassword"
              label="Confirm Password"
              labelPlacement="floating"
            ></ion-input>
          </ion-item>

          <ion-text color="danger" *ngIf="errorMessage">
            <p class="error-message">{{ errorMessage }}</p>
          </ion-text>

          <ion-button 
            expand="block" 
            (click)="signup()" 
            class="signup-button" 
            [disabled]="isLoading"
          >
            <ion-spinner *ngIf="isLoading" name="crescent"></ion-spinner>
            <span *ngIf="!isLoading">Create Account</span>
          </ion-button>

          <div class="login-link">
            <p>Already have an account?</p>
            <ion-button expand="block" fill="outline" routerLink="/login">
              Sign In
            </ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  `,
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    IonContent, IonItem, IonInput, IonButton, IonText, IonSpinner, IonIcon
  ],
  styles: [`
    .signup-container {
      max-width: 400px;
      margin: 0 auto;
      padding-top: 40px;
    }
    .signup-header {
      text-align: center;
      margin-bottom: 40px;
    }
    .logo-icon {
      font-size: 64px;
      color: var(--ion-color-primary);
    }
    .signup-header h1 {
      margin: 16px 0 8px;
      font-size: 28px;
    }
    .signup-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .error-message {
      text-align: center;
      margin: 8px 0;
    }
    .login-link {
      text-align: center;
      margin-top: 24px;
    }
    .login-link p {
      margin-bottom: 8px;
      color: var(--ion-color-medium);
    }
  `]
})
export class SignupPage {
  private router = inject(Router);
  private authService = inject(AuthService);

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  isLoading = false;

  constructor() {
    addIcons({ business });
  }

  async signup() {
    this.errorMessage = '';

    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.isLoading = true;

    try {
      const { data, error } = await authClient.signUp.email({
        email: this.email,
        password: this.password,
        name: this.name,
      });

      if (error) {
        this.errorMessage = this.getErrorMessage(error);
        return;
      }

      if (data?.user) {
        // Auto-login after signup
        const loginResult = await authClient.signIn.email({
          email: this.email,
          password: this.password,
        });

        if (loginResult.data?.user) {
          const neonUser = loginResult.data.user as any;
          
          this.authService.setSession({
            id: neonUser?.id || loginResult.data.user.id,
            name: neonUser?.name || this.name,
            email: neonUser?.email || this.email,
            role: neonUser?.role,
          });

          this.router.navigate(['/dashboard'], { replaceUrl: true });
        }
      }
    } catch (err: any) {
      this.errorMessage = err.message || 'Connection error. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  private getErrorMessage(error: any): string {
    if (error.code === 'USER_ALREADY_EXISTS' || error.message?.includes('already exists')) {
      return 'This email is already registered';
    }
    if (error.code === 'INVALID_EMAIL' || error.message?.includes('invalid email')) {
      return 'Invalid email address';
    }
    if (error.code === 'WEAK_PASSWORD' || error.message?.includes('password')) {
      return 'Password is too weak';
    }
    return error.message || 'Registration failed';
  }
}
