import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UpdateAddonConfigCommand } from './update-addon-config.command';
import { AddonConfigsRepository } from '../../domain';
import { AddonConfigResponseDto } from '../dtos';

@CommandHandler(UpdateAddonConfigCommand)
export class UpdateAddonConfigCommandHandler
  implements ICommandHandler<UpdateAddonConfigCommand, AddonConfigResponseDto>
{
  constructor(private readonly repository: AddonConfigsRepository) {}

  async execute(command: UpdateAddonConfigCommand): Promise<AddonConfigResponseDto> {
    const entity = await this.repository.update(command.id, command.userId, command.dto);
    if (!entity) throw new NotFoundException(`Could not find config with id ${command.id}`);
    return new AddonConfigResponseDto(entity);
  }
}
