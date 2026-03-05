import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MarkDailyContentSeenCommand } from './mark-daily-content-seen.command';
import { UsersRepository } from '../../../users/domain/repositories/users.repository';

@CommandHandler(MarkDailyContentSeenCommand)
export class MarkDailyContentSeenCommandHandler
  implements ICommandHandler<MarkDailyContentSeenCommand, void>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: MarkDailyContentSeenCommand): Promise<void> {
    await this.usersRepository.addSeenDailyContent(command.userId, command.contentId);
  }
}
