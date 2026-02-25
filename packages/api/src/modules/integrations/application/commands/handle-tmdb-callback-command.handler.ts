import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HandleTmdbCallbackCommand } from './handle-tmdb-callback.command';
import { TmdbService } from '../../../shared/infrastructure/tmdb/tmdb.service';
import { SaveTmdbSessionCommand } from '../../../users/application/commands/save-tmdb-session.command';

@CommandHandler(HandleTmdbCallbackCommand)
export class HandleTmdbCallbackCommandHandler
  implements ICommandHandler<HandleTmdbCallbackCommand, void>
{
  constructor(
    private readonly tmdbService: TmdbService,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: HandleTmdbCallbackCommand): Promise<void> {
    const sessionId = await this.tmdbService.createSession(command.requestToken);
    const account = await this.tmdbService.getTmdbAccount(sessionId);
    await this.commandBus.execute(
      new SaveTmdbSessionCommand(command.userId, sessionId, account.id, account.username),
    );
  }
}
