import { Command } from '@nestjs/cqrs';
import { AddonConfigEntity } from '../../domain/entities';
import { UpdateAddonConfigDto } from '../dtos';

export class UpdateAddonConfigCommand extends Command<AddonConfigEntity | null> {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly dto: UpdateAddonConfigDto,
  ) {
    super();
  }
}
