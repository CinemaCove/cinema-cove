import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllCuratedGroupsQuery } from './get-all-curated-groups.query';
import { CuratedGroupsRepository } from '../../domain/repositories/curated-groups.repository';
import { CuratedGroupDto } from '../dtos/curated-group.dto';

@QueryHandler(GetAllCuratedGroupsQuery)
export class GetAllCuratedGroupsQueryHandler
  implements IQueryHandler<GetAllCuratedGroupsQuery, CuratedGroupDto[]>
{
  constructor(private readonly repository: CuratedGroupsRepository) {}

  async execute(): Promise<CuratedGroupDto[]> {
    const entities = await this.repository.findAll();
    return entities.map((e) => new CuratedGroupDto(e));
  }
}
