import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiThrottlerGuard } from '../../common/guards/throttler.guards';
import {
  ConnectTmdbCommand,
  ConnectTraktCommand,
  DisconnectTmdbCommand,
  DisconnectTraktCommand,
  HandleTmdbCallbackCommand,
  HandleTraktCallbackCommand,
  InstallTmdbListCommand,
  InstallTraktListCommand,
} from './application/commands';
import {
  GetTmdbListsQuery,
  GetTmdbStatusQuery,
  GetTraktListsQuery,
  GetTraktStatusQuery,
} from './application/queries';
import type {
  InstallTmdbListBodyDto,
  InstallTraktListBodyDto,
  TmdbListsResponseDto,
  TmdbStatusDto,
  TraktListsResponseDto,
  TraktStatusDto,
  AuthUrlDto,
  InstallListResponseDto,
} from './application/dtos';

@Controller('integrations')
export class IntegrationsController {
  private readonly configureUrl: string;

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    configService: ConfigService,
  ) {
    this.configureUrl = configService.getOrThrow<string>('CONFIGURE_URL');
  }

  // ── TMDB Status ───────────────────────────────────────────────────────────

  @Get('tmdb/status')
  @UseGuards(AuthGuard('jwt'), ApiThrottlerGuard)
  async tmdbStatus(@Req() req: Request & { user: { sub: string } }): Promise<TmdbStatusDto> {
    return this.queryBus.execute(new GetTmdbStatusQuery(req.user.sub));
  }

  // ── TMDB Connect ──────────────────────────────────────────────────────────

  @Post('tmdb/connect')
  @UseGuards(AuthGuard('jwt'), ApiThrottlerGuard)
  async tmdbConnect(@Req() req: Request & { user: { sub: string } }): Promise<AuthUrlDto> {
    const host = req.get('X-Forwarded-Host') ?? req.get('host');
    const protocol = req.get('X-Forwarded-Proto') ?? req.protocol;
    const callbackUrl = `${protocol}://${host}/api/integrations/tmdb/callback?userId=${req.user.sub}`;
    return this.commandBus.execute(new ConnectTmdbCommand(callbackUrl));
  }

  // ── TMDB Callback ─────────────────────────────────────────────────────────

  @Get('tmdb/callback')
  @SkipThrottle()
  async tmdbCallback(
    @Query('request_token') requestToken: string,
    @Query('approved') approved: string,
    @Query('userId') userId: string,
    @Res() res: Response,
  ): Promise<void> {
    if (approved !== 'true' || !requestToken || !userId) {
      throw new BadRequestException('TMDB connection was denied or parameters are missing');
    }
    await this.commandBus.execute(new HandleTmdbCallbackCommand(requestToken, userId));
    res.redirect(`${this.configureUrl}/integrations?tmdb=connected`);
  }

  // ── TMDB Disconnect ───────────────────────────────────────────────────────

  @Delete('tmdb/disconnect')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard('jwt'), ApiThrottlerGuard)
  async tmdbDisconnect(@Req() req: Request & { user: { sub: string } }): Promise<void> {
    await this.commandBus.execute(new DisconnectTmdbCommand(req.user.sub));
  }

  // ── TMDB Lists ────────────────────────────────────────────────────────────

  @Get('tmdb/lists')
  @UseGuards(AuthGuard('jwt'), ApiThrottlerGuard)
  async getTmdbLists(
    @Req() req: Request & { user: { sub: string } },
    @Query('page') pageStr?: string,
  ): Promise<TmdbListsResponseDto> {
    const page = Math.max(1, parseInt(pageStr ?? '1', 10) || 1);
    return this.queryBus.execute(new GetTmdbListsQuery(req.user.sub, page));
  }

  @Post('tmdb/lists/install')
  @UseGuards(AuthGuard('jwt'), ApiThrottlerGuard)
  async installTmdbList(
    @Req() req: Request & { user: { sub: string } },
    @Body() body: InstallTmdbListBodyDto,
  ): Promise<InstallListResponseDto> {
    const host = req.get('X-Forwarded-Host') ?? req.get('host') ?? '';
    return this.commandBus.execute(new InstallTmdbListCommand(req.user.sub, body, host));
  }

  // ── Trakt Status ──────────────────────────────────────────────────────────

  @Get('trakt/status')
  @UseGuards(AuthGuard('jwt'), ApiThrottlerGuard)
  async traktStatus(@Req() req: Request & { user: { sub: string } }): Promise<TraktStatusDto> {
    return this.queryBus.execute(new GetTraktStatusQuery(req.user.sub));
  }

  // ── Trakt Connect ─────────────────────────────────────────────────────────

  @Post('trakt/connect')
  @UseGuards(AuthGuard('jwt'), ApiThrottlerGuard)
  async traktConnect(@Req() req: Request & { user: { sub: string } }): Promise<AuthUrlDto> {
    const host = req.get('X-Forwarded-Host') ?? req.get('host');
    const protocol = req.get('X-Forwarded-Proto') ?? req.protocol;
    const callbackUrl = `${protocol}://${host}/api/integrations/trakt/callback?userId=${req.user.sub}`;
    return this.commandBus.execute(new ConnectTraktCommand(callbackUrl));
  }

  // ── Trakt Callback ────────────────────────────────────────────────────────

  @Get('trakt/callback')
  @SkipThrottle()
  async traktCallback(
    @Query('code') code: string,
    @Query('userId') userId: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    if (!code || !userId) {
      throw new BadRequestException('Trakt connection was denied or parameters are missing');
    }
    const host = req.get('X-Forwarded-Host') ?? req.get('host');
    const protocol = req.get('X-Forwarded-Proto') ?? req.protocol;
    const redirectUri = `${protocol}://${host}/api/integrations/trakt/callback?userId=${userId}`;
    await this.commandBus.execute(new HandleTraktCallbackCommand(code, userId, redirectUri));
    res.redirect(`${this.configureUrl}/integrations?trakt=connected`);
  }

  // ── Trakt Disconnect ──────────────────────────────────────────────────────

  @Delete('trakt/disconnect')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard('jwt'), ApiThrottlerGuard)
  async traktDisconnect(@Req() req: Request & { user: { sub: string } }): Promise<void> {
    await this.commandBus.execute(new DisconnectTraktCommand(req.user.sub));
  }

  // ── Trakt Lists ───────────────────────────────────────────────────────────

  @Get('trakt/lists')
  @UseGuards(AuthGuard('jwt'), ApiThrottlerGuard)
  async getTraktLists(@Req() req: Request & { user: { sub: string } }): Promise<TraktListsResponseDto> {
    return this.queryBus.execute(new GetTraktListsQuery(req.user.sub));
  }

  @Post('trakt/lists/install')
  @UseGuards(AuthGuard('jwt'), ApiThrottlerGuard)
  async installTraktList(
    @Req() req: Request & { user: { sub: string } },
    @Body() body: InstallTraktListBodyDto,
  ): Promise<InstallListResponseDto> {
    const host = req.get('X-Forwarded-Host') ?? req.get('host') ?? '';
    return this.commandBus.execute(new InstallTraktListCommand(req.user.sub, body, host));
  }
}
