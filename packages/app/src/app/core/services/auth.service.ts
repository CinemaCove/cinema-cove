import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'cc_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  readonly isAuthenticated = computed(() => this.token() !== null);

  login(email: string, password: string) {
    return this.http
      .post<{ token: string }>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(({ token }) => this.storeToken(token)),
        map(() => void 0),
      );
  }

  register(email: string, password: string, displayName?: string) {
    return this.http
      .post<{ token: string }>(`${environment.apiUrl}/auth/register`, {
        email,
        password,
        displayName,
      })
      .pipe(
        tap(({ token }) => this.storeToken(token)),
        map(() => void 0),
      );
  }

  loginWithOAuth(provider: 'google' | 'facebook'): void {
    window.location.href = `${environment.apiUrl}/auth/${provider}`;
  }

  handleCallback(token: string): void {
    this.storeToken(token);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.token.set(null);
    void this.router.navigate(['/login']);
  }

  private storeToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this.token.set(token);
  }
}
