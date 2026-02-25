import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindExistingTmdbListQuery } from './find-existing-tmdb-list.query';
import { AddonConfigsRepository } from '../../domain';
import { AddonConfigResponseDto } from '../dtos';

@QueryHandler(FindExistingTmdbListQuery)
export class FindExistingTmdbListQueryHandler
  implements IQueryHandler<FindExistingTmdbListQuery, AddonConfigResponseDto | null>
{
  constructor(private readonly repository: AddonConfigsRepository) {}

  async execute(query: FindExistingTmdbListQuery): Promise<AddonConfigResponseDto | null> {
    const entity = await this.repository.findExistingTmdbList(query.userId, query.filter);
    return entity ? new AddonConfigResponseDto(entity) : null;
  }
}
