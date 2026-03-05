import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllAnnouncementsQuery } from './get-all-announcements.query';
import { AnnouncementRepository } from '../../domain/repositories/announcement.repository';
import { AnnouncementDto } from '../dtos/announcement.dto';

@QueryHandler(GetAllAnnouncementsQuery)
export class GetAllAnnouncementsQueryHandler implements IQueryHandler<GetAllAnnouncementsQuery> {
  constructor(private readonly repo: AnnouncementRepository) {}

  async execute(): Promise<AnnouncementDto[]> {
    const items = await this.repo.findAll();
    return items.map((e) => new AnnouncementDto(e));
  }
}
