import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { CreateAddonConfigCommand } from './create-addon-config.command';
import { AddonConfigEntity, AddonConfigsRepository } from '../../domain';

@CommandHandler(CreateAddonConfigCommand)
export class CreateAddonConfigCommandHandler
  implements ICommandHandler<CreateAddonConfigCommand, AddonConfigEntity>
{
  constructor(private readonly repository: AddonConfigsRepository) {}

  async execute(command: CreateAddonConfigCommand): Promise<AddonConfigEntity> {
    const count = await this.repository.countByOwner(command.userId);
    if (count >= command.maxAllowed) {
      throw new ForbiddenException(
        `You have reached the limit of ${command.maxAllowed} addon configurations.`,
      );
    }

    const { dto, userId } = command;
    const entity = new AddonConfigEntity(
      null,
      userId,
      dto.name,
      dto.type,
      dto.languages,
      dto.sort,
      dto.source ?? 'discover',
      dto.tmdbListId ?? null,
      dto.tmdbListType ?? null,
      dto.traktListId ?? null,
      dto.traktListType ?? null,
      dto.imagePath ?? null,
      dto.includeAdult ?? false,
      dto.minVoteAverage ?? null,
      dto.minVoteCount ?? null,
      dto.releaseDateFrom ?? null,
      dto.releaseDateTo ?? null,
    );

    return this.repository.create(entity);
  }
}
