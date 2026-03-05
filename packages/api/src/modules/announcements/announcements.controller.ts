import {
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type { Request } from 'express';
import { ApiThrottlerGuard } from '../../common/guards/throttler.guards';
import { GetAnnouncementsQuery } from './application/queries/get-announcements.query';
import { GetUnreadCountQuery } from './application/queries/get-unread-count.query';
import { MarkAnnouncementsReadCommand } from './application/commands/mark-announcements-read.command';

interface JwtUser {
  sub: string;
}

@UseGuards(AuthGuard('jwt'), ApiThrottlerGuard)
@Controller('announcements')
export class AnnouncementsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async list(@Query('cursor') cursor?: string, @Query('limit') limit?: string) {
    const pageLimit = Math.min(Number(limit) || 20, 50);
    return this.queryBus.execute(
      new GetAnnouncementsQuery(cursor ?? null, pageLimit),
    );
  }

  @Get('unread-count')
  async unreadCount(@Req() req: Request) {
    const { sub } = req.user as JwtUser;
    return this.queryBus.execute(new GetUnreadCountQuery(sub));
  }

  @Post('mark-read')
  @HttpCode(200)
  async markRead(@Req() req: Request): Promise<{ ok: boolean }> {
    const { sub } = req.user as JwtUser;
    await this.commandBus.execute(new MarkAnnouncementsReadCommand(sub));
    return { ok: true };
  }
}
