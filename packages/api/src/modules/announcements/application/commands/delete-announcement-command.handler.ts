import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteAnnouncementCommand } from './delete-announcement.command';
import { AnnouncementRepository } from '../../domain/repositories/announcement.repository';

@CommandHandler(DeleteAnnouncementCommand)
export class DeleteAnnouncementCommandHandler
  implements ICommandHandler<DeleteAnnouncementCommand>
{
  constructor(private readonly repo: AnnouncementRepository) {}

  async execute(command: DeleteAnnouncementCommand): Promise<void> {
    await this.repo.delete(command.id);
  }
}
