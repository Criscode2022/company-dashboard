import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { authClient } from '../../lib/auth';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

const SESSION_STORAGE_KEY = 'company_dashboard_session_fallback';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);

  private isAuthenticated = new BehaviorSubject<boolean>(false);
  private currentUser: AuthUser | null = null;
  private accessToken: string | null = null;

  constructor() {
    this.initializeAuth();
  }

  private isJwt(token: string | null | undefined): token is string {
    if (!token) return false;
    return token.split('.').length === 3;
  }

  private async fetchJwtFromSdk(): Promise<string | null> {
    try {
      const authWithJwt = authClient as unknown as {
        getJWTToken?: () => Promise<string | null>;
      };
      const jwt = await authWithJwt.getJWTToken?.();
      if (this.isJwt(jwt)) return jwt;
    } catch {
      // Ignore
    }

    try {
      const { data } = await authClient.getSession();
      const session = data?.session as unknown as
        | { token?: string; access_token?: string; accessToken?: string }
        | undefined;
      const candidate = session?.token || session?.access_token || session?.accessToken || null;
      return this.isJwt(candidate) ? candidate : null;
    } catch {
      return null;
    }
  }

  private async initializeAuth(): Promise<void> {
    try {
      const { data } = await authClient.getSession();
      if (data?.session && data?.user) {
        this.accessToken = await this.fetchJwtFromSdk();
        const neonUser = data.user as { id: string; name?: string; email: string; role?: string };
        this.currentUser = {
          id: neonUser.id,
          email: neonUser.email,
          name: neonUser.name,
          role: neonUser.role,
        };
        this.isAuthenticated.next(true);
        return;
      }
    } catch {
      // Cookie failed, try localStorage
    }
    this.restoreFromLocalStorage();
  }

  private saveToLocalStorage(user: AuthUser): void {
    try {
      const sessionData = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        accessToken: this.accessToken,
        timestamp: Date.now(),
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    } catch {
      // Ignore
    }
  }

  private restoreFromLocalStorage(): boolean {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!stored) return false;

      const sessionData = JSON.parse(stored) as {
        id: string;
        email: string;
        name?: string;
        role?: string;
        accessToken?: string | null;
        timestamp: number;
      };

      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      if (Date.now() - sessionData.timestamp > maxAge) {
        this.clearLocalStorage();
        return false;
      }

      this.currentUser = {
        id: sessionData.id,
        email: sessionData.email,
        name: sessionData.name,
        role: sessionData.role,
      };
      this.accessToken = this.isJwt(sessionData.accessToken) ? sessionData.accessToken : null;
      this.isAuthenticated.next(true);
      return true;
    } catch {
      this.clearLocalStorage();
      return false;
    }
  }

  private clearLocalStorage(): void {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }

  public setSession(user: AuthUser, accessToken?: string | null): void {
    this.currentUser = user;
    if (this.isJwt(accessToken)) {
      this.accessToken = accessToken;
    }
    this.isAuthenticated.next(true);
    this.saveToLocalStorage(user);
  }

  public async verifySession(): Promise<boolean> {
    if (this.currentUser && this.isAuthenticated.value) {
      return true;
    }

    try {
      const { data, error } = await authClient.getSession();
      if (error || !data?.session) {
        if (this.restoreFromLocalStorage()) return true;
        this.clearSession();
        return false;
      }

      this.accessToken = (await this.fetchJwtFromSdk()) || this.accessToken;

      if (data.user) {
        const neonUser = data.user as { id: string; name?: string; email: string; role?: string };
        this.currentUser = {
          id: neonUser.id,
          email: neonUser.email,
          name: neonUser.name,
          role: neonUser.role,
        };
        this.isAuthenticated.next(true);
        this.saveToLocalStorage(this.currentUser);
      }
      return true;
    } catch {
      if (this.restoreFromLocalStorage()) return true;
      this.clearSession();
      return false;
    }
  }

  public async logout(): Promise<void> {
    try {
      await authClient.signOut();
    } catch {
      // Ignore
    }
    this.clearSession();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  private clearSession(): void {
    this.currentUser = null;
    this.accessToken = null;
    this.isAuthenticated.next(false);
    this.clearLocalStorage();
  }

  public async getAccessToken(): Promise<string | null> {
    if (this.isJwt(this.accessToken)) return this.accessToken;
    const jwt = await this.fetchJwtFromSdk();
    this.accessToken = jwt;
    return jwt;
  }

  public isLoggedIn(): boolean {
    return this.isAuthenticated.value;
  }

  public getUser(): AuthUser | null {
    return this.currentUser;
  }

  public getAuthState() {
    return this.isAuthenticated.asObservable();
  }
}
