import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FranchiseListItem {
  name: string;
  tmdbListId: string;
  unified: boolean;
}

export interface CuratedGroupItem {
  id: string;
  name: string;
  description: string;
  imagePath: string | null;
  icon: string;
  order: number;
  lists: FranchiseListItem[];
}

export interface CuratedGroupInstallResult {
  id: string;
  installUrl: string;
  alreadyInstalled: boolean;
}

@Injectable({ providedIn: 'root' })
export class CuratedGroupsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/curated-groups`;

  list(): Observable<CuratedGroupItem[]> {
    return this.http.get<CuratedGroupItem[]>(this.base);
  }

  install(id: string): Observable<CuratedGroupInstallResult> {
    return this.http.post<CuratedGroupInstallResult>(`${this.base}/${id}/install`, {});
  }
}
