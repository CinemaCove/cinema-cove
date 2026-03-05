import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTodaysDailyContentQuery } from './get-todays-daily-content.query';
import { DailyContentRepository } from '../../domain/repositories/daily-content.repository';
import { DailyContentPublicDto } from '../dtos/daily-content-public.dto';

@QueryHandler(GetTodaysDailyContentQuery)
export class GetTodaysDailyContentQueryHandler
  implements IQueryHandler<GetTodaysDailyContentQuery, DailyContentPublicDto | null>
{
  constructor(private readonly repo: DailyContentRepository) {}

  async execute(query: GetTodaysDailyContentQuery): Promise<DailyContentPublicDto | null> {
    const excludeTypes: string[] = [];
    if (query.triviaOptOut) excludeTypes.push('trivia');
    if (query.funFactOptOut) excludeTypes.push('fun-fact');
    const entity = await this.repo.findActiveForDate(new Date(), query.seenIds, excludeTypes);
    return entity ? new DailyContentPublicDto(entity) : null;
  }
}
