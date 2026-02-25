import { Command } from '@nestjs/cqrs';
import { AuthUrlDto } from '../dtos';

export class ConnectTmdbCommand extends Command<AuthUrlDto> {
  constructor(public readonly callbackUrl: string) {
    super();
  }
}
