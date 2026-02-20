import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TmdbStatus {
  connected: boolean;
  accountId: number | null;
  username: string | null;
}

export interface TmdbListInfo {
  listType: 'watchlist' | 'favorites' | 'rated';
  type: 'movie' | 'tv';
  label: string;
  icon: string;
  totalResults: number;
}

export interface InstallTmdbListRequest {
  listType: 'watchlist' | 'favorites' | 'rated';
  type: 'movie' | 'tv';
  label: string;
}

export interface InstallTmdbListResponse {
  id: string;
  installUrl: string;
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

  getTmdbLists(): Observable<{ lists: TmdbListInfo[] }> {
    return this.http.get<{ lists: TmdbListInfo[] }>(`${this.base}/tmdb/lists`);
  }

  installTmdbList(body: InstallTmdbListRequest): Observable<InstallTmdbListResponse> {
    return this.http.post<InstallTmdbListResponse>(`${this.base}/tmdb/lists/install`, body);
  }
}
