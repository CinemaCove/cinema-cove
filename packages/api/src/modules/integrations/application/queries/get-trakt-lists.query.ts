import { Query } from '@nestjs/cqrs';
import { TraktListsResponseDto } from '../dtos';

export class GetTraktListsQuery extends Query<TraktListsResponseDto> {
  constructor(public readonly userId: string) {
    super();
  }
}
