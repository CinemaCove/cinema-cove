import { Command } from '@nestjs/cqrs';
import { AddonConfigResponseDto } from '../dtos';
import { UpdateAddonConfigDto } from '../dtos';

export class UpdateAddonConfigCommand extends Command<AddonConfigResponseDto> {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly dto: UpdateAddonConfigDto,
  ) {
    super();
  }
}
