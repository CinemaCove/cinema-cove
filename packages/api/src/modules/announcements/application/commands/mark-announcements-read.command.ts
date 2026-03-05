import { Command } from '@nestjs/cqrs';

export class MarkAnnouncementsReadCommand extends Command<void> {
  constructor(public readonly userId: string) {
    super();
  }
}
