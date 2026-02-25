import { Query } from '@nestjs/cqrs';
import { TmdbStatusDto } from '../dtos';

export class GetTmdbStatusQuery extends Query<TmdbStatusDto> {
  constructor(public readonly userId: string) {
    super();
  }
}
