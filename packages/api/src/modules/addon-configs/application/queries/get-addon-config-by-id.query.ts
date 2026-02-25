import { Query } from '@nestjs/cqrs';
import { AddonConfigResponseDto } from '../dtos';

export class GetAddonConfigByIdQuery extends Query<AddonConfigResponseDto | null> {
  constructor(public readonly id: string) {
    super();
  }
}
