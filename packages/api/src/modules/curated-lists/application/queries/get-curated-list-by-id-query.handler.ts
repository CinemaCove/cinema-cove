import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCuratedListByIdQuery } from './get-curated-list-by-id.query';
import { CuratedListsRepository } from '../../domain/repositories/curated-lists.repository';
import { CuratedListDto } from '../dtos/curated-list.dto';

@QueryHandler(GetCuratedListByIdQuery)
export class GetCuratedListByIdQueryHandler
  implements IQueryHandler<GetCuratedListByIdQuery, CuratedListDto | null>
{
  constructor(private readonly repository: CuratedListsRepository) {}

  async execute(query: GetCuratedListByIdQuery): Promise<CuratedListDto | null> {
    const entity = await this.repository.findById(query.id);
    return entity ? new CuratedListDto(entity) : null;
  }
}
