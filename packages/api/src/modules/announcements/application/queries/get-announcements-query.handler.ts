import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAnnouncementsQuery } from './get-announcements.query';
import { AnnouncementRepository } from '../../domain/repositories/announcement.repository';
import { AnnouncementDto } from '../dtos/announcement.dto';

@QueryHandler(GetAnnouncementsQuery)
export class GetAnnouncementsQueryHandler implements IQueryHandler<GetAnnouncementsQuery> {
  constructor(private readonly repo: AnnouncementRepository) {}

  async execute(query: GetAnnouncementsQuery) {
    const { items, hasMore } = await this.repo.findPaginated(query.cursor, query.limit);
    const dtos = items.map((e) => new AnnouncementDto(e));
    const nextCursor = hasMore && dtos.length > 0 ? dtos[dtos.length - 1].id : null;
    return { items: dtos, hasMore, nextCursor };
  }
}
