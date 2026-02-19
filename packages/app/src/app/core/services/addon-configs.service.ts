import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AddonConfigPayload {
  name: string;
  type: 'movie' | 'tv';
  languages: string[];
  sort: string;
}

export interface AddonConfigItem {
  id: string;
  name: string;
  type: 'movie' | 'tv';
  languages: string[];
  sort: string;
}

@Injectable({ providedIn: 'root' })
export class AddonConfigsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/addon-configs`;

  list(): Observable<AddonConfigItem[]> {
    return this.http.get<AddonConfigItem[]>(this.base);
  }

  create(config: AddonConfigPayload): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.base, config);
  }

  update(id: string, config: Partial<AddonConfigPayload>): Observable<{ id: string }> {
    return this.http.patch<{ id: string }>(`${this.base}/${id}`, config);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
