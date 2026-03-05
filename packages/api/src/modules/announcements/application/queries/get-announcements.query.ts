import { Query } from '@nestjs/cqrs';
import { AnnouncementDto } from '../dtos/announcement.dto';

export class GetAnnouncementsQuery extends Query<{
  items: AnnouncementDto[];
  hasMore: boolean;
  nextCursor: string | null;
}> {
  constructor(
    public readonly cursor: string | null,
    public readonly limit: number,
  ) {
    super();
  }
}
