import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUnreadCountQuery } from './get-unread-count.query';
import { AnnouncementRepository } from '../../domain/repositories/announcement.repository';
import { UsersRepository } from '../../../users/domain/repositories/users.repository';

@QueryHandler(GetUnreadCountQuery)
export class GetUnreadCountQueryHandler implements IQueryHandler<GetUnreadCountQuery> {
  constructor(
    private readonly announcementRepo: AnnouncementRepository,
    private readonly usersRepo: UsersRepository,
  ) {}

  async execute(query: GetUnreadCountQuery): Promise<{ count: number }> {
    const user = await this.usersRepo.findById(query.userId);
    const since = user?.announcementsLastReadAt ?? null;
    const count = await this.announcementRepo.countPublishedSince(since);
    return { count };
  }
}
