export type AnnouncementState = 'draft' | 'published';

export class AnnouncementEntity {
  id: string | null = null;
  title: string = '';
  content: string = '';
  state: AnnouncementState = 'draft';
  publishedAt: Date | null = null;
  createdBy: string = '';
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
}
