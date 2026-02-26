import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCuratedGroupByIdQuery } from './get-curated-group-by-id.query';
import { CuratedGroupsRepository } from '../../domain/repositories/curated-groups.repository';
import { CuratedGroupDto } from '../dtos/curated-group.dto';

@QueryHandler(GetCuratedGroupByIdQuery)
export class GetCuratedGroupByIdQueryHandler
  implements IQueryHandler<GetCuratedGroupByIdQuery, CuratedGroupDto | null>
{
  constructor(private readonly repository: CuratedGroupsRepository) {}

  async execute(query: GetCuratedGroupByIdQuery): Promise<CuratedGroupDto | null> {
    const entity = await this.repository.findById(query.id);
    return entity ? new CuratedGroupDto(entity) : null;
  }
}
