import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonSpinner,
  IonText,
} from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import { business } from "ionicons/icons";
import { authClient } from "../../../lib/auth";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-login",
  template: `
    <ion-content class="ion-padding">
      <div class="login-container">
        <div class="login-header">
          <ion-icon name="business" class="logo-icon"></ion-icon>
          <h1>Company Dashboard</h1>
          <p>Sign in to manage your projects</p>
        </div>

        <div class="login-form">
          <ion-item>
            <ion-input
              type="email"
              placeholder="Email"
              [(ngModel)]="email"
              label="Email"
              labelPlacement="floating"
              (keyup.enter)="login()"
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-input
              type="password"
              placeholder="Password"
              [(ngModel)]="password"
              label="Password"
              labelPlacement="floating"
              (keyup.enter)="login()"
            ></ion-input>
          </ion-item>

          <ion-text color="danger" *ngIf="errorMessage">
            <p class="error-message">{{ errorMessage }}</p>
          </ion-text>

          <ion-button
            expand="block"
            (click)="login()"
            class="login-button"
            [disabled]="isLoading"
          >
            <ion-spinner *ngIf="isLoading" name="crescent"></ion-spinner>
            <span *ngIf="!isLoading">Sign In</span>
          </ion-button>

          <div class="signup-link">
            <p>Don't have an account?</p>
            <ion-button expand="block" fill="outline" routerLink="/signup">
              Create Account
            </ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  `,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonText,
    IonSpinner,
    IonIcon,
  ],
  styles: [
    `
      .login-container {
        max-width: 400px;
        margin: 0 auto;
        padding-top: 60px;
      }
      .login-header {
        text-align: center;
        margin-bottom: 40px;
      }
      .logo-icon {
        font-size: 64px;
        color: var(--ion-color-primary);
      }
      .login-header h1 {
        margin: 16px 0 8px;
        font-size: 28px;
      }
      .login-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .error-message {
        text-align: center;
        margin: 8px 0;
      }
      .signup-link {
        text-align: center;
        margin-top: 24px;
      }
      .signup-link p {
        margin-bottom: 8px;
        color: var(--ion-color-medium);
      }
    `,
  ],
})
export class LoginPage {
  private router = inject(Router);
  private authService = inject(AuthService);

  email = "";
  password = "";
  errorMessage = "";
  isLoading = false;

  constructor() {
    addIcons({ business });
  }

  async login() {
    this.errorMessage = "";

    if (!this.email || !this.password) {
      this.errorMessage = "Please fill in all fields";
      return;
    }

    this.isLoading = true;

    try {
      const { data, error } = await authClient.signIn.email({
        email: this.email,
        password: this.password,
      });

      if (error) {
        this.errorMessage = this.getErrorMessage(error);
        return;
      }

      if (data?.user) {
        const neonUser = data.user as any;

        this.authService.setSession({
          id: neonUser?.id || data.user.id,
          name: neonUser?.name,
          email: neonUser?.email || this.email,
          role: neonUser?.role,
        });

        this.router.navigate(["/dashboard"], { replaceUrl: true });
      }
    } catch (err: any) {
      this.errorMessage = err.message || "Connection error. Please try again.";
    } finally {
      this.isLoading = false;
    }
  }

  private getErrorMessage(error: any): string {
    if (
      error.code === "INVALID_CREDENTIALS" ||
      error.message?.includes("credentials")
    ) {
      return "Invalid email or password";
    }
    if (
      error.code === "USER_NOT_FOUND" ||
      error.message?.includes("not found")
    ) {
      return "User not found";
    }
    return error.message || "Login failed";
  }
}
