import { AnnouncementEntity } from '../entities/announcement.entity';

export abstract class AnnouncementRepository {
  abstract findPaginated(
    cursor: string | null,
    limit: number,
  ): Promise<{ items: AnnouncementEntity[]; hasMore: boolean }>;
  abstract findAll(): Promise<AnnouncementEntity[]>;
  abstract findById(id: string): Promise<AnnouncementEntity | null>;
  abstract countPublishedSince(since: Date | null): Promise<number>;
  abstract create(entity: AnnouncementEntity): Promise<AnnouncementEntity>;
  abstract update(entity: AnnouncementEntity): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
