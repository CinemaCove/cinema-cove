import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateDailyContentCommand } from './create-daily-content.command';
import { DailyContentRepository } from '../../domain/repositories/daily-content.repository';
import { DailyContentEntity } from '../../domain/entities/daily-content.entity';

@CommandHandler(CreateDailyContentCommand)
export class CreateDailyContentCommandHandler
  implements ICommandHandler<CreateDailyContentCommand, DailyContentEntity>
{
  constructor(private readonly repo: DailyContentRepository) {}

  async execute(command: CreateDailyContentCommand): Promise<DailyContentEntity> {
    const entity = new DailyContentEntity();
    entity.type = command.dto.type;
    entity.title = command.dto.title;
    entity.question = command.dto.question;
    entity.choices = command.dto.choices;
    entity.correctChoiceIndex = command.dto.correctChoiceIndex;
    entity.explanation = command.dto.explanation;
    entity.content = command.dto.content;
    entity.imageUrl = command.dto.imageUrl;
    entity.publishAt = new Date(command.dto.publishAt);
    entity.expiresAt = command.dto.expiresAt ? new Date(command.dto.expiresAt) : undefined;
    entity.createdBy = command.createdBy;
    return this.repo.create(entity);
  }
}
