import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllCuratedListsQuery } from './get-all-curated-lists.query';
import { CuratedListsRepository } from '../../domain/repositories/curated-lists.repository';
import { CuratedListDto } from '../dtos/curated-list.dto';

@QueryHandler(GetAllCuratedListsQuery)
export class GetAllCuratedListsQueryHandler
  implements IQueryHandler<GetAllCuratedListsQuery, CuratedListDto[]>
{
  constructor(private readonly repository: CuratedListsRepository) {}

  async execute(): Promise<CuratedListDto[]> {
    const entities = await this.repository.findAll();
    return entities.map((e) => new CuratedListDto(e));
  }
}
