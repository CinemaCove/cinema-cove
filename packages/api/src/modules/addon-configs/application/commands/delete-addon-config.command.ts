import { Command } from '@nestjs/cqrs';

export class DeleteAddonConfigCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {
    super();
  }
}
