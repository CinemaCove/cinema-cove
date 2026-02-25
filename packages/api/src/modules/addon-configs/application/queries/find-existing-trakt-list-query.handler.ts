import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindExistingTraktListQuery } from './find-existing-trakt-list.query';
import { AddonConfigsRepository } from '../../domain';
import { AddonConfigResponseDto } from '../dtos';

@QueryHandler(FindExistingTraktListQuery)
export class FindExistingTraktListQueryHandler
  implements IQueryHandler<FindExistingTraktListQuery, AddonConfigResponseDto | null>
{
  constructor(private readonly repository: AddonConfigsRepository) {}

  async execute(query: FindExistingTraktListQuery): Promise<AddonConfigResponseDto | null> {
    const entity = await this.repository.findExistingTraktList(query.userId, query.filter);
    return entity ? new AddonConfigResponseDto(entity) : null;
  }
}
