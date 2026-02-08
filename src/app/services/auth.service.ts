import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { authClient } from '../../lib/auth';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

const SESSION_KEY = 'company-dashboard-session';

@Injectable({
  providedIn: 'root'
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

  private saveFallbackSession(user: AuthUser): void {
    const session = {
      user,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  async login(email: string, password: string): Promise<void> {
    const { data, error } = await authClient.signIn.email({ email, password });
    
    if (error || !data?.user) {
      throw new Error(error?.message || 'Login failed');
    }

    this.saveFallbackSession(data.user as AuthUser);
    this.router.navigate(['/dashboard']);
  }

  async register(email: string, name: string, password: string): Promise<void> {
    const { data, error } = await authClient.signUp.email({ 
      email, 
      password, 
      name 
    });
    
    if (error || !data?.user) {
      throw new Error(error?.message || 'Registration failed');
    }

    this.saveFallbackSession(data.user as AuthUser);
    this.router.navigate(['/dashboard']);
  }

  async logout(): Promise<void> {
    try {
      await authClient.signOut();
    } catch {
      // Ignore
    }
    localStorage.removeItem(SESSION_KEY);
    this.router.navigate(['/login']);
  }
}
