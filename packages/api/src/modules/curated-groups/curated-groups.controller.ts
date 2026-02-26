import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetAllCuratedGroupsQuery } from './application/queries/get-all-curated-groups.query';
import { InstallFranchiseGroupCommand } from './application/commands/install-franchise-group.command';
import type { InstallFranchiseGroupResult } from './application/commands/install-franchise-group.command';
import type { CuratedGroupDto } from './application/dtos/curated-group.dto';

@Controller('curated-groups')
export class CuratedGroupsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async list(): Promise<CuratedGroupDto[]> {
    return this.queryBus.execute(new GetAllCuratedGroupsQuery());
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/install')
  async install(
    @Req() req: Request & { user: { sub: string } },
    @Param('id') id: string,
  ): Promise<InstallFranchiseGroupResult> {
    const host = req.get('host') ?? '';
    return this.commandBus.execute(new InstallFranchiseGroupCommand(req.user.sub, id, host));
  }
}
