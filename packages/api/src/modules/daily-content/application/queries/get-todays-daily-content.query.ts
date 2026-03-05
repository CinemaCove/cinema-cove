import { Query } from '@nestjs/cqrs';
import { DailyContentPublicDto } from '../dtos/daily-content-public.dto';

export class GetTodaysDailyContentQuery extends Query<DailyContentPublicDto | null> {
  constructor(
    public readonly userId: string,
    public readonly seenIds: string[],
    public readonly optOut: boolean,
  ) {
    super();
  }
}
