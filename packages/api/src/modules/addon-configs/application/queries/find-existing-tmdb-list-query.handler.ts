import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindExistingTmdbListQuery } from './find-existing-tmdb-list.query';
import { AddonConfigsRepository } from '../../domain/repositories';
import { AddonConfigEntity } from '../../domain/entities';

@QueryHandler(FindExistingTmdbListQuery)
export class FindExistingTmdbListQueryHandler
  implements IQueryHandler<FindExistingTmdbListQuery, AddonConfigEntity | null>
{
  constructor(private readonly repository: AddonConfigsRepository) {}

  async execute(query: FindExistingTmdbListQuery): Promise<AddonConfigEntity | null> {
    return this.repository.findExistingTmdbList(query.userId, query.filter);
  }
}
