import { Query } from '@nestjs/cqrs';
import { TraktStatusDto } from '../dtos';

export class GetTraktStatusQuery extends Query<TraktStatusDto> {
  constructor(public readonly userId: string) {
    super();
  }
}
