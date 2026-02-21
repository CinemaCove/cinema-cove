import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserProfile {
  email: string | null;
  displayName: string | null;
  hasPassword: boolean;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  readonly profile = signal<UserProfile | null>(null);

  load() {
    return this.http
      .get<UserProfile>(`${environment.apiUrl}/users/me`)
      .pipe(tap((p) => this.profile.set(p)));
  }

  updateDisplayName(displayName: string) {
    return this.http
      .patch<{ ok: boolean }>(`${environment.apiUrl}/users/me`, { displayName })
      .pipe(tap(() => this.profile.update((p) => p ? { ...p, displayName } : p)));
  }

  setPassword(currentPassword: string | null, newPassword: string) {
    const body = currentPassword
      ? { currentPassword, newPassword }
      : { newPassword };
    return this.http
      .patch<{ ok: boolean }>(`${environment.apiUrl}/users/me`, body)
      .pipe(tap(() => this.profile.update((p) => p ? { ...p, hasPassword: true } : p)));
  }
}
