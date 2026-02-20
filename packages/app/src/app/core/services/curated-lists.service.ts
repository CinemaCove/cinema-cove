import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CuratedListItem {
  id: string;
  tmdbListId: string;
  name: string;
  description: string;
  imagePath: string | null;
  icon: string;
  order: number;
}

export interface CuratedListInstallResult {
  id: string;
  installUrl: string;
  alreadyInstalled: boolean;
}

@Injectable({ providedIn: 'root' })
export class CuratedListsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/curated-lists`;

  list(): Observable<CuratedListItem[]> {
    return this.http.get<CuratedListItem[]>(this.base);
  }

  install(id: string): Observable<CuratedListInstallResult> {
    return this.http.post<CuratedListInstallResult>(`${this.base}/${id}/install`, {});
  }
}
