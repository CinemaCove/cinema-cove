import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AddonConfigSavePayload {
  name: string;
  type: 'movie' | 'tv';
  languages: string[];
  sort: string;
}

export interface AddonConfigListItem {
  id: string;
  name: string;
  type: string;
}

@Injectable({ providedIn: 'root' })
export class AddonConfigsService {
  private readonly http = inject(HttpClient);

  save(config: AddonConfigSavePayload): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(`${environment.apiUrl}/addon-configs`, config);
  }

  list(): Observable<AddonConfigListItem[]> {
    return this.http.get<AddonConfigListItem[]>(`${environment.apiUrl}/addon-configs`);
  }
}
