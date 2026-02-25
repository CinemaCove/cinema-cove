import { Query } from '@nestjs/cqrs';
import { AddonConfigEntity } from '../../domain/entities';

export class GetAddonConfigByIdQuery extends Query<AddonConfigEntity | null> {
  constructor(public readonly id: string) {
    super();
  }
}
