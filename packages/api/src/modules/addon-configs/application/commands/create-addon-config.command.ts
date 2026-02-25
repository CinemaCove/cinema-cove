import { Command } from '@nestjs/cqrs';
import { AddonConfigEntity } from '../../domain/entities';
import { CreateAddonConfigDto } from '../dtos';

export class CreateAddonConfigCommand extends Command<AddonConfigEntity> {
  constructor(
    public readonly userId: string,
    public readonly dto: CreateAddonConfigDto,
    public readonly maxAllowed: number,
  ) {
    super();
  }
}
