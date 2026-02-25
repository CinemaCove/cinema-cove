import { Command } from '@nestjs/cqrs';

export class ClearTraktTokensCommand extends Command<void> {
  constructor(public readonly userId: string) {
    super();
  }
}
