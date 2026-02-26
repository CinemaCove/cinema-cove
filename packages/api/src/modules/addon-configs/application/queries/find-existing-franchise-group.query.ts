import { Query } from '@nestjs/cqrs';
import { AddonConfigResponseDto } from '../dtos';

export class FindExistingFranchiseGroupQuery extends Query<AddonConfigResponseDto | null> {
  constructor(
    public readonly userId: string,
    public readonly curatedGroupId: string,
  ) {
    super();
  }
}
