import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MarkAnnouncementsReadCommand } from './mark-announcements-read.command';
import { UsersRepository } from '../../../users/domain/repositories/users.repository';

@CommandHandler(MarkAnnouncementsReadCommand)
export class MarkAnnouncementsReadCommandHandler
  implements ICommandHandler<MarkAnnouncementsReadCommand>
{
  constructor(private readonly usersRepo: UsersRepository) {}

  async execute(command: MarkAnnouncementsReadCommand): Promise<void> {
    await this.usersRepo.updateAnnouncementsLastReadAt(command.userId, new Date());
  }
}
