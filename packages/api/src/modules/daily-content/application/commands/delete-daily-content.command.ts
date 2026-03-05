import { Command } from '@nestjs/cqrs';

export class DeleteDailyContentCommand extends Command<void> {
  constructor(public readonly id: string) {
    super();
  }
}
