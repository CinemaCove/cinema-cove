import { Query } from '@nestjs/cqrs';
import { TmdbListsResponseDto } from '../dtos';

export class GetTmdbListsQuery extends Query<TmdbListsResponseDto> {
  constructor(
    public readonly userId: string,
    public readonly page: number,
  ) {
    super();
  }
}
