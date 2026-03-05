import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { DeleteDailyContentCommand } from './delete-daily-content.command';
import { DailyContentRepository } from '../../domain/repositories/daily-content.repository';

@CommandHandler(DeleteDailyContentCommand)
export class DeleteDailyContentCommandHandler
  implements ICommandHandler<DeleteDailyContentCommand, void>
{
  constructor(private readonly repo: DailyContentRepository) {}

  async execute(command: DeleteDailyContentCommand): Promise<void> {
    const entity = await this.repo.findById(command.id);
    if (!entity) throw new NotFoundException('Daily content not found');
    await this.repo.delete(command.id);
  }
}
