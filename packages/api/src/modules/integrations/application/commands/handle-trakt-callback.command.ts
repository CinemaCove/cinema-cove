import { Command } from '@nestjs/cqrs';

export class HandleTraktCallbackCommand extends Command<void> {
  constructor(
    public readonly code: string,
    public readonly userId: string,
    public readonly redirectUri: string,
  ) {
    super();
  }
}
