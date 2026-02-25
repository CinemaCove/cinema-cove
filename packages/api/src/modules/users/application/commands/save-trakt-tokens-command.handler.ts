import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SaveTraktTokensCommand } from './save-trakt-tokens.command';
import { UsersRepository } from '../../domain';

@CommandHandler(SaveTraktTokensCommand)
export class SaveTraktTokensCommandHandler
  implements ICommandHandler<SaveTraktTokensCommand, void>
{
  constructor(private readonly repository: UsersRepository) {}

  async execute(command: SaveTraktTokensCommand): Promise<void> {
    await this.repository.saveTraktTokens(
      command.userId,
      command.accessToken,
      command.refreshToken,
      command.username,
      command.expiresAt,
    );
  }
}
