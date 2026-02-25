import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DisconnectTraktCommand } from './disconnect-trakt.command';
import { ClearTraktTokensCommand } from '../../../users/application/commands/clear-trakt-tokens.command';

@CommandHandler(DisconnectTraktCommand)
export class DisconnectTraktCommandHandler
  implements ICommandHandler<DisconnectTraktCommand, void>
{
  constructor(private readonly commandBus: CommandBus) {}

  async execute(command: DisconnectTraktCommand): Promise<void> {
    await this.commandBus.execute(new ClearTraktTokensCommand(command.userId));
  }
}
