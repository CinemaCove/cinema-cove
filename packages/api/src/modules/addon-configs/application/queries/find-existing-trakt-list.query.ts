import { Query } from '@nestjs/cqrs';
import { AddonConfigEntity } from '../../domain/entities';
import { FindExistingTraktListQuery as FindQuery } from '../../domain/repositories';

export class FindExistingTraktListQuery extends Query<AddonConfigEntity | null> {
  constructor(
    public readonly userId: string,
    public readonly filter: FindQuery,
  ) {
    super();
  }
}
