import { Command } from '@nestjs/cqrs';
import { AnnouncementEntity } from '../../domain/entities/announcement.entity';
import { CreateAnnouncementDto } from '../dtos/create-announcement.dto';

export class CreateAnnouncementCommand extends Command<AnnouncementEntity> {
  constructor(
    public readonly dto: CreateAnnouncementDto,
    public readonly userId: string,
  ) {
    super();
  }
}
