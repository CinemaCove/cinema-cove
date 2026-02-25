import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConnectTraktCommand } from './connect-trakt.command';
import { AuthUrlDto } from '../dtos';
import { TraktService } from '../../../shared/infrastructure/trakt/trakt.service';

@CommandHandler(ConnectTraktCommand)
export class ConnectTraktCommandHandler
  implements ICommandHandler<ConnectTraktCommand, AuthUrlDto>
{
  constructor(private readonly traktService: TraktService) {}

  async execute(command: ConnectTraktCommand): Promise<AuthUrlDto> {
    const authUrl = this.traktService.getAuthUrl(command.callbackUrl);
    return new AuthUrlDto(authUrl);
  }
}
