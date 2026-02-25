import { CommandBus, CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { DisconnectTmdbCommand } from './disconnect-tmdb.command';
import { TmdbService } from '../../../shared/infrastructure/tmdb/tmdb.service';
import { GetUserByIdQuery } from '../../../users/application/queries/get-user-by-id.query';
import { ClearTmdbSessionCommand } from '../../../users/application/commands/clear-tmdb-session.command';
import type { UserResponseDto } from '../../../users/application/dtos/user-response.dto';

@CommandHandler(DisconnectTmdbCommand)
export class DisconnectTmdbCommandHandler
  implements ICommandHandler<DisconnectTmdbCommand, void>
{
  constructor(
    private readonly tmdbService: TmdbService,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: DisconnectTmdbCommand): Promise<void> {
    const user = await this.queryBus.execute<GetUserByIdQuery, UserResponseDto | null>(
      new GetUserByIdQuery(command.userId),
    );
    if (user?.tmdbSessionId) {
      await this.tmdbService.deleteSession(user.tmdbSessionId);
    }
    await this.commandBus.execute(new ClearTmdbSessionCommand(command.userId));
  }
}
