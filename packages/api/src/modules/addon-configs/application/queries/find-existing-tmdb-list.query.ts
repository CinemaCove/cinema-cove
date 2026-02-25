import { Query } from '@nestjs/cqrs';
import { AddonConfigEntity } from '../../domain/entities';
import { FindExistingTmdbListQuery as FindQuery } from '../../domain/repositories';

export class FindExistingTmdbListQuery extends Query<AddonConfigEntity | null> {
  constructor(
    public readonly userId: string,
    public readonly filter: FindQuery,
  ) {
    super();
  }
}
