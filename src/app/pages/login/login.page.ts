import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { authClient } from "../../../lib/auth";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-login",
  template: `
    <div class="login-page">
      <div class="login-container">
        <div class="login-header">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <h1>Company Dashboard</h1>
          <p>Sign in to manage your projects</p>
        </div>

        <div class="login-form">
          <div class="form-group">
            <input
              type="email"
              placeholder="Email"
              [(ngModel)]="email"
              (keyup.enter)="login()"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <input
              type="password"
              placeholder="Password"
              [(ngModel)]="password"
              (keyup.enter)="login()"
              class="form-input"
            />
          </div>

          <p class="error-message" *ngIf="errorMessage">{{ errorMessage }}</p>

          <button
            class="btn btn-primary btn-block"
            (click)="login()"
            [disabled]="isLoading"
          >
            <span *ngIf="isLoading" class="spinner"></span>
            <span *ngIf="!isLoading">Sign In</span>
          </button>

          <div class="signup-link">
            <p>Don't have an account?</p>
            <a routerLink="/signup" class="btn btn-secondary btn-block">Create Account</a>
          </div>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  styles: [
    `
      .login-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-primary);
        padding: 24px;
      }
      .login-container {
        width: 100%;
        max-width: 400px;
      }
      .login-header {
        text-align: center;
        margin-bottom: 40px;
      }
      .logo-icon {
        width: 64px;
        height: 64px;
        color: var(--accent);
        margin-bottom: 16px;
      }
      .login-header h1 {
        margin: 0 0 8px 0;
        font-size: 28px;
        color: var(--text-primary);
      }
      .login-header p {
        color: var(--text-secondary);
        margin: 0;
      }
      .login-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .form-group {
        margin: 0;
      }
      .form-input {
        width: 100%;
        padding: 14px 16px;
        border: 2px solid var(--border);
        border-radius: 10px;
        font-size: 16px;
        background: var(--bg-secondary);
        color: var(--text-primary);
        transition: border-color 0.2s;
      }
      .form-input:focus {
        outline: none;
        border-color: var(--accent);
      }
      .btn {
        padding: 14px 24px;
        border-radius: 10px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        border: none;
        text-decoration: none;
        text-align: center;
        display: inline-block;
        transition: all 0.2s;
      }
      .btn-primary {
        background: var(--accent);
        color: white;
      }
      .btn-primary:hover:not(:disabled) {
        background: var(--accent-hover);
        transform: translateY(-1px);
      }
      .btn-primary:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
      .btn-secondary {
        background: var(--bg-tertiary);
        color: var(--text-primary);
        border: 2px solid var(--border);
      }
      .btn-secondary:hover {
        border-color: var(--accent);
      }
      .btn-block {
        display: block;
        width: 100%;
      }
      .error-message {
        text-align: center;
        color: var(--danger);
        margin: 0;
        font-size: 14px;
      }
      .signup-link {
        text-align: center;
        margin-top: 24px;
      }
      .signup-link p {
        margin-bottom: 12px;
        color: var(--text-secondary);
      }
      .spinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255,255,255,0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
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

  private isJwt(token: string | null | undefined): token is string {
    if (!token) return false;
    return token.split(".").length === 3;
  }

  private extractToken(data: any): string | null {
    const loginData = data as unknown as {
      token?: string;
      session?: { token?: string; access_token?: string; accessToken?: string };
    };
    const token =
      loginData?.token ||
      loginData?.session?.token ||
      loginData?.session?.access_token ||
      loginData?.session?.accessToken ||
      null;
    return this.isJwt(token) ? token : null;
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
        let accessToken = this.extractToken(data);

        if (!accessToken) {
          try {
            const { data: sessionData } = await authClient.getSession();
            accessToken = this.extractToken(sessionData);
          } catch {}
        }

        this.authService.setSession(
          {
            id: neonUser?.id || data.user.id,
            name: neonUser?.name,
            email: neonUser?.email || this.email,
            role: neonUser?.role,
          },
          accessToken,
        );

        const verified = await this.authService.verifySession();
        if (!verified) {
          this.errorMessage = "Login succeeded but session could not be verified.";
          return;
        }

        this.router.navigate(["/dashboard"], { replaceUrl: true });
      }
    } catch (err: any) {
      this.errorMessage = err.message || "Connection error. Please try again.";
    } finally {
      this.isLoading = false;
    }
  }

  private getErrorMessage(error: any): string {
    if (error.code === "INVALID_CREDENTIALS" || error.message?.includes("credentials")) {
      return "Invalid email or password";
    }
    if (error.code === "USER_NOT_FOUND" || error.message?.includes("not found")) {
      return "User not found";
    }
    return error.message || "Login failed";
  }
}
