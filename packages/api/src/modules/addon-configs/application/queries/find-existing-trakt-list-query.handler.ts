import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindExistingTraktListQuery } from './find-existing-trakt-list.query';
import { AddonConfigsRepository } from '../../domain/repositories';
import { AddonConfigEntity } from '../../domain/entities';

@QueryHandler(FindExistingTraktListQuery)
export class FindExistingTraktListQueryHandler
  implements IQueryHandler<FindExistingTraktListQuery, AddonConfigEntity | null>
{
  constructor(private readonly repository: AddonConfigsRepository) {}

  async execute(query: FindExistingTraktListQuery): Promise<AddonConfigEntity | null> {
    return this.repository.findExistingTraktList(query.userId, query.filter);
  }
}
