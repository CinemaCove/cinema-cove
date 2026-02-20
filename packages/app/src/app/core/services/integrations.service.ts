import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TmdbStatus {
  connected: boolean;
  accountId: number | null;
  username: string | null;
}

export interface TmdbBuiltinList {
  listType: 'watchlist' | 'favorites' | 'rated';
  type: 'movie' | 'tv';
  label: string;
  icon: string;
  itemCount: number;
}

export interface TmdbCustomList {
  id: string;
  name: string;
  description: string;
  itemCount: number;
}

export interface TmdbListsResponse {
  builtinLists: TmdbBuiltinList[];
  customLists: TmdbCustomList[];
  totalPages: number;
  page: number;
}

export interface InstallResponse {
  id: string;
  installUrl: string;
}

export interface TraktStatus {
  connected: boolean;
  username: string | null;
}

export interface TraktBuiltinList {
  listType: 'watchlist' | 'favorites' | 'rated';
  type: 'movie' | 'tv';
  label: string;
  icon: string;
  itemCount: number;
}

export interface TraktCustomList {
  id: string;
  slug: string;
  name: string;
  description: string;
  itemCount: number;
}

export interface TraktListsResponse {
  builtinLists: TraktBuiltinList[];
  customLists: TraktCustomList[];
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

  getTmdbLists(page: number): Observable<TmdbListsResponse> {
    return this.http.get<TmdbListsResponse>(`${this.base}/tmdb/lists?page=${page}`);
  }

  installBuiltinList(
    listType: 'watchlist' | 'favorites' | 'rated',
    type: 'movie' | 'tv',
    label: string,
  ): Observable<InstallResponse> {
    return this.http.post<InstallResponse>(`${this.base}/tmdb/lists/install`, {
      kind: 'builtin',
      listType,
      type,
      label,
    });
  }

  installCustomList(listId: string, name: string): Observable<InstallResponse> {
    return this.http.post<InstallResponse>(`${this.base}/tmdb/lists/install`, {
      kind: 'custom',
      listId,
      name,
    });
  }

  // ── Trakt ──────────────────────────────────────────────────────────────────

  getTraktStatus(): Observable<TraktStatus> {
    return this.http.get<TraktStatus>(`${this.base}/trakt/status`);
  }

  connectTrakt(): Observable<{ authUrl: string }> {
    return this.http.post<{ authUrl: string }>(`${this.base}/trakt/connect`, {});
  }

  disconnectTrakt(): Observable<void> {
    return this.http.delete<void>(`${this.base}/trakt/disconnect`);
  }

  getTraktLists(): Observable<TraktListsResponse> {
    return this.http.get<TraktListsResponse>(`${this.base}/trakt/lists`);
  }

  installTraktBuiltinList(
    listType: 'watchlist' | 'favorites' | 'rated',
    type: 'movie' | 'tv',
    label: string,
  ): Observable<InstallResponse> {
    return this.http.post<InstallResponse>(`${this.base}/trakt/lists/install`, {
      kind: 'builtin',
      listType,
      type,
      label,
    });
  }

  installTraktCustomList(listId: string, slug: string, name: string): Observable<InstallResponse> {
    return this.http.post<InstallResponse>(`${this.base}/trakt/lists/install`, {
      kind: 'custom',
      listId,
      slug,
      name,
    });
  }
}
