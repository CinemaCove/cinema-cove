import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SortOptionDto } from './sort-option.dto';
import { GetSortOptionsQuery } from './get-sort-options.query';

const SORT_OPTIONS: SortOptionDto[] = [
  { value: 'popularity.desc', label: 'Popularity' },
  { value: 'release_date.desc', label: 'Release Date' },
  { value: 'vote_average.desc', label: 'Vote Average' },
];

@QueryHandler(GetSortOptionsQuery)
export class GetSortOptionsQueryHandler implements IQueryHandler<
  GetSortOptionsQuery,
  SortOptionDto[]
> {
  async execute(query: GetSortOptionsQuery): Promise<SortOptionDto[]> {
    return SORT_OPTIONS;
  }
}
