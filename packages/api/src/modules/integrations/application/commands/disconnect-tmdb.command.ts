import { Command } from '@nestjs/cqrs';

export class DisconnectTmdbCommand extends Command<void> {
  constructor(public readonly userId: string) {
    super();
  }
}
