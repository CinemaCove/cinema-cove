import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindExistingFranchiseGroupQuery } from './find-existing-franchise-group.query';
import { AddonConfigsRepository } from '../../domain';
import { AddonConfigResponseDto } from '../dtos';

@QueryHandler(FindExistingFranchiseGroupQuery)
export class FindExistingFranchiseGroupQueryHandler
  implements IQueryHandler<FindExistingFranchiseGroupQuery, AddonConfigResponseDto | null>
{
  constructor(private readonly repository: AddonConfigsRepository) {}

  async execute(query: FindExistingFranchiseGroupQuery): Promise<AddonConfigResponseDto | null> {
    const entity = await this.repository.findExistingFranchiseGroup(
      query.userId,
      query.curatedGroupId,
    );
    return entity ? new AddonConfigResponseDto(entity) : null;
  }
}
