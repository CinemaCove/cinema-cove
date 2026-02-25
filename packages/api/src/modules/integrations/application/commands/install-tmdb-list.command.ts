import { Command } from '@nestjs/cqrs';
import type { InstallTmdbListBodyDto } from '../dtos';
import { InstallListResponseDto } from '../dtos';

export class InstallTmdbListCommand extends Command<InstallListResponseDto> {
  constructor(
    public readonly userId: string,
    public readonly body: InstallTmdbListBodyDto,
    public readonly host: string,
  ) {
    super();
  }
}
