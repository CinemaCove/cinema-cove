import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAddonConfigsByOwnerQuery } from './get-addon-configs-by-owner.query';
import { AddonConfigsRepository } from '../../domain/repositories';
import { AddonConfigResponseDto } from '../dtos';

@QueryHandler(GetAddonConfigsByOwnerQuery)
export class GetAddonConfigsByOwnerQueryHandler
  implements IQueryHandler<GetAddonConfigsByOwnerQuery, AddonConfigResponseDto[]>
{
  constructor(private readonly repository: AddonConfigsRepository) {}

  async execute(query: GetAddonConfigsByOwnerQuery): Promise<AddonConfigResponseDto[]> {
    const entities = await this.repository.findByOwner(query.userId);
    return entities.map((e) => new AddonConfigResponseDto(e));
  }
}
