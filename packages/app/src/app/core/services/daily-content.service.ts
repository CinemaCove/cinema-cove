import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type DailyContentType = 'trivia' | 'fun-fact' | 'announcement';

export interface DailyContentItem {
  id: string;
  type: DailyContentType;
  title: string;
  question?: string;
  choices?: string[];
  correctChoiceIndex?: number;
  explanation?: string;
  content?: string;
  imageUrl?: string;
  publishAt: string;
  expiresAt?: string;
  createdBy: string;
}

export interface DailyContentPublic {
  id: string;
  type: DailyContentType;
  title: string;
  question?: string;
  choices?: string[];
  correctChoiceIndex?: number;
  explanation?: string;
  content?: string;
  imageUrl?: string;
  publishAt: string;
}

export interface CreateDailyContentPayload {
  type: DailyContentType;
  title: string;
  question?: string;
  choices?: string[];
  correctChoiceIndex?: number;
  explanation?: string;
  content?: string;
  imageUrl?: string;
  publishAt: string;
  expiresAt?: string;
}

@Injectable({ providedIn: 'root' })
export class DailyContentService {
  private readonly http = inject(HttpClient);

  getToday() {
    return this.http.get<DailyContentPublic | null>(`${environment.apiUrl}/daily-content/today`);
  }

  markSeen(id: string) {
    return this.http.post<{ ok: boolean }>(`${environment.apiUrl}/daily-content/${id}/seen`, {});
  }

  listAll() {
    return this.http.get<DailyContentItem[]>(`${environment.apiUrl}/admin/daily-content`);
  }

  create(payload: CreateDailyContentPayload) {
    return this.http.post<DailyContentItem>(`${environment.apiUrl}/admin/daily-content`, payload);
  }

  update(id: string, payload: Partial<CreateDailyContentPayload>) {
    return this.http.patch<{ ok: boolean }>(`${environment.apiUrl}/admin/daily-content/${id}`, payload);
  }

  delete(id: string) {
    return this.http.delete<{ ok: boolean }>(`${environment.apiUrl}/admin/daily-content/${id}`);
  }
}
