import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UpdateDailyContentCommand } from './update-daily-content.command';
import { DailyContentRepository } from '../../domain/repositories/daily-content.repository';

@CommandHandler(UpdateDailyContentCommand)
export class UpdateDailyContentCommandHandler
  implements ICommandHandler<UpdateDailyContentCommand, void>
{
  constructor(private readonly repo: DailyContentRepository) {}

  async execute(command: UpdateDailyContentCommand): Promise<void> {
    const entity = await this.repo.findById(command.id);
    if (!entity) throw new NotFoundException('Daily content not found');

    if (command.dto.type !== undefined) entity.type = command.dto.type;
    if (command.dto.title !== undefined) entity.title = command.dto.title;
    if (command.dto.question !== undefined) entity.question = command.dto.question;
    if (command.dto.choices !== undefined) entity.choices = command.dto.choices;
    if (command.dto.correctChoiceIndex !== undefined) entity.correctChoiceIndex = command.dto.correctChoiceIndex;
    if (command.dto.explanation !== undefined) entity.explanation = command.dto.explanation;
    if (command.dto.content !== undefined) entity.content = command.dto.content;
    if (command.dto.imageUrl !== undefined) entity.imageUrl = command.dto.imageUrl;
    if (command.dto.publishAt !== undefined) entity.publishAt = new Date(command.dto.publishAt);
    if (command.dto.expiresAt !== undefined) entity.expiresAt = new Date(command.dto.expiresAt);

    await this.repo.update(entity);
  }
}
