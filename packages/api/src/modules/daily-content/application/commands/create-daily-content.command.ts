import { Command } from '@nestjs/cqrs';
import { DailyContentEntity } from '../../domain/entities/daily-content.entity';
import { CreateDailyContentDto } from '../dtos/create-daily-content.dto';

export class CreateDailyContentCommand extends Command<DailyContentEntity> {
  constructor(
    public readonly dto: CreateDailyContentDto,
    public readonly createdBy: string,
  ) {
    super();
  }
}
