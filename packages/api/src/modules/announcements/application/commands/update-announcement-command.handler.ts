import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UpdateAnnouncementCommand } from './update-announcement.command';
import { AnnouncementRepository } from '../../domain/repositories/announcement.repository';

@CommandHandler(UpdateAnnouncementCommand)
export class UpdateAnnouncementCommandHandler
  implements ICommandHandler<UpdateAnnouncementCommand>
{
  constructor(private readonly repo: AnnouncementRepository) {}

  async execute(command: UpdateAnnouncementCommand): Promise<void> {
    const entity = await this.repo.findById(command.id);
    if (!entity) throw new NotFoundException('Announcement not found');

    if (command.dto.title !== undefined) entity.title = command.dto.title;
    if (command.dto.content !== undefined) entity.content = command.dto.content;
    if (command.dto.state !== undefined) {
      const wasUnpublished = entity.state !== 'published';
      entity.state = command.dto.state;
      if (command.dto.state === 'published' && wasUnpublished) {
        entity.publishedAt = new Date();
      }
    }

    await this.repo.update(entity);
  }
}
