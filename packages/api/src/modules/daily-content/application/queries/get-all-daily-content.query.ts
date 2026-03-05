import { Query } from '@nestjs/cqrs';
import { DailyContentDto } from '../dtos/daily-content.dto';

export class GetAllDailyContentQuery extends Query<DailyContentDto[]> {}
