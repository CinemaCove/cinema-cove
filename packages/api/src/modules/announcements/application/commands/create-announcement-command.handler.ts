import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateAnnouncementCommand } from './create-announcement.command';
import { AnnouncementRepository } from '../../domain/repositories/announcement.repository';
import { AnnouncementEntity } from '../../domain/entities/announcement.entity';

@CommandHandler(CreateAnnouncementCommand)
export class CreateAnnouncementCommandHandler
  implements ICommandHandler<CreateAnnouncementCommand>
{
  constructor(private readonly repo: AnnouncementRepository) {}

  async execute(command: CreateAnnouncementCommand): Promise<AnnouncementEntity> {
    const entity = new AnnouncementEntity();
    entity.title = command.dto.title;
    entity.content = command.dto.content ?? '';
    entity.state = command.dto.state;
    entity.publishedAt = command.dto.state === 'published' ? new Date() : null;
    entity.createdBy = command.userId;
    return this.repo.create(entity);
  }
}
