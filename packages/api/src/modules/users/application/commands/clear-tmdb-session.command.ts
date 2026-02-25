import { Command } from '@nestjs/cqrs';

export class ClearTmdbSessionCommand extends Command<void> {
  constructor(public readonly userId: string) {
    super();
  }
}
