import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TmdbStatus {
  connected: boolean;
  accountId: number | null;
  username: string | null;
}

@Injectable({ providedIn: 'root' })
export class IntegrationsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/integrations`;

  getTmdbStatus(): Observable<TmdbStatus> {
    return this.http.get<TmdbStatus>(`${this.base}/tmdb/status`);
  }

  connectTmdb(): Observable<{ authUrl: string }> {
    return this.http.post<{ authUrl: string }>(`${this.base}/tmdb/connect`, {});
  }

  disconnectTmdb(): Observable<void> {
    return this.http.delete<void>(`${this.base}/tmdb/disconnect`);
  }
}
