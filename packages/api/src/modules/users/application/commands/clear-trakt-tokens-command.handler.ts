import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ClearTraktTokensCommand } from './clear-trakt-tokens.command';
import { UsersRepository } from '../../domain';

@CommandHandler(ClearTraktTokensCommand)
export class ClearTraktTokensCommandHandler
  implements ICommandHandler<ClearTraktTokensCommand, void>
{
  constructor(private readonly repository: UsersRepository) {}

  async execute(command: ClearTraktTokensCommand): Promise<void> {
    await this.repository.clearTraktTokens(command.userId);
  }
}
