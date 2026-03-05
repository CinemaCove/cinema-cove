import { Command } from '@nestjs/cqrs';

export class DeleteAnnouncementCommand extends Command<void> {
  constructor(public readonly id: string) {
    super();
  }
}
