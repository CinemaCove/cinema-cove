import { Command } from '@nestjs/cqrs';
import { AuthUrlDto } from '../dtos';

export class ConnectTraktCommand extends Command<AuthUrlDto> {
  constructor(public readonly callbackUrl: string) {
    super();
  }
}
