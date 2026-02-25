import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ClearTmdbSessionCommand } from './clear-tmdb-session.command';
import { UsersRepository } from '../../domain';

@CommandHandler(ClearTmdbSessionCommand)
export class ClearTmdbSessionCommandHandler
  implements ICommandHandler<ClearTmdbSessionCommand, void>
{
  constructor(private readonly repository: UsersRepository) {}

  async execute(command: ClearTmdbSessionCommand): Promise<void> {
    await this.repository.clearTmdbSession(command.userId);
  }
}
