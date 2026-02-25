import { Command } from '@nestjs/cqrs';

export class HandleTmdbCallbackCommand extends Command<void> {
  constructor(
    public readonly requestToken: string,
    public readonly userId: string,
  ) {
    super();
  }
}
