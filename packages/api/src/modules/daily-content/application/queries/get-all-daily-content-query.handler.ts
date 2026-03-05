import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllDailyContentQuery } from './get-all-daily-content.query';
import { DailyContentRepository } from '../../domain/repositories/daily-content.repository';
import { DailyContentDto } from '../dtos/daily-content.dto';

@QueryHandler(GetAllDailyContentQuery)
export class GetAllDailyContentQueryHandler
  implements IQueryHandler<GetAllDailyContentQuery, DailyContentDto[]>
{
  constructor(private readonly repo: DailyContentRepository) {}

  async execute(): Promise<DailyContentDto[]> {
    const entities = await this.repo.findAll();
    return entities.map((e) => new DailyContentDto(e));
  }
}
