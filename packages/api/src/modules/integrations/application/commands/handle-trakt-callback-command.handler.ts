import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HandleTraktCallbackCommand } from './handle-trakt-callback.command';
import { TraktService } from '../../../shared/infrastructure/trakt/trakt.service';
import { SaveTraktTokensCommand } from '../../../users/application/commands/save-trakt-tokens.command';

@CommandHandler(HandleTraktCallbackCommand)
export class HandleTraktCallbackCommandHandler
  implements ICommandHandler<HandleTraktCallbackCommand, void>
{
  constructor(
    private readonly traktService: TraktService,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: HandleTraktCallbackCommand): Promise<void> {
    const tokens = await this.traktService.exchangeCode(command.code, command.redirectUri);

    let username = '';
    try {
      const profile = await this.traktService.getProfile(tokens.accessToken);
      username = (profile as Record<string, unknown>)['username'] as string ?? '';
    } catch {
      username = '';
    }

    await this.commandBus.execute(
      new SaveTraktTokensCommand(
        command.userId,
        tokens.accessToken,
        tokens.refreshToken,
        username,
        tokens.createdAt + tokens.expiresIn,
      ),
    );
  }
}
