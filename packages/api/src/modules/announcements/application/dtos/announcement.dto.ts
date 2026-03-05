import { AnnouncementEntity } from '../../domain/entities/announcement.entity';

export class AnnouncementDto {
  id: string;
  title: string;
  content: string;
  state: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(entity: AnnouncementEntity) {
    this.id = entity.id!;
    this.title = entity.title;
    this.content = entity.content;
    this.state = entity.state;
    this.publishedAt = entity.publishedAt;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}
