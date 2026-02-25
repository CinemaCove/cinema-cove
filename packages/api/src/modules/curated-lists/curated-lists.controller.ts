import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetAllCuratedListsQuery } from './application/queries/get-all-curated-lists.query';
import { InstallCuratedListCommand } from './application/commands/install-curated-list.command';
import type { InstallCuratedListResult } from './application/commands/install-curated-list.command';
import type { CuratedListDto } from './application/dtos/curated-list.dto';

@Controller('curated-lists')
export class CuratedListsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async list(): Promise<CuratedListDto[]> {
    return this.queryBus.execute(new GetAllCuratedListsQuery());
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/install')
  async install(
    @Req() req: Request & { user: { sub: string } },
    @Param('id') id: string,
  ): Promise<InstallCuratedListResult> {
    const host = req.get('host') ?? '';
    return this.commandBus.execute(new InstallCuratedListCommand(req.user.sub, id, host));
  }
}
