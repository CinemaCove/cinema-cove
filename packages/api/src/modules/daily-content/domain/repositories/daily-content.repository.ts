import { DailyContentEntity } from '../entities/daily-content.entity';

export abstract class DailyContentRepository {
  abstract findAll(): Promise<DailyContentEntity[]>;
  abstract findById(id: string): Promise<DailyContentEntity | null>;
  abstract findActiveForDate(date: Date, excludeIds: string[]): Promise<DailyContentEntity | null>;
  abstract create(entity: DailyContentEntity): Promise<DailyContentEntity>;
  abstract update(entity: DailyContentEntity): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
