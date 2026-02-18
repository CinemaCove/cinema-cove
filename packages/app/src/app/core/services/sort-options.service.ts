import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface SortOption {
  value: string;
  label: string;
}

@Injectable({ providedIn: 'root' })
export class SortOptionsService {
  private readonly http = inject(HttpClient);

  getSortOptions() {
    return this.http.get<SortOption[]>(`${environment.apiUrl}/sort-options`);
  }
}