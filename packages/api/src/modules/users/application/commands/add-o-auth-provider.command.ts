import { Command } from '@nestjs/cqrs';
import { OAuthProviderDto } from '../dtos';

export class AddOAuthProviderCommand extends Command<void> {
  constructor(
    public userId: string,
    public provider: OAuthProviderDto,
  ) {
    super();
  }
}
