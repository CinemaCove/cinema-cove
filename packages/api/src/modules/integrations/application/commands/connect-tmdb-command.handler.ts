import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConnectTmdbCommand } from './connect-tmdb.command';
import { AuthUrlDto } from '../dtos';
import { TmdbService } from '../../../shared/infrastructure/tmdb/tmdb.service';

@CommandHandler(ConnectTmdbCommand)
export class ConnectTmdbCommandHandler
  implements ICommandHandler<ConnectTmdbCommand, AuthUrlDto>
{
  constructor(private readonly tmdbService: TmdbService) {}

  async execute(command: ConnectTmdbCommand): Promise<AuthUrlDto> {
    const requestToken = await this.tmdbService.createRequestToken();
    const callbackUrl = encodeURIComponent(command.callbackUrl);
    const authUrl = `https://www.themoviedb.org/authenticate/${requestToken}?redirect_to=${callbackUrl}`;
    return new AuthUrlDto(authUrl);
  }
}
