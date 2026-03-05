import { Command } from '@nestjs/cqrs';
import { UpdateDailyContentDto } from '../dtos/update-daily-content.dto';

export class UpdateDailyContentCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateDailyContentDto,
  ) {
    super();
  }
}
