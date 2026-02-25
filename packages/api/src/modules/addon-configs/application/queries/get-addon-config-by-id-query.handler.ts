import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAddonConfigByIdQuery } from './get-addon-config-by-id.query';
import { AddonConfigsRepository } from '../../domain/repositories';
import { AddonConfigEntity } from '../../domain/entities';

@QueryHandler(GetAddonConfigByIdQuery)
export class GetAddonConfigByIdQueryHandler
  implements IQueryHandler<GetAddonConfigByIdQuery, AddonConfigEntity | null>
{
  constructor(private readonly repository: AddonConfigsRepository) {}

  async execute(query: GetAddonConfigByIdQuery): Promise<AddonConfigEntity | null> {
    return this.repository.findById(query.id);
  }
}
