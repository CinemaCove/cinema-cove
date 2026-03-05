import { Command } from '@nestjs/cqrs';

export class MarkDailyContentSeenCommand extends Command<void> {
  constructor(
    public readonly userId: string,
    public readonly contentId: string,
  ) {
    super();
  }
}
