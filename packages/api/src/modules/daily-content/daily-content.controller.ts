import { Controller, Get, HttpCode, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type { Request } from 'express';
import { ApiThrottlerGuard } from '../../common/guards/throttler.guards';
import { GetTodaysDailyContentQuery } from './application/queries/get-todays-daily-content.query';
import { MarkDailyContentSeenCommand } from './application/commands/mark-daily-content-seen.command';
import { GetUserByIdQuery } from '../users/application/queries/get-user-by-id.query';
import type { UserResponseDto } from '../users/application/dtos/user-response.dto';
import { DailyContentPublicDto } from './application/dtos/daily-content-public.dto';

interface JwtUser {
  sub: string;
}

@UseGuards(AuthGuard('jwt'), ApiThrottlerGuard)
@Controller('daily-content')
export class DailyContentController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('today')
  async getToday(@Req() req: Request): Promise<DailyContentPublicDto | null> {
    const { sub } = req.user as JwtUser;
    const user = await this.queryBus.execute<GetUserByIdQuery, UserResponseDto | null>(
      new GetUserByIdQuery(sub),
    );
    if (!user) return null;

    return this.queryBus.execute(
      new GetTodaysDailyContentQuery(sub, user.seenDailyContentIds ?? [], user.triviaOptOut ?? false),
    );
  }

  @Post(':id/seen')
  @HttpCode(200)
  async markSeen(@Req() req: Request, @Param('id') id: string): Promise<{ ok: boolean }> {
    const { sub } = req.user as JwtUser;
    await this.commandBus.execute(new MarkDailyContentSeenCommand(sub, id));
    return { ok: true };
  }
}
