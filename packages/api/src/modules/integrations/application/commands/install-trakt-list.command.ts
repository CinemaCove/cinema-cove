import { Command } from '@nestjs/cqrs';
import type { InstallTraktListBodyDto } from '../dtos';
import { InstallListResponseDto } from '../dtos';

export class InstallTraktListCommand extends Command<InstallListResponseDto> {
  constructor(
    public readonly userId: string,
    public readonly body: InstallTraktListBodyDto,
    public readonly host: string,
  ) {
    super();
  }
}
