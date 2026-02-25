import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAddonConfigByIdQuery } from './get-addon-config-by-id.query';
import { AddonConfigsRepository } from '../../domain';
import { AddonConfigResponseDto } from '../dtos';

@QueryHandler(GetAddonConfigByIdQuery)
export class GetAddonConfigByIdQueryHandler
  implements IQueryHandler<GetAddonConfigByIdQuery, AddonConfigResponseDto | null>
{
  constructor(private readonly repository: AddonConfigsRepository) {}

  async execute(query: GetAddonConfigByIdQuery): Promise<AddonConfigResponseDto | null> {
    const entity = await this.repository.findById(query.id);
    return entity ? new AddonConfigResponseDto(entity) : null;
  }
}
