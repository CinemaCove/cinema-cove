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
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { TmdbService } from '../tmdb/tmdb.service';
import { UsersService } from '../users/users.service';
import { AddonConfigsService } from '../addon-configs/addon-configs.service';

const TMDB_LISTS = [
  { listType: 'watchlist' as const, type: 'movie' as const, label: 'Movie Watchlist', icon: 'bookmark' },
  { listType: 'watchlist' as const, type: 'tv' as const, label: 'TV Watchlist', icon: 'bookmark' },
  { listType: 'favorites' as const, type: 'movie' as const, label: 'Favorite Movies', icon: 'favorite' },
  { listType: 'favorites' as const, type: 'tv' as const, label: 'Favorite TV Shows', icon: 'favorite' },
  { listType: 'rated' as const, type: 'movie' as const, label: 'Rated Movies', icon: 'star' },
  { listType: 'rated' as const, type: 'tv' as const, label: 'Rated TV Shows', icon: 'star' },
];

@Controller('integrations')
export class IntegrationsController {
  private readonly configureUrl: string;

  constructor(
    private readonly tmdbService: TmdbService,
    private readonly usersService: UsersService,
    private readonly addonConfigsService: AddonConfigsService,
    configService: ConfigService,
  ) {
    this.configureUrl = configService.getOrThrow<string>('CONFIGURE_URL');
  }

  // ── Status ────────────────────────────────────────────────────────────────

  @Get('tmdb/status')
  @UseGuards(AuthGuard('jwt'))
  async tmdbStatus(@Req() req: Request & { user: { sub: string } }) {
    const user = await this.usersService.findById(req.user.sub);
    return {
      connected: !!user?.tmdbSessionId,
      accountId: user?.tmdbAccountId ?? null,
      username: user?.tmdbUsername ?? null,
    };
  }

  // ── Connect ───────────────────────────────────────────────────────────────

  /**
   * Returns the TMDB authentication URL.
   * Angular opens it via window.location.href so the user can approve on TMDB.
   */
  @Post('tmdb/connect')
  @UseGuards(AuthGuard('jwt'))
  async tmdbConnect(
    @Req() req: Request & { user: { sub: string } },
  ): Promise<{ authUrl: string }> {
    const requestToken = await this.tmdbService.createRequestToken();
    const host = req.get('X-Forwarded-Host') ?? req.get('host');
    const protocol = req.get('X-Forwarded-Proto') ?? req.protocol;
    const callbackUrl = encodeURIComponent(
      `${protocol}://${host}/api/integrations/tmdb/callback?userId=${req.user.sub}`,
    );
    const authUrl = `https://www.themoviedb.org/authenticate/${requestToken}?redirect_to=${callbackUrl}`;
    return { authUrl };
  }

  // ── Callback ──────────────────────────────────────────────────────────────

  @Get('tmdb/callback')
  async tmdbCallback(
    @Query('request_token') requestToken: string,
    @Query('approved') approved: string,
    @Query('userId') userId: string,
    @Res() res: Response,
  ) {
    if (approved !== 'true' || !requestToken || !userId) {
      throw new BadRequestException('TMDB connection was denied or parameters are missing');
    }

    const sessionId = await this.tmdbService.createSession(requestToken);
    const account = await this.tmdbService.getTmdbAccount(sessionId);
    await this.usersService.saveTmdbSession(userId, sessionId, account.id, account.username);

    res.redirect(`${this.configureUrl}/integrations?tmdb=connected`);
  }

  // ── Disconnect ────────────────────────────────────────────────────────────

  @Delete('tmdb/disconnect')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard('jwt'))
  async tmdbDisconnect(@Req() req: Request & { user: { sub: string } }) {
    const user = await this.usersService.findById(req.user.sub);
    if (user?.tmdbSessionId) {
      await this.tmdbService.deleteSession(user.tmdbSessionId);
    }
    await this.usersService.clearTmdbSession(req.user.sub);
  }

  // ── TMDB Lists ────────────────────────────────────────────────────────────

  @Get('tmdb/lists')
  @UseGuards(AuthGuard('jwt'))
  async getTmdbLists(@Req() req: Request & { user: { sub: string } }) {
    const user = await this.usersService.findById(req.user.sub);
    if (!user?.tmdbSessionId || !user?.tmdbAccountId) {
      return { lists: [] };
    }

    const lists = await Promise.all(
      TMDB_LISTS.map(async (def) => {
        const data = await this.tmdbService.getTmdbUserList(
          def.listType,
          def.type,
          user.tmdbAccountId!,
          user.tmdbSessionId!,
          1,
        );
        return {
          listType: def.listType,
          type: def.type,
          label: def.label,
          icon: def.icon,
          totalResults: data.total_results ?? 0,
        };
      }),
    );

    return { lists };
  }

  @Post('tmdb/lists/install')
  @UseGuards(AuthGuard('jwt'))
  async installTmdbList(
    @Req() req: Request & { user: { sub: string } },
    @Body() body: { listType: 'watchlist' | 'favorites' | 'rated'; type: 'movie' | 'tv'; label: string },
  ) {
    const def = TMDB_LISTS.find((d) => d.listType === body.listType && d.type === body.type);
    if (!def) throw new BadRequestException('Invalid list type');

    const doc = await this.addonConfigsService.create(req.user.sub, {
      name: body.label,
      type: body.type,
      languages: [],
      sort: 'popularity.desc',
      source: 'tmdb-list',
      tmdbListType: body.listType,
    });

    const host = req.get('X-Forwarded-Host') ?? req.get('host');
    const installUrl = `stremio://${host}/api/${doc._id}/manifest.json`;

    return { id: doc._id, installUrl };
  }
}
