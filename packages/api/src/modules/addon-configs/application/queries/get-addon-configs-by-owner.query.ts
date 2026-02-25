import { Query } from '@nestjs/cqrs';
import { AddonConfigResponseDto } from '../dtos';

export class GetAddonConfigsByOwnerQuery extends Query<AddonConfigResponseDto[]> {
  constructor(public readonly userId: string) {
    super();
  }
}
