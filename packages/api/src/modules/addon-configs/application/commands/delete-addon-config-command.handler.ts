import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteAddonConfigCommand } from './delete-addon-config.command';
import { AddonConfigsRepository } from '../../domain';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(DeleteAddonConfigCommand)
export class DeleteAddonConfigCommandHandler
  implements ICommandHandler<DeleteAddonConfigCommand, void>
{
  constructor(private readonly repository: AddonConfigsRepository) {}

  public async execute(command: DeleteAddonConfigCommand): Promise<void> {
    const deleted = await this.repository.deleteByOwner(command.id, command.userId);

    if(!deleted) {
      throw new NotFoundException(`Could not find config with id ${command.id}`);
    }
  }
}
