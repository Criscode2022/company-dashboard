import { Injectable, inject } from "@angular/core";
import { Router } from "@angular/router";
import { authClient } from "../../lib/auth";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

const SESSION_KEY = "company-dashboard-session";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private router = inject(Router);

  async getSession(): Promise<AuthUser | null> {
    try {
      const { data } = await authClient.getSession();
      if (data?.user) {
        return data.user as AuthUser;
      }
    } catch {
      // Try fallback
    }
    return this.getFallbackSession();
  }

  private getFallbackSession(): AuthUser | null {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        const session = JSON.parse(stored);
        if (session.expiresAt && new Date(session.expiresAt) > new Date()) {
          return session.user;
        }
        localStorage.removeItem(SESSION_KEY);
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    return null;
  }

  setSession(user: AuthUser): void {
    const session = {
      user,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  async logout(): Promise<void> {
    try {
      await authClient.signOut();
    } catch {
      // Ignore
    }
    localStorage.removeItem(SESSION_KEY);
    this.router.navigate(["/login"]);
  }
}
