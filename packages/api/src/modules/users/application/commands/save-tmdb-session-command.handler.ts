import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SaveTmdbSessionCommand } from './save-tmdb-session.command';
import { UsersRepository } from '../../domain';

@CommandHandler(SaveTmdbSessionCommand)
export class SaveTmdbSessionCommandHandler
  implements ICommandHandler<SaveTmdbSessionCommand, void>
{
  constructor(private readonly repository: UsersRepository) {}

  async execute(command: SaveTmdbSessionCommand): Promise<void> {
    await this.repository.saveTmdbSession(
      command.userId,
      command.sessionId,
      command.accountId,
      command.username,
    );
  }
}
