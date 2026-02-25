import { Command } from '@nestjs/cqrs';
import { AddonConfigResponseDto } from '../dtos';
import { CreateAddonConfigDto } from '../dtos';

export class CreateAddonConfigCommand extends Command<AddonConfigResponseDto> {
  constructor(
    public readonly userId: string,
    public readonly dto: CreateAddonConfigDto,
    public readonly maxAllowed: number,
  ) {
    super();
  }
}
