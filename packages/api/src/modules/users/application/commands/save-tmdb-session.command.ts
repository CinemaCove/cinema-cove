import { Command } from '@nestjs/cqrs';

export class SaveTmdbSessionCommand extends Command<void> {
  constructor(
    public readonly userId: string,
    public readonly sessionId: string,
    public readonly accountId: number,
    public readonly username: string,
  ) {
    super();
  }
}
