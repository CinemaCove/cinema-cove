import { Command } from '@nestjs/cqrs';

export class DisconnectTraktCommand extends Command<void> {
  constructor(public readonly userId: string) {
    super();
  }
}
