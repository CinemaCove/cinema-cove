import { Query } from '@nestjs/cqrs';
import { AddonConfigResponseDto } from '../dtos';
import { FindExistingTmdbListQuery as FindQuery } from '../../domain/repositories';

export class FindExistingTmdbListQuery extends Query<AddonConfigResponseDto | null> {
  constructor(
    public readonly userId: string,
    public readonly filter: FindQuery,
  ) {
    super();
  }
}
