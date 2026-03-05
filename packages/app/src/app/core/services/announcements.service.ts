import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  state: 'draft' | 'published';
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementsPage {
  items: Announcement[];
  hasMore: boolean;
  nextCursor: string | null;
}

@Injectable({ providedIn: 'root' })
export class AnnouncementsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/announcements`;

  getPage(cursor?: string | null, limit = 20) {
    const params: Record<string, string> = { limit: String(limit) };
    if (cursor) params['cursor'] = cursor;
    return this.http.get<AnnouncementsPage>(this.base, { params });
  }

  getUnreadCount() {
    return this.http.get<{ count: number }>(`${this.base}/unread-count`);
  }

  markRead() {
    return this.http.post<{ ok: boolean }>(`${this.base}/mark-read`, {});
  }

  // Admin
  adminGetAll() {
    return this.http.get<Announcement[]>(`${environment.apiUrl}/admin/announcements`);
  }

  adminCreate(data: { title: string; content: string; state: 'draft' | 'published' }) {
    return this.http.post<Announcement>(`${environment.apiUrl}/admin/announcements`, data);
  }

  adminUpdate(id: string, data: Partial<{ title: string; content: string; state: 'draft' | 'published' }>) {
    return this.http.patch<{ ok: boolean }>(`${environment.apiUrl}/admin/announcements/${id}`, data);
  }

  adminDelete(id: string) {
    return this.http.delete<{ ok: boolean }>(`${environment.apiUrl}/admin/announcements/${id}`);
  }
}
