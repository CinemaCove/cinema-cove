import { Query } from '@nestjs/cqrs';
import { AnnouncementDto } from '../dtos/announcement.dto';

export class GetAllAnnouncementsQuery extends Query<AnnouncementDto[]> {}
