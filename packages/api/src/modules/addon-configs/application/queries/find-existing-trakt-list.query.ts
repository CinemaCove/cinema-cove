import { Query } from '@nestjs/cqrs';
import { AddonConfigResponseDto } from '../dtos';
import { FindExistingTraktListQuery as FindQuery } from '../../domain/repositories';

export class FindExistingTraktListQuery extends Query<AddonConfigResponseDto | null> {
  constructor(
    public readonly userId: string,
    public readonly filter: FindQuery,
  ) {
    super();
  }
}
