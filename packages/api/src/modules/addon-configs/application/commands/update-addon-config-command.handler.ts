import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateAddonConfigCommand } from './update-addon-config.command';
import { AddonConfigsRepository } from '../../domain/repositories';
import { AddonConfigEntity } from '../../domain/entities';

@CommandHandler(UpdateAddonConfigCommand)
export class UpdateAddonConfigCommandHandler
  implements ICommandHandler<UpdateAddonConfigCommand, AddonConfigEntity | null>
{
  constructor(private readonly repository: AddonConfigsRepository) {}

  async execute(command: UpdateAddonConfigCommand): Promise<AddonConfigEntity | null> {
    return this.repository.update(command.id, command.userId, command.dto);
  }
}
