import { Command } from '@nestjs/cqrs';
import { UpdateAnnouncementDto } from '../dtos/update-announcement.dto';

export class UpdateAnnouncementCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateAnnouncementDto,
  ) {
    super();
  }
}
